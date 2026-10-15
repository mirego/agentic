#!/usr/bin/env node
// Adaptateur Testmo : point d'entrée (I/O seulement — fichiers, réseau, git).
// Toute la logique vit dans lib.mjs. Seule porte d'accès des skills à Testmo :
// le passage au MCP officiel ne touchera que cette couche.
//
// Usage :
//   node testmo.mjs doctor
//   node testmo.mjs snapshot [--out <fichier.json>]
//   node testmo.mjs apply <plan.json> [--dry-run]
// Option commune : --config <chemin> (défaut : .testmo.json à la racine du repo git).
// Le token est lu dans TESTMO_TOKEN (clé d'API personnelle) ; il n'est jamais affiché.

import { execFileSync } from "node:child_process";
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import process from "node:process";

import { applyPlan, createClient, fetchState, parseConfig, snapshotOf } from "./lib.mjs";

const MIN_NODE_MAJOR = 22;

function git(args) {
  try {
    return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = { command, positional: [], dryRun: false, config: null, out: null };
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "--dry-run") options.dryRun = true;
    else if (rest[i] === "--config") options.config = rest[++i];
    else if (rest[i] === "--out") options.out = rest[++i];
    else options.positional.push(rest[i]);
  }
  return options;
}

const root = git(["rev-parse", "--show-toplevel"]) || process.cwd();
const fromRoot = (path) => (isAbsolute(path) ? path : resolve(root, path));

async function loadConfig(path) {
  return parseConfig(await readFile(fromRoot(path ?? ".testmo.json"), "utf8"));
}

function clientFor(config) {
  const token = process.env.TESTMO_TOKEN;
  if (!token) throw new Error("TESTMO_TOKEN absent — définir sa clé d'API personnelle Testmo");
  return createClient({ instance: config.instance, token });
}

// ─── doctor ─────────────────────────────────────────────────────────

async function doctor(options) {
  const checks = [];
  const check = (ok, id, description, fix) => checks.push({ ok, id, description, fix });

  const major = Number(process.versions.node.split(".")[0]);
  check(major >= MIN_NODE_MAJOR, "node", `Node ${process.versions.node}`, `installer Node ≥ ${MIN_NODE_MAJOR}`);

  let config = null;
  try {
    config = await loadConfig(options.config);
    check(true, "config", `${config.instance} · projet ${config.project_id}`, "");
  } catch (error) {
    check(false, "config", error.message, "lancer /testmo-setup ou corriger .testmo.json");
  }

  const token = Boolean(process.env.TESTMO_TOKEN);
  check(token, "token", token ? "TESTMO_TOKEN défini" : "TESTMO_TOKEN absent", "exporter sa clé d'API personnelle Testmo (profil → API keys)");

  const author = git(["config", "user.name"]);
  check(Boolean(author), "author", author ? `auteur du journal : ${author}` : "git config user.name absent", "git config user.name \"Prénom Nom\"");

  if (config && token) {
    try {
      const state = await fetchState(clientFor(config), config);
      check(true, "api", `accès au projet ${config.project_id} (${state.cases.length} cas)`, "");
      check(
        state.errors.length === 0,
        "schema",
        state.errors.length === 0
          ? `template « ${config.case_template} », champ « ${config.history_field} », état Retired`
          : state.errors.join(" ; "),
        "demander à un admin Testmo d'ajouter le champ d'historique au template",
      );
    } catch (error) {
      check(false, "api", error.message, "vérifier le token et l'accès au projet Testmo");
    }
  }

  for (const { ok, id, description, fix } of checks) {
    console.log(`${ok ? "[OK]  " : "[FAIL]"} ${id.padEnd(8)} ${description}`);
    if (!ok && fix) console.log(`       fix: ${fix}`);
  }
  return checks.every((c) => c.ok) ? 0 : 1;
}

// ─── snapshot ───────────────────────────────────────────────────────

async function snapshot(options) {
  const config = await loadConfig(options.config);
  const state = await fetchState(clientFor(config), config);
  for (const error of state.errors) console.error(`warning: ${error}`);
  const json = `${JSON.stringify(snapshotOf(state, config), null, 2)}\n`;
  if (options.out) {
    await writeFile(options.out, json);
    console.error(`Snapshot écrit dans ${options.out} (${state.cases.length} cas).`);
  } else {
    process.stdout.write(json);
  }
  return 0;
}

// ─── apply ──────────────────────────────────────────────────────────

async function apply(options) {
  const [planPath] = options.positional;
  if (!planPath) throw new Error("usage : testmo.mjs apply <plan.json> [--dry-run]");

  const config = await loadConfig(options.config);
  const plan = JSON.parse(await readFile(planPath, "utf8"));
  const state = await fetchState(clientFor(config), config);
  const journalPath = fromRoot(config.journal);

  const result = await applyPlan({
    plan,
    config,
    state,
    client: clientFor(config),
    approver: git(["config", "user.name"]),
    now: new Date(),
    dryRun: options.dryRun,
    log: (line) => console.log(line),
    appendJournal: async (text) => {
      await mkdir(dirname(journalPath), { recursive: true });
      await appendFile(journalPath, text);
    },
  });

  for (const { entry, caseId } of result.applied) {
    console.log(`${options.dryRun ? "[dry-run] " : "✓ "}${entry.action} #${caseId} ${entry.name ?? ""}`.trim());
  }
  if (!result.ok) {
    for (const error of result.errors) console.error(`erreur : ${error}`);
    if (result.remaining.length > 0 && result.applied.length > 0) {
      console.error(`${result.remaining.length} entrée(s) non appliquée(s) :`);
      for (const entry of result.remaining) {
        console.error(`  - ${entry.action} ${entry.case_id ? `#${entry.case_id} ` : ""}${entry.name ?? ""}`);
      }
    }
    return 1;
  }
  if (!options.dryRun) console.log(`Journal mis à jour : ${config.journal}`);
  return 0;
}

// ─── main ───────────────────────────────────────────────────────────

const COMMANDS = { doctor, snapshot, apply };

const options = parseArgs(process.argv.slice(2));
const run = COMMANDS[options.command];

if (!run) {
  console.error("usage : testmo.mjs <doctor|snapshot|apply> [options]");
  process.exit(2);
}

try {
  process.exit(await run(options));
} catch (error) {
  console.error(`erreur : ${error.message}`);
  process.exit(1);
}
