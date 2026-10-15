// Tests de l'adaptateur Testmo. Runner intégré à Node (`node --test`), aucune
// dépendance : le réseau est simulé avec `mock.method(globalThis, "fetch")`.

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { afterEach, describe, mock, test } from "node:test";

import {
  applyPlan,
  createClient,
  fetchState,
  folderPaths,
  mergeTags,
  missingFolders,
  prependNote,
  renderJournalRow,
  renderNote,
  resolveSchema,
  snapshotOf,
  tagsFor,
  toApiFields,
  toHtml,
  validateConfig,
  validatePlan,
  validateTagName,
} from "./lib.mjs";

// ─── Fixtures (formes réelles de l'API Testmo v1) ──────────────────

const CONFIG = {
  instance: "https://acme.testmo.net",
  project_id: 7,
  journal: "docs/qa/testmo-journal.md",
  case_template: "Case (steps)",
  history_field: "Change log (auto)",
  language: "fr",
  platforms: ["web"],
};

const MOBILE_CONFIG = { ...CONFIG, platforms: ["ios", "android"] };

const PRIORITY_OPTIONS = [
  { id: 1, value: "High" },
  { id: 2, value: "Normal" },
  { id: 3, value: "Low" },
];

const TEMPLATES = [
  {
    id: 2,
    name: "Case (steps)",
    fields: [
      { id: 3, name: "Description", type: 2 },
      { id: 2, name: "Priority", type: 8, options: PRIORITY_OPTIONS },
      { id: 5, name: "Steps", type: 10 },
      { id: 15, name: "Change log (auto)", type: 2 },
    ],
  },
  { id: 3, name: "Case (text)", fields: [{ id: 3, name: "Description", type: 2 }] },
];

const FIELDS = [
  { id: 2, name: "Priority", system_name: "priority", type: "dropdown" },
  { id: 3, name: "Description", system_name: "description", type: "text" },
  { id: 5, name: "Steps", system_name: "steps", type: "steps" },
  { id: 15, name: "Change log (auto)", system_name: "change_log_auto", type: "text" },
];

const STATES = [
  { id: 6, entity: "run", name: "New" },
  { id: 4, entity: "repository_case", name: "Active" },
  { id: 5, entity: "repository_case", name: "Retired" },
];

const FOLDERS = [
  { id: 10, parent_id: null, name: "Paiement" },
  { id: 11, parent_id: 10, name: "Checkout" },
];

const TAGS = [
  { id: 100, name: "smoke" },
  { id: 101, name: "ai-added" },
];

const RAW_CASES = [
  {
    id: 640,
    name: "Confirmer la commande",
    folder_id: 11,
    state_id: 4,
    template_id: 2,
    tags: [100],
    custom_priority: { id: 2, name: "Normal" },
    custom_steps: [{ text1: "<p>a</p>", text3: "<p>b</p>" }],
    custom_change_log_auto: "<p>ancienne note</p>",
  },
  { id: 641, name: "Annuler la commande", folder_id: 11, state_id: 4, template_id: 2, tags: [100, 101] },
  { id: 601, name: "Payer par virement", folder_id: 10, state_id: 5, template_id: 2, tags: [] },
];

function schemaFor(templates = TEMPLATES, config = CONFIG) {
  return resolveSchema({ templates, fields: FIELDS, states: STATES }, config);
}

function stateFor(config = CONFIG) {
  const { schema, errors } = schemaFor(TEMPLATES, config);
  const folders = folderPaths(FOLDERS);
  const folderNames = new Map([...folders].map(([path, id]) => [id, path]));
  const tagNames = new Map(TAGS.map((t) => [t.id, t.name]));
  const cases = RAW_CASES.map((raw) => {
    const fields = {};
    for (const key of Object.keys(schema.fields)) {
      if (raw[key] === undefined) continue;
      fields[key] = schema.fields[key].type === "dropdown" ? raw[key].name : raw[key];
    }
    return {
      id: raw.id,
      name: raw.name,
      folder: folderNames.get(raw.folder_id),
      folder_id: raw.folder_id,
      state: STATES.find((s) => s.id === raw.state_id).name,
      state_id: raw.state_id,
      tags: raw.tags.map((id) => tagNames.get(id)),
      fields,
    };
  });
  return { schema, errors, folders, folderNames, tags: TAGS, cases };
}

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
}

// Simule l'API : enregistre chaque appel, répond via `routes(method, path, body)`.
function mockFetch(routes) {
  const calls = [];
  mock.method(globalThis, "fetch", async (url, init) => {
    const path = new URL(url).pathname.replace(/^\/api\/v1/, "") + new URL(url).search;
    const body = init.body ? JSON.parse(init.body) : undefined;
    calls.push({ method: init.method, path, body, headers: init.headers });
    return routes(init.method, path, body, calls.length);
  });
  return calls;
}

function okRoutes(method, path, body) {
  if (method === "POST" && path.endsWith("/folders")) {
    return json({ result: body.folders.map((f, i) => ({ id: 900 + i, ...f })) });
  }
  if (method === "POST" && path.endsWith("/cases")) {
    return json({ result: body.cases.map((c, i) => ({ id: 800 + i, name: c.name })) });
  }
  if (method === "PATCH") return json({ result: body.ids.map((id) => ({ id })) });
  return json({ result: [] });
}

function run(plan, overrides = {}) {
  const journal = [];
  const logs = [];
  const promise = applyPlan({
    plan,
    config: CONFIG,
    state: stateFor(overrides.config ?? CONFIG),
    client: createClient({ instance: CONFIG.instance, token: "secret-token", sleep: async () => {} }),
    appendJournal: async (text) => journal.push(text),
    approver: "Ada Lovelace",
    now: new Date("2026-10-20T12:00:00Z"),
    dryRun: false,
    log: (line) => logs.push(line),
    ...overrides,
  });
  return promise.then((result) => ({ result, journal, logs }));
}

const ADD = {
  action: "add",
  folder: "Paiement/Checkout",
  name: "Payer avec Apple Pay",
  fields: { custom_priority: "High", custom_steps: [{ step: "Choisir Apple Pay", expected: "La feuille s'ouvre" }] },
  reason: "Le checkout accepte maintenant Apple Pay (PR #541)",
};

const UPDATE = {
  action: "update",
  case_id: 640,
  fields: { custom_priority: "High" },
  reason: "La confirmation devient critique",
};

const RETIRE = { action: "retire", case_id: 641, reason: "Annulation retirée du produit" };

afterEach(() => mock.restoreAll());

// ─── Configuration ──────────────────────────────────────────────────

describe("validateConfig", () => {
  test("accepts a complete configuration", () => {
    assert.deepEqual(validateConfig(CONFIG), []);
  });

  test("reports missing keys, a bad instance and empty platforms", () => {
    const errors = validateConfig({ ...CONFIG, project_id: "7", instance: "acme.testmo.net/x", platforms: [] });
    assert.ok(errors.some((e) => e.includes("project_id")));
    assert.ok(errors.some((e) => e.includes("instance")));
    assert.ok(errors.some((e) => e.includes("platforms")));
  });

  test("rejects a non-object", () => {
    assert.equal(validateConfig([]).length, 1);
  });
});

// ─── Tags ───────────────────────────────────────────────────────────

describe("tags", () => {
  test("validateTagName refuses colons, commas and empty names", () => {
    assert.equal(validateTagName("ai-added"), null);
    assert.match(validateTagName("ai:added"), /deux-points/);
    assert.match(validateTagName("a,b"), /virgules/);
    assert.match(validateTagName(" "), /vide/);
  });

  test("mergeTags keeps every existing tag and adds new ones once", () => {
    assert.deepEqual(mergeTags(["smoke", "ai-added"], ["ai-added", "ai-updated"]), ["smoke", "ai-added", "ai-updated"]);
  });

  test("tagsFor adds platform tags only on a multi-platform project", () => {
    assert.deepEqual(tagsFor({ action: "add", platforms: ["web"] }, CONFIG), ["ai-added"]);
    assert.deepEqual(tagsFor({ action: "update", platforms: ["ios"] }, MOBILE_CONFIG), ["ai-updated", "ios"]);
    assert.deepEqual(tagsFor({ action: "retire" }, MOBILE_CONFIG), ["ai-retired", "ios", "android"]);
  });
});

// ─── Schéma ─────────────────────────────────────────────────────────

describe("resolveSchema", () => {
  test("resolves template, field keys, history field and Retired state by name", () => {
    const { schema, errors } = schemaFor();
    assert.deepEqual(errors, []);
    assert.equal(schema.templateId, 2);
    assert.equal(schema.historyKey, "custom_change_log_auto");
    assert.equal(schema.retiredStateId, 5);
    assert.deepEqual(Object.keys(schema.fields), [
      "custom_description",
      "custom_priority",
      "custom_steps",
      "custom_change_log_auto",
    ]);
    assert.deepEqual(schema.fields.custom_priority.options, PRIORITY_OPTIONS);
  });

  test("reports a template without the history field", () => {
    const { schema, errors } = schemaFor(TEMPLATES, { ...CONFIG, case_template: "Case (text)" });
    assert.equal(schema.historyKey, null);
    assert.match(errors.join(), /Change log \(auto\).*absent/);
  });

  test("reports an unknown template", () => {
    assert.match(schemaFor(TEMPLATES, { ...CONFIG, case_template: "Nope" }).errors.join(), /introuvable/);
  });
});

// ─── Dossiers ───────────────────────────────────────────────────────

describe("folders", () => {
  test("folderPaths builds full paths", () => {
    assert.deepEqual([...folderPaths(FOLDERS)], [
      ["Paiement", 10],
      ["Paiement/Checkout", 11],
    ]);
  });

  test("missingFolders lists parents before children, once", () => {
    const entries = [{ folder: "Compte/Profil/Photo" }, { folder: " Compte / Profil " }, { folder: "Paiement/Checkout" }];
    assert.deepEqual(missingFolders(entries, folderPaths(FOLDERS)), ["Compte", "Compte/Profil", "Compte/Profil/Photo"]);
  });
});

// ─── Validation du plan ─────────────────────────────────────────────

describe("validatePlan", () => {
  const validate = (entries, state = stateFor(), config = CONFIG) =>
    validatePlan({ entries }, { schema: state.schema, config, cases: state.cases });

  test("accepts a valid add, update and retire", () => {
    assert.deepEqual(validate([ADD, UPDATE, RETIRE]), []);
  });

  test("rejects unknown actions and empty reasons", () => {
    assert.match(validate([{ ...ADD, action: "delete" }]).join(), /action « delete » inconnue/);
    assert.match(validate([{ ...ADD, reason: " " }]).join(), /raison vide/);
  });

  test("requires case_id for update and retire, and forbids it for add", () => {
    assert.match(validate([{ ...UPDATE, case_id: undefined }]).join(), /case_id/);
    assert.match(validate([{ ...ADD, case_id: 1 }]).join(), /interdit/);
    assert.match(validate([{ ...RETIRE, case_id: 999 }]).join(), /#999 introuvable/);
  });

  test("rejects an already retired case and a case listed twice", () => {
    assert.match(validate([{ ...RETIRE, case_id: 601 }]).join(), /déjà retiré/);
    assert.match(validate([UPDATE, { ...RETIRE, case_id: 640 }]).join(), /plus d'une fois/);
  });

  test("rejects an update without any change", () => {
    assert.match(validate([{ action: "update", case_id: 640, reason: "r" }]).join(), /sans aucun changement/);
  });

  test("checks fields and options against the template", () => {
    assert.match(validate([{ ...UPDATE, fields: { custom_unknown: "x" } }]).join(), /absent du template/);
    assert.match(validate([{ ...UPDATE, fields: { custom_priority: "Urgent" } }]).join(), /option « Urgent » inconnue/);
    assert.match(validate([{ ...UPDATE, fields: { custom_steps: "a" } }]).join(), /liste d'étapes/);
  });

  test("forbids writing the history field from the plan", () => {
    const errors = validate([{ ...UPDATE, fields: { custom_change_log_auto: "<p>x</p>" } }]);
    assert.match(errors.join(), /écrit uniquement par le script/);
  });

  test("rejects platforms outside the configuration", () => {
    assert.match(validate([{ ...ADD, platforms: ["ios"] }]).join(), /plateforme « ios » inconnue/);
  });

  test("refuses any write when the history field is missing", () => {
    const state = stateFor();
    state.schema = { ...state.schema, historyKey: null };
    assert.match(validate([ADD], state).join(), /aucune écriture sans trace/);
  });
});

// ─── Conversion et trace ────────────────────────────────────────────

describe("toApiFields", () => {
  test("converts dropdown values to option ids, text to HTML and steps to text1/text3", () => {
    const { schema } = schemaFor();
    const body = toApiFields(
      {
        custom_priority: "Low",
        custom_description: "Ligne 1\nLigne 2\n\n<b>&</b>",
        custom_steps: [{ step: "Ouvrir", expected: "Ouvert" }],
      },
      schema,
    );
    assert.equal(body.custom_priority, 3);
    assert.equal(body.custom_description, "<p>Ligne 1<br>Ligne 2</p><p>&lt;b&gt;&amp;&lt;/b&gt;</p>");
    assert.deepEqual(body.custom_steps, [{ text1: "<p>Ouvrir</p>", text3: "<p>Ouvert</p>" }]);
  });
});

describe("toHtml", () => {
  test("passes real HTML through unchanged", () => {
    assert.equal(toHtml("<p>Déjà <b>formé</b></p>"), "<p>Déjà <b>formé</b></p>");
    assert.equal(toHtml("  </p>"), "  </p>");
  });

  test("escapes plain text that merely starts with <", () => {
    assert.equal(toHtml("< 2 secondes"), "<p>&lt; 2 secondes</p>");
    assert.equal(toHtml("<= 24 h"), "<p>&lt;= 24 h</p>");
  });

  test("keeps null and undefined as is", () => {
    assert.equal(toHtml(null), null);
    assert.equal(toHtml(undefined), undefined);
  });
});

describe("renderNote", () => {
  test("renders date, action, approver, reference link, changes and reason", () => {
    const note = renderNote({
      date: "2026-10-20",
      entry: UPDATE,
      changes: ["Priority : Normal → High"],
      approver: "Ada <Lovelace>",
      reference: { label: "PR #541", url: "https://github.com/acme/app/pull/541" },
      language: "fr",
    });
    assert.equal(
      note,
      '<p><strong>2026-10-20 — Modifié</strong> · proposé par /testmo-plan, approuvé par Ada &lt;Lovelace&gt; · <a href="https://github.com/acme/app/pull/541">PR #541</a></p>' +
        "<ul><li>Priority : Normal → High</li></ul><p>Raison : La confirmation devient critique</p>",
    );
  });

  test("renders English when the project language is en", () => {
    const note = renderNote({ date: "d", entry: RETIRE, changes: [], approver: "A", language: "en" });
    assert.match(note, /Retired<\/strong> · proposed by \/testmo-plan, approved by A/);
    assert.match(note, /Reason : /);
  });

  test("prependNote puts the newest entry first and never rewrites older ones", () => {
    assert.equal(prependNote("<p>old</p>", "<p>new</p>"), "<p>new</p><hr><p>old</p>");
    assert.equal(prependNote(null, "<p>new</p>"), "<p>new</p>");
  });
});

describe("renderJournalRow", () => {
  test("links the case and lists changed fields", () => {
    const row = renderJournalRow({ entry: { ...UPDATE, name: "A | B" }, caseId: 640, caseName: "A | B", config: CONFIG });
    assert.equal(
      row,
      "| Modifié | [#640 A \\| B](https://acme.testmo.net/repositories/7?case_id=640) — `name`, `custom_priority` | web | La confirmation devient critique |\n",
    );
  });
});

// ─── Client HTTP ────────────────────────────────────────────────────

describe("createClient", () => {
  test("exposes no method able to delete", () => {
    const client = createClient({ instance: CONFIG.instance, token: "t" });
    assert.deepEqual(Object.keys(client).sort(), ["get", "paginate", "patch", "post"]);
  });

  test("sends the token as a bearer header and returns JSON", async () => {
    const calls = mockFetch(() => json({ result: { id: 7 } }));
    const client = createClient({ instance: CONFIG.instance, token: "t0k" });
    assert.deepEqual(await client.get("/projects/7"), { result: { id: 7 } });
    assert.equal(calls[0].headers.Authorization, "Bearer t0k");
  });

  test("retries on 429 using Retry-After", async () => {
    const waits = [];
    mockFetch((_m, _p, _b, n) => (n === 1 ? json({}, 429, { "retry-after": "3" }) : json({ result: [] })));
    const client = createClient({ instance: CONFIG.instance, token: "t", sleep: async (ms) => waits.push(ms) });
    assert.deepEqual(await client.get("/projects/7/tags"), { result: [] });
    assert.deepEqual(waits, [3000]);
  });

  test("throws a TestmoError with the API message on failure", async () => {
    mockFetch(() => json({ message: "invalid tag names" }, 422));
    const client = createClient({ instance: CONFIG.instance, token: "t" });
    await assert.rejects(client.patch("/projects/7/cases", { ids: [1] }), (error) => {
      assert.equal(error.status, 422);
      assert.match(error.message, /422 invalid tag names/);
      return true;
    });
  });

  test("paginate follows next_page and merges expands", async () => {
    const calls = mockFetch((_m, path) =>
      /[?&]page=1(&|$)/.test(path)
        ? json({ result: [{ id: 1 }], next_page: 2, expands: { tags: [{ id: 1 }] } })
        : json({ result: [{ id: 2 }], next_page: null, expands: { tags: [{ id: 2 }] } }),
    );
    const client = createClient({ instance: CONFIG.instance, token: "t" });
    const page = await client.paginate("/projects/7/cases?expands=fields");
    assert.deepEqual(page.result, [{ id: 1 }, { id: 2 }]);
    assert.deepEqual(page.expands.tags, [{ id: 1 }, { id: 2 }]);
    assert.equal(calls[0].path, "/projects/7/cases?expands=fields&page=1&per_page=100");
  });
});

// ─── État et snapshot ───────────────────────────────────────────────

describe("fetchState", () => {
  test("normalizes cases with folder paths, tag names and option values", async () => {
    mockFetch((_m, path) => {
      if (path.startsWith("/projects/7/templates")) return json({ result: TEMPLATES });
      if (path.startsWith("/projects/7/fields")) return json({ result: FIELDS, next_page: null });
      if (path.startsWith("/projects/7/states")) return json({ result: STATES });
      if (path.startsWith("/projects/7/folders")) return json({ result: FOLDERS, next_page: null });
      if (path.startsWith("/projects/7/tags")) return json({ result: TAGS });
      if (path.startsWith("/projects/7/cases")) {
        // Comme l'API réelle : `tags` n'est renvoyé qu'avec `expands=tags`.
        const withTags = /expands=[^&]*\btags\b/.test(path);
        const cases = RAW_CASES.map(({ tags, ...rest }) => (withTags ? { ...rest, tags } : rest));
        return json({ result: cases, next_page: null });
      }
      return json({}, 404);
    });
    const state = await fetchState(createClient({ instance: CONFIG.instance, token: "t" }), CONFIG);
    const confirm = state.cases.find((c) => c.id === 640);
    assert.equal(confirm.folder, "Paiement/Checkout");
    assert.deepEqual(confirm.tags, ["smoke"]);
    assert.equal(confirm.fields.custom_priority, "Normal");
    assert.equal(confirm.fields.custom_change_log_auto, "<p>ancienne note</p>");

    const snapshot = snapshotOf(state, CONFIG);
    assert.equal(snapshot.template.history_field, "custom_change_log_auto");
    assert.equal(snapshot.cases[0].fields.custom_change_log_auto, undefined);
    assert.equal(snapshot.cases[0].raw, undefined);
  });
});

// ─── Application du plan ────────────────────────────────────────────

describe("applyPlan", () => {
  test("sends one PATCH per updated or retired case", async () => {
    const calls = mockFetch(okRoutes);
    const { result } = await run({ entries: [UPDATE, RETIRE] });
    assert.equal(result.ok, true);
    const patches = calls.filter((c) => c.method === "PATCH");
    assert.deepEqual(patches.map((p) => p.body.ids), [[640], [641]]);
    for (const patch of patches) assert.equal(patch.body.ids.length, 1);
  });

  test("keeps existing tags and adds the ai-* tag", async () => {
    const calls = mockFetch(okRoutes);
    await run({ entries: [UPDATE, RETIRE] });
    const [update, retire] = calls.filter((c) => c.method === "PATCH");
    assert.deepEqual(update.body.tags, ["smoke", "ai-updated"]);
    assert.deepEqual(retire.body.tags, ["smoke", "ai-added", "ai-retired"]);
  });

  test("writes the note in the same request, before the previous ones", async () => {
    const calls = mockFetch(okRoutes);
    await run({ reference: { label: "PR #541" }, entries: [UPDATE] });
    const [patch] = calls.filter((c) => c.method === "PATCH");
    assert.equal(patch.body.custom_priority, 1);
    assert.match(patch.body.custom_change_log_auto, /^<p><strong>2026-10-20 — Modifié<\/strong>/);
    assert.match(patch.body.custom_change_log_auto, /Priority : Normal → High/);
    assert.match(patch.body.custom_change_log_auto, /<hr><p>ancienne note<\/p>$/);
  });

  test("retires by switching to the Retired state", async () => {
    const calls = mockFetch(okRoutes);
    await run({ entries: [RETIRE] });
    const [patch] = calls.filter((c) => c.method === "PATCH");
    assert.equal(patch.body.state_id, 5);
    assert.match(patch.body.custom_change_log_auto, /État : Active → Retired/);
  });

  test("creates missing folders first, then cases in batches of 100", async () => {
    const calls = mockFetch(okRoutes);
    const adds = Array.from({ length: 101 }, (_, i) => ({ ...ADD, folder: "Compte/Profil", name: `Cas ${i}` }));
    const { result, journal } = await run({ entries: adds });
    assert.equal(result.ok, true);
    assert.deepEqual(
      calls.map((c) => `${c.method} ${c.path}`),
      ["POST /projects/7/folders", "POST /projects/7/folders", "POST /projects/7/cases", "POST /projects/7/cases"],
    );
    assert.deepEqual(calls[1].body, { folders: [{ name: "Profil", parent_id: 900 }] });
    assert.equal(calls[2].body.cases.length, 100);
    assert.equal(calls[3].body.cases.length, 1);
    const created = calls[2].body.cases[0];
    assert.equal(created.folder_id, 900);
    assert.equal(created.template_id, 2);
    assert.deepEqual(created.tags, ["ai-added"]);
    assert.match(created.custom_change_log_auto, /Ajouté.*Cas créé/);
    assert.equal(journal.length, 1 + 101);
  });

  test("appends a journal section with one row per applied entry", async () => {
    mockFetch(okRoutes);
    const { journal } = await run({ reference: { label: "PR #541" }, entries: [ADD, RETIRE] });
    assert.equal(journal[0], "\n## 2026-10-20 — PR #541 — Ada Lovelace\n\n| Action | Cas | Plateformes | Raison |\n|---|---|---|---|\n");
    assert.match(journal[1], /^\| Ajouté \| \[#800 Payer avec Apple Pay\]/);
    assert.match(journal[2], /^\| Retiré \| \[#641 Annuler la commande\]/);
  });

  test("never issues a DELETE", async () => {
    const calls = mockFetch(okRoutes);
    await run({ entries: [ADD, UPDATE, RETIRE] });
    assert.ok(calls.length > 0);
    assert.ok(calls.every((c) => c.method !== "DELETE"));
  });

  test("stops on failure and reports exactly what remains", async () => {
    mockFetch((method, path, body, n) => (method === "PATCH" && body.ids[0] === 641 ? json({ message: "boom" }, 500) : okRoutes(method, path, body, n)));
    const { result, journal } = await run({ entries: [UPDATE, RETIRE] });
    assert.equal(result.ok, false);
    assert.match(result.errors[0], /500 boom/);
    assert.deepEqual(result.applied.map((a) => a.caseId), [640]);
    assert.deepEqual(result.remaining.map((e) => e.case_id), [641]);
    assert.equal(journal.length, 2);
  });

  test("dry-run logs the requests without sending them nor writing the journal", async () => {
    const calls = mockFetch(okRoutes);
    const { result, journal, logs } = await run({ entries: [ADD, UPDATE] }, { dryRun: true });
    assert.equal(result.ok, true);
    assert.equal(calls.length, 0);
    assert.equal(journal.length, 0);
    assert.ok(logs.every((line) => line.startsWith("[dry-run] ")));
    assert.equal(logs.length, 2);
  });

  test("refuses to write without the history field", async () => {
    const calls = mockFetch(okRoutes);
    const state = stateFor();
    state.schema = { ...state.schema, historyKey: null };
    const { result } = await run({ entries: [UPDATE] }, { state });
    assert.equal(result.ok, false);
    assert.equal(calls.length, 0);
  });

  test("refuses to write without a known approver", async () => {
    const calls = mockFetch(okRoutes);
    const { result } = await run({ entries: [UPDATE] }, { approver: "" });
    assert.match(result.errors.join(), /git config user.name/);
    assert.equal(calls.length, 0);
  });

  test("tags platforms on a multi-platform project", async () => {
    const calls = mockFetch(okRoutes);
    const { journal } = await run({ entries: [{ ...UPDATE, platforms: ["ios"] }] }, { config: MOBILE_CONFIG });
    const [patch] = calls.filter((c) => c.method === "PATCH");
    assert.deepEqual(patch.body.tags, ["smoke", "ai-updated", "ios"]);
    assert.match(journal[1], /\| ios \|/);
  });
});

// ─── Source ─────────────────────────────────────────────────────────

describe("source", () => {
  test("no adapter file contains a DELETE instruction", async () => {
    for (const file of ["lib.mjs", "testmo.mjs"]) {
      const source = await readFile(new URL(file, import.meta.url), "utf8");
      assert.ok(!source.includes("DELETE"), `${file} contient « DELETE »`);
    }
  });
});
