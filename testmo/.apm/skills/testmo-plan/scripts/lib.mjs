// Logique de l'adaptateur Testmo : configuration, schéma du template, validation
// et application d'un plan, rendu de la trace (note sur le cas + journal du repo).
//
// Aucune I/O directe : le réseau passe par un client créé avec `createClient`
// (fetch injectable), le journal par une fonction `appendJournal` injectée.
// Testé par lib.test.mjs (`node --test`, aucune dépendance).
//
// Règles dures :
// - aucune suppression : le client n'accepte que GET, POST et PATCH ;
// - un PATCH par cas (le PATCH de Testmo applique les mêmes valeurs à tous les ids) ;
// - aucune écriture sans trace : champ d'historique requis, tags `ai-*` posés ;
// - les tags existants d'un cas sont toujours conservés (union).

export const ACTIONS = ["add", "update", "retire"];
export const AI_TAGS = { add: "ai-added", update: "ai-updated", retire: "ai-retired" };
export const CREATE_BATCH_SIZE = 100;
export const PER_PAGE = 100;
export const ALLOWED_METHODS = ["GET", "POST", "PATCH"];

const RETIRED_STATE = "Retired";
const CASE_ENTITY = "repository_case";
const MAX_RETRIES = 5;

const STRINGS = {
  fr: {
    add: "Ajouté",
    update: "Modifié",
    retire: "Retiré",
    trace: (approver) => `proposé par /testmo-plan, approuvé par ${approver}`,
    reason: "Raison",
    created: "Cas créé",
    name: "Nom",
    folder: "Dossier",
    state: "État",
    edited: "modifié",
    tableHeader: "| Action | Cas | Plateformes | Raison |",
  },
  en: {
    add: "Added",
    update: "Updated",
    retire: "Retired",
    trace: (approver) => `proposed by /testmo-plan, approved by ${approver}`,
    reason: "Reason",
    created: "Case created",
    name: "Name",
    folder: "Folder",
    state: "State",
    edited: "edited",
    tableHeader: "| Action | Case | Platforms | Reason |",
  },
};

export function strings(language) {
  return STRINGS[language] ?? STRINGS.en;
}

// ─── Configuration ──────────────────────────────────────────────────

const REQUIRED_CONFIG = {
  instance: "string",
  project_id: "number",
  journal: "string",
  case_template: "string",
  history_field: "string",
  language: "string",
};

export function validateConfig(config) {
  const errors = [];
  if (config === null || typeof config !== "object" || Array.isArray(config)) {
    return ["la configuration doit être un objet JSON"];
  }
  for (const [key, type] of Object.entries(REQUIRED_CONFIG)) {
    if (typeof config[key] !== type || config[key] === "") {
      errors.push(`« ${key} » manquant ou invalide (${type} attendu)`);
    }
  }
  if (typeof config.instance === "string" && !/^https:\/\/[^/]+$/.test(config.instance)) {
    errors.push("« instance » doit être une URL https sans chemin (ex. https://acme.testmo.net)");
  }
  if (
    !Array.isArray(config.platforms) ||
    config.platforms.length === 0 ||
    !config.platforms.every((p) => typeof p === "string" && validateTagName(p) === null)
  ) {
    errors.push("« platforms » doit être une liste non vide de noms (ex. [\"web\"])");
  }
  if (config.sources !== undefined && !Array.isArray(config.sources)) {
    errors.push("« sources » doit être une liste");
  }
  return errors;
}

export function parseConfig(text) {
  let config;
  try {
    config = JSON.parse(text);
  } catch (error) {
    throw new Error(`configuration illisible : ${error.message}`);
  }
  const errors = validateConfig(config);
  if (errors.length > 0) throw new Error(`configuration invalide : ${errors.join(" ; ")}`);
  return config;
}

// ─── Tags ───────────────────────────────────────────────────────────

// Testmo refuse les deux-points dans un nom de tag (422 « invalid tag names »).
export function validateTagName(name) {
  if (typeof name !== "string" || name.trim() === "") return "nom de tag vide";
  if (name.includes(":")) return `tag « ${name} » : les deux-points sont refusés par Testmo`;
  if (name.includes(",")) return `tag « ${name} » : les virgules sont refusées`;
  return null;
}

export function mergeTags(existing, additions) {
  const result = [...existing];
  for (const tag of additions) if (!result.includes(tag)) result.push(tag);
  return result;
}

// Tags ajoutés par une entrée : `ai-*` toujours, plateformes seulement sur un projet multiplateforme.
export function tagsFor(entry, config) {
  const tags = [AI_TAGS[entry.action]];
  if (config.platforms.length > 1) tags.push(...platformsFor(entry, config));
  return tags;
}

export function platformsFor(entry, config) {
  return entry.platforms ?? config.platforms;
}

// ─── Schéma du template ─────────────────────────────────────────────

export function fieldKey(field) {
  return `custom_${field.system_name}`;
}

// Résout par nom le template de cas, ses champs (clé API, type, options), le champ
// d'historique et l'état Retired. Aucun ID figé dans le code.
export function resolveSchema({ templates, fields, states }, config) {
  const errors = [];
  const template = templates.find((t) => t.name === config.case_template);
  if (!template) {
    errors.push(
      `template « ${config.case_template} » introuvable (disponibles : ${templates.map((t) => t.name).join(", ")})`,
    );
  }

  const retired = states.find((s) => s.entity === CASE_ENTITY && s.name === RETIRED_STATE);
  if (!retired) errors.push(`état « ${RETIRED_STATE} » introuvable pour les cas`);

  const byId = new Map(fields.map((f) => [f.id, f]));
  const schemaFields = {};
  let historyKey = null;

  for (const templateField of template?.fields ?? []) {
    const field = byId.get(templateField.id);
    if (!field) continue;
    const key = fieldKey(field);
    schemaFields[key] = {
      key,
      id: field.id,
      name: templateField.name,
      type: field.type,
      options: templateField.options ?? [],
    };
    if (templateField.name === config.history_field) historyKey = key;
  }

  if (template && !historyKey) {
    errors.push(
      `champ d'historique « ${config.history_field} » absent du template « ${config.case_template} » — demander à un admin Testmo de l'y ajouter`,
    );
  }

  return {
    errors,
    schema: {
      templateId: template?.id ?? null,
      templateName: config.case_template,
      fields: schemaFields,
      historyKey,
      retiredStateId: retired?.id ?? null,
      states: states.filter((s) => s.entity === CASE_ENTITY),
    },
  };
}

// ─── Dossiers ───────────────────────────────────────────────────────

export function folderPaths(folders) {
  const byId = new Map(folders.map((f) => [f.id, f]));
  const pathOf = (folder) => {
    const parts = [];
    for (let current = folder; current; current = byId.get(current.parent_id)) parts.unshift(current.name);
    return parts.join("/");
  };
  const paths = new Map();
  for (const folder of folders) paths.set(pathOf(folder), folder.id);
  return paths;
}

export function normalizeFolder(path) {
  return path
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .join("/");
}

// Chemins à créer, parents avant enfants.
export function missingFolders(entries, existingPaths) {
  const missing = [];
  for (const entry of entries) {
    if (!entry.folder) continue;
    const parts = normalizeFolder(entry.folder).split("/");
    for (let i = 1; i <= parts.length; i++) {
      const path = parts.slice(0, i).join("/");
      if (!existingPaths.has(path) && !missing.includes(path)) missing.push(path);
    }
  }
  return missing;
}

// ─── Cas : lecture normalisée ───────────────────────────────────────

export function normalizeCase(rawCase, { schema, tagNames, folderNames }) {
  const fields = {};
  for (const key of Object.keys(schema.fields)) {
    if (rawCase[key] === undefined) continue;
    const value = rawCase[key];
    if (schema.fields[key].type === "dropdown") fields[key] = value?.name ?? null;
    else if (schema.fields[key].type === "steps") {
      fields[key] = (value ?? []).map((step) => ({ text1: step.text1 ?? null, text3: step.text3 ?? null }));
    } else fields[key] = value;
  }
  return {
    id: rawCase.id,
    name: rawCase.name,
    folder: folderNames.get(rawCase.folder_id) ?? null,
    folder_id: rawCase.folder_id,
    state: schema.states.find((s) => s.id === rawCase.state_id)?.name ?? null,
    state_id: rawCase.state_id,
    template_id: rawCase.template_id,
    tags: (rawCase.tags ?? []).map((id) => tagNames.get(id)).filter(Boolean),
    fields,
  };
}

// ─── Validation du plan ─────────────────────────────────────────────

export function validatePlan(plan, { schema, config, cases }) {
  const errors = [];
  if (!plan || typeof plan !== "object" || !Array.isArray(plan.entries)) {
    return ["le plan doit être un objet avec une liste « entries »"];
  }
  if (!schema.historyKey) {
    errors.push(`champ d'historique « ${config.history_field} » absent : aucune écriture sans trace`);
  }
  if (plan.reference !== undefined && typeof plan.reference?.label !== "string") {
    errors.push("« reference » doit avoir un « label » (ex. « PR #541 »)");
  }

  const casesById = new Map(cases.map((c) => [c.id, c]));
  const seen = new Set();

  plan.entries.forEach((entry, index) => {
    const at = `entrée ${index + 1}`;
    if (!ACTIONS.includes(entry.action)) {
      errors.push(`${at} : action « ${entry.action} » inconnue (${ACTIONS.join(", ")})`);
      return;
    }
    if (typeof entry.reason !== "string" || entry.reason.trim() === "") {
      errors.push(`${at} : raison vide`);
    }

    if (entry.action === "add") {
      if (entry.case_id !== undefined) errors.push(`${at} : « case_id » interdit pour un ajout`);
      if (typeof entry.name !== "string" || entry.name.trim() === "") errors.push(`${at} : « name » requis`);
      if (typeof entry.folder !== "string" || normalizeFolder(entry.folder) === "") {
        errors.push(`${at} : « folder » requis pour un ajout`);
      }
    } else {
      if (!Number.isInteger(entry.case_id)) {
        errors.push(`${at} : « case_id » entier requis pour « ${entry.action} »`);
      } else if (!casesById.has(entry.case_id)) {
        errors.push(`${at} : cas #${entry.case_id} introuvable dans le projet`);
      } else if (casesById.get(entry.case_id).state_id === schema.retiredStateId) {
        errors.push(`${at} : cas #${entry.case_id} déjà retiré`);
      } else if (seen.has(entry.case_id)) {
        errors.push(`${at} : cas #${entry.case_id} présent plus d'une fois dans le plan`);
      }
      seen.add(entry.case_id);
    }

    if (
      entry.action === "update" &&
      entry.name === undefined &&
      entry.folder === undefined &&
      Object.keys(entry.fields ?? {}).length === 0
    ) {
      errors.push(`${at} : modification sans aucun changement (name, folder ou fields)`);
    }

    if (entry.folder !== undefined && entry.action === "retire") {
      errors.push(`${at} : « folder » sans effet sur un retrait`);
    }

    if (entry.platforms !== undefined) {
      if (!Array.isArray(entry.platforms) || entry.platforms.length === 0) {
        errors.push(`${at} : « platforms » doit être une liste non vide`);
      } else {
        for (const platform of entry.platforms) {
          if (!config.platforms.includes(platform)) {
            errors.push(`${at} : plateforme « ${platform} » inconnue (${config.platforms.join(", ")})`);
          }
        }
      }
    }

    for (const tag of tagsFor({ ...entry, platforms: entry.platforms }, config)) {
      const error = validateTagName(tag);
      if (error) errors.push(`${at} : ${error}`);
    }

    errors.push(...validateFields(entry.fields ?? {}, schema).map((error) => `${at} : ${error}`));
    if (entry.action === "retire" && entry.fields && Object.keys(entry.fields).length > 0) {
      errors.push(`${at} : un retrait ne modifie aucun champ`);
    }
  });

  return errors;
}

function validateFields(fields, schema) {
  const errors = [];
  if (typeof fields !== "object" || Array.isArray(fields)) return ["« fields » doit être un objet"];
  for (const [key, value] of Object.entries(fields)) {
    const field = schema.fields[key];
    if (!field) {
      errors.push(`champ « ${key} » absent du template « ${schema.templateName} »`);
      continue;
    }
    if (key === schema.historyKey) {
      errors.push(`le champ d'historique « ${field.name} » est écrit uniquement par le script`);
      continue;
    }
    if (field.type === "dropdown" && !field.options.some((o) => o.value === value)) {
      errors.push(
        `« ${key} » : option « ${value} » inconnue (${field.options.map((o) => o.value).join(", ")})`,
      );
    }
    if (field.type === "steps" && !isSteps(value)) {
      errors.push(`« ${key} » : liste d'étapes attendue ([{ "step": "…", "expected": "…" }])`);
    }
  }
  return errors;
}

function isSteps(value) {
  return Array.isArray(value) && value.every((s) => s && typeof s === "object" && !Array.isArray(s));
}

// ─── Valeurs envoyées à l'API ───────────────────────────────────────

export function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// Les champs texte de Testmo sont du texte enrichi (HTML). Un texte brut devient des paragraphes.
// Seul un vrai début de balise (`<p>`, `</…>`, `<!…>`) est pris pour du HTML : un texte
// comme « < 2 secondes » est échappé.
export function toHtml(text) {
  if (text === null || text === undefined) return text;
  const value = String(text);
  if (/^\s*<[a-zA-Z/!]/.test(value)) return value;
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`)
    .join("");
}

export function toApiFields(fields, schema) {
  const body = {};
  for (const [key, value] of Object.entries(fields ?? {})) {
    const field = schema.fields[key];
    if (field.type === "dropdown") body[key] = field.options.find((o) => o.value === value).id;
    else if (field.type === "steps") {
      body[key] = value.map((step) => ({
        text1: toHtml(step.step ?? step.text1 ?? ""),
        text3: toHtml(step.expected ?? step.text3 ?? ""),
      }));
    } else if (field.type === "text") body[key] = toHtml(value);
    else body[key] = value;
  }
  return body;
}

// ─── Trace : résumé des changements, note Testmo, journal ──────────

export function summarizeChanges(entry, current, { schema, language, folderOf }) {
  const t = strings(language);
  if (entry.action === "add") return [t.created];
  if (entry.action === "retire") return [`${t.state} : ${current.state ?? "?"} → ${RETIRED_STATE}`];

  const changes = [];
  if (entry.name !== undefined && entry.name !== current.name) {
    changes.push(`${t.name} : ${current.name} → ${entry.name}`);
  }
  const folder = entry.folder !== undefined ? normalizeFolder(entry.folder) : undefined;
  if (folder !== undefined && folder !== folderOf(current)) {
    changes.push(`${t.folder} : ${folderOf(current) ?? "?"} → ${folder}`);
  }
  for (const [key, value] of Object.entries(entry.fields ?? {})) {
    const field = schema.fields[key];
    const before = current.fields[key];
    if (field.type === "dropdown") {
      if (before !== value) changes.push(`${field.name} : ${before ?? "—"} → ${value}`);
    } else if (field.type === "steps") {
      changes.push(`${field.name} : ${(before ?? []).length} → ${value.length}`);
    } else {
      changes.push(`${field.name} : ${t.edited}`);
    }
  }
  return changes;
}

export function changedKeys(entry) {
  const keys = Object.keys(entry.fields ?? {});
  if (entry.name !== undefined) keys.unshift("name");
  if (entry.folder !== undefined) keys.unshift("folder");
  return keys;
}

function referenceHtml(reference) {
  if (!reference) return "";
  const label = escapeHtml(reference.label);
  return reference.url ? ` · <a href="${escapeHtml(reference.url)}">${label}</a>` : ` · ${label}`;
}

export function renderNote({ date, entry, changes, approver, reference, language }) {
  const t = strings(language);
  const items = changes.map((change) => `<li>${escapeHtml(change)}</li>`).join("");
  return (
    `<p><strong>${date} — ${t[entry.action]}</strong> · ${escapeHtml(t.trace(approver))}${referenceHtml(reference)}</p>` +
    (items ? `<ul>${items}</ul>` : "") +
    `<p>${t.reason} : ${escapeHtml(entry.reason)}</p>`
  );
}

// L'entrée la plus récente en tête ; les entrées précédentes ne sont jamais réécrites.
export function prependNote(existing, note) {
  return existing ? `${note}<hr>${existing}` : note;
}

export function caseUrl(config, caseId) {
  return `${config.instance}/repositories/${config.project_id}?case_id=${caseId}`;
}

function cell(text) {
  return String(text).replaceAll("|", "\\|").replaceAll("\n", " ");
}

export function renderJournalHeader({ date, reference, author, language }) {
  const parts = [date, reference?.label, author].filter(Boolean).map(cell);
  return `\n## ${parts.join(" — ")}\n\n${strings(language).tableHeader}\n|---|---|---|---|\n`;
}

export function renderJournalRow({ entry, caseId, caseName, config }) {
  const t = strings(config.language);
  const keys = entry.action === "update" ? changedKeys(entry) : [];
  const fields = keys.length > 0 ? ` — ${keys.map((k) => `\`${k}\``).join(", ")}` : "";
  const link = `[#${caseId} ${cell(caseName)}](${caseUrl(config, caseId)})`;
  const platforms = platformsFor(entry, config).join(", ");
  return `| ${t[entry.action]} | ${link}${fields} | ${cell(platforms)} | ${cell(entry.reason)} |\n`;
}

// ─── Client HTTP ────────────────────────────────────────────────────

export class TestmoError extends Error {
  constructor(message, { status, body } = {}) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export function createClient({ instance, token, fetchImpl = globalThis.fetch, sleep = defaultSleep }) {
  const base = `${instance}/api/v1`;

  async function request(method, path, body) {
    if (!ALLOWED_METHODS.includes(method)) {
      throw new TestmoError(`méthode ${method} refusée : l'adaptateur ne supprime jamais rien`);
    }
    for (let attempt = 1; ; attempt++) {
      const response = await fetchImpl(`${base}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (response.status === 429 && attempt <= MAX_RETRIES) {
        const retryAfter = Number(response.headers.get("retry-after"));
        await sleep((Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : attempt) * 1000);
        continue;
      }

      const text = await response.text();
      const json = text ? safeJson(text) : null;
      if (!response.ok) {
        const detail = json?.message ?? text.slice(0, 200);
        throw new TestmoError(`${method} ${path} → ${response.status} ${detail}`, {
          status: response.status,
          body: json ?? text,
        });
      }
      return json;
    }
  }

  async function paginate(path) {
    const results = [];
    const expands = {};
    const separator = path.includes("?") ? "&" : "?";
    for (let page = 1; page; ) {
      const json = await request("GET", `${path}${separator}page=${page}&per_page=${PER_PAGE}`);
      results.push(...(json.result ?? []));
      for (const [key, values] of Object.entries(json.expands ?? {})) {
        expands[key] = [...(expands[key] ?? []), ...values];
      }
      page = json.next_page ?? null;
    }
    return { result: results, expands };
  }

  return {
    get: (path) => request("GET", path),
    post: (path, body) => request("POST", path, body),
    patch: (path, body) => request("PATCH", path, body),
    paginate,
  };
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function defaultSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── État du projet ─────────────────────────────────────────────────

export async function fetchState(client, config) {
  const project = `/projects/${config.project_id}`;
  const [templates, fields, states, folders, tags] = await Promise.all([
    client.get(`${project}/templates`).then((json) => json.result),
    client.paginate(`${project}/fields`).then((json) => json.result),
    client.get(`${project}/states`).then((json) => json.result),
    client.paginate(`${project}/folders`).then((json) => json.result),
    client.get(`${project}/tags`).then((json) => json.result),
  ]);
  // `tags` n'est renvoyé qu'avec l'expand du même nom : sans lui, l'union des tags
  // partirait d'une liste vide et un PATCH effacerait les tags existants.
  const rawCases = (await client.paginate(`${project}/cases?expands=fields,tags`)).result;

  const { schema, errors } = resolveSchema({ templates, fields, states }, config);
  const paths = folderPaths(folders);
  const folderNames = new Map([...paths].map(([path, id]) => [id, path]));
  const tagNames = new Map(tags.map((tag) => [tag.id, tag.name]));
  const cases = rawCases.map((c) => ({
    ...normalizeCase(c, { schema, tagNames, folderNames }),
    raw: c,
  }));

  return { schema, errors, folders: paths, folderNames, tags, cases };
}

export function snapshotOf(state, config) {
  return {
    project_id: config.project_id,
    language: config.language,
    platforms: config.platforms,
    template: {
      name: state.schema.templateName,
      history_field: state.schema.historyKey,
      fields: Object.values(state.schema.fields).map(({ key, name, type, options }) => ({
        key,
        name,
        type,
        ...(options.length > 0 ? { options: options.map((o) => o.value) } : {}),
      })),
    },
    states: state.schema.states.map((s) => s.name),
    folders: [...state.folders.keys()].sort(),
    cases: state.cases.map(({ raw, folder_id, state_id, template_id, ...rest }) => {
      const { [state.schema.historyKey]: _history, ...fields } = rest.fields;
      return { ...rest, fields };
    }),
  };
}

// ─── Application du plan ────────────────────────────────────────────

// Applique un plan validé. Chaque opération réussie écrit sa note sur le cas (dans la
// même requête) puis sa ligne de journal. En cas d'échec, s'arrête et rapporte les
// entrées restantes : la note et le journal reflètent exactement ce qui a été appliqué.
export async function applyPlan({ plan, config, state, client, appendJournal, approver, now, dryRun, log }) {
  const errors = [...state.errors, ...validatePlan(plan, { schema: state.schema, config, cases: state.cases })];
  if (!approver) errors.push("auteur inconnu (git config user.name) : aucune écriture sans trace");
  if (errors.length > 0) return { ok: false, errors, applied: [], remaining: plan.entries ?? [] };

  const { schema } = state;
  const project = `/projects/${config.project_id}`;
  const date = now.toISOString().slice(0, 10);
  const casesById = new Map(state.cases.map((c) => [c.id, c]));
  const folders = new Map(state.folders);
  const folderOf = (c) => c.folder;
  const applied = [];
  let journalStarted = false;

  const send = async (method, path, body) => {
    log(`${dryRun ? "[dry-run] " : ""}${method} ${path} ${JSON.stringify(body)}`);
    if (dryRun) return null;
    return method === "POST" ? client.post(path, body) : client.patch(path, body);
  };

  const journal = async (entry, caseId, caseName) => {
    if (dryRun) return;
    if (!journalStarted) {
      await appendJournal(renderJournalHeader({ date, reference: plan.reference, author: approver, language: config.language }));
      journalStarted = true;
    }
    await appendJournal(renderJournalRow({ entry, caseId, caseName, config }));
  };

  const note = (entry, current) =>
    renderNote({
      date,
      entry,
      changes: summarizeChanges(entry, current, { schema, language: config.language, folderOf }),
      approver,
      reference: plan.reference,
      language: config.language,
    });

  const adds = plan.entries.filter((e) => e.action === "add");
  const updates = plan.entries.filter((e) => e.action === "update");
  const retires = plan.entries.filter((e) => e.action === "retire");
  const ordered = [...adds, ...updates, ...retires];

  const fail = (error, entriesLeft) => ({
    ok: false,
    errors: [error.message],
    applied,
    remaining: entriesLeft,
  });

  // 1. Dossiers manquants, parents d'abord.
  for (const path of missingFolders([...adds, ...updates], folders)) {
    const parts = path.split("/");
    const parentPath = parts.slice(0, -1).join("/");
    const body = { folders: [{ name: parts.at(-1), ...(parentPath ? { parent_id: folders.get(parentPath) } : {}) }] };
    try {
      const json = await send("POST", `${project}/folders`, body);
      folders.set(path, json?.result?.[0]?.id ?? `<nouveau:${path}>`);
    } catch (error) {
      return fail(error, ordered);
    }
  }

  // 2. Ajouts, par lots de 100 (note d'historique incluse dans la création).
  for (let i = 0; i < adds.length; i += CREATE_BATCH_SIZE) {
    const batch = adds.slice(i, i + CREATE_BATCH_SIZE);
    const body = {
      cases: batch.map((entry) => ({
        name: entry.name,
        folder_id: folders.get(normalizeFolder(entry.folder)),
        template_id: schema.templateId,
        tags: tagsFor(entry, config),
        ...toApiFields(entry.fields, schema),
        [schema.historyKey]: note(entry, null),
      })),
    };
    let json;
    try {
      json = await send("POST", `${project}/cases`, body);
    } catch (error) {
      return fail(error, ordered.slice(applied.length));
    }
    for (const [index, entry] of batch.entries()) {
      const caseId = json?.result?.[index]?.id ?? "?";
      applied.push({ entry, caseId });
      await journal(entry, caseId, entry.name);
    }
  }

  // 3. Modifications et retraits : un PATCH par cas, tags relus et unis.
  for (const entry of [...updates, ...retires]) {
    const current = casesById.get(entry.case_id);
    const body = {
      ids: [entry.case_id],
      tags: mergeTags(current.tags, tagsFor(entry, config)),
      [schema.historyKey]: prependNote(current.fields[schema.historyKey], note(entry, current)),
    };
    if (entry.action === "retire") {
      body.state_id = schema.retiredStateId;
    } else {
      if (entry.name !== undefined) body.name = entry.name;
      if (entry.folder !== undefined) body.folder_id = folders.get(normalizeFolder(entry.folder));
      Object.assign(body, toApiFields(entry.fields, schema));
    }
    try {
      await send("PATCH", `${project}/cases`, body);
    } catch (error) {
      return fail(error, ordered.slice(applied.length));
    }
    applied.push({ entry, caseId: entry.case_id });
    await journal(entry, entry.case_id, entry.name ?? current.name);
  }

  return { ok: true, errors: [], applied, remaining: [] };
}
