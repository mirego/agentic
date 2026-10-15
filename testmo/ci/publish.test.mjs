// Tests de publish.sh : jamais bloquant, entrées explicites, token jamais exposé.
// Runner intégré à Node (`node --test`), aucune dépendance. Le CLI Testmo est
// remplacé par un faux script (variable TESTMO_CLI) qui enregistre ses arguments.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, test } from "node:test";

const PUBLISH = fileURLToPath(new URL("publish.sh", import.meta.url));
const TOKEN = "s3cr3t-token";

function workspace({ cliExit = 0, config = { instance: "https://acme.testmo.net", project_id: 7 } } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "testmo-publish-"));
  if (config) writeFileSync(join(dir, ".testmo.json"), JSON.stringify(config));
  mkdirSync(join(dir, "reports", "nested"), { recursive: true });
  writeFileSync(join(dir, "reports", "nested", "unit.xml"), "<testsuites/>");

  const cli = join(dir, "fake-cli.sh");
  writeFileSync(
    cli,
    `#!/usr/bin/env bash
printf '%s\\n' "$@" > "${dir}/args.txt"
prev=""; for a in "$@"; do [ "$prev" = "--resources" ] && cp "$a" "${dir}/resources.json"; prev="$a"; done
exit ${cliExit}
`,
  );
  chmodSync(cli, 0o755);
  return { dir, cli };
}

function publish(ws, env = {}) {
  const result = spawnSync("bash", [PUBLISH], {
    cwd: ws.dir,
    encoding: "utf8",
    env: {
      PATH: process.env.PATH,
      TESTMO_CLI: ws.cli,
      TESTMO_TOKEN: TOKEN,
      TESTMO_RESULTS: "reports/**/*.xml",
      TESTMO_SOURCE: "backend-unit",
      TESTMO_RUN_NAME: "PR #12 — Ajouter le paiement",
      TESTMO_COMMIT: "abc123",
      TESTMO_BRANCH: "feature/pay",
      ...env,
    },
  });
  const argsFile = join(ws.dir, "args.txt");
  const resourcesFile = join(ws.dir, "resources.json");
  return {
    ...result,
    output: result.stdout + result.stderr,
    args: existsSync(argsFile) ? readFileSync(argsFile, "utf8").trim().split("\n") : null,
    resources: existsSync(resourcesFile) ? JSON.parse(readFileSync(resourcesFile, "utf8")) : null,
  };
}

const after = (args, flag) => args[args.indexOf(flag) + 1];

describe("publish.sh", () => {
  test("submits the run with instance, project, name, source and results", () => {
    const run = publish(workspace());
    assert.equal(run.status, 0);
    assert.equal(run.args[0], "automation:run:submit");
    assert.equal(after(run.args, "--instance"), "https://acme.testmo.net");
    assert.equal(after(run.args, "--project-id"), "7");
    assert.equal(after(run.args, "--name"), "PR #12 — Ajouter le paiement");
    assert.equal(after(run.args, "--source"), "backend-unit");
    assert.equal(after(run.args, "--results"), "reports/**/*.xml");
  });

  test("links the run to the change, commit, author and build", () => {
    const run = publish(workspace(), {
      TESTMO_CHANGE_URL: "https://github.com/acme/app/pull/12",
      TESTMO_CHANGE_AUTHOR: "ada",
      TESTMO_TRIGGERED_BY: "grace",
      TESTMO_COMMIT_URL: "https://github.com/acme/app/commit/abc123",
      TESTMO_BUILD_URL: "https://github.com/acme/app/actions/runs/1",
    });
    assert.deepEqual(run.resources.fields, [
      { type: "string", name: "Commit", value: "abc123" },
      { type: "string", name: "Branch", value: "feature/pay" },
      { type: "string", name: "Author", value: "ada" },
      { type: "string", name: "Triggered by", value: "grace" },
    ]);
    assert.deepEqual(
      run.resources.links.map((l) => l.name),
      ["Change", "Commit", "Build"],
    );
  });

  test("omits optional fields and links that are not provided", () => {
    const run = publish(workspace());
    assert.deepEqual(
      run.resources.fields.map((f) => f.name),
      ["Commit", "Branch"],
    );
    assert.deepEqual(run.resources.links, []);
  });

  test("splits tags and replaces colons, which Testmo refuses", () => {
    const run = publish(workspace(), { TESTMO_TAGS: "pr, release:2" });
    const index = run.args.indexOf("--tags");
    assert.deepEqual(run.args.slice(index + 1), ["pr", "release-2"]);
  });

  test("never exposes the token in arguments or output", () => {
    const run = publish(workspace());
    assert.ok(!run.args.join(" ").includes(TOKEN));
    assert.ok(!run.output.includes(TOKEN));
  });

  test("skips with a warning and exit 0 when the token is missing", () => {
    const run = publish(workspace(), { TESTMO_TOKEN: "" });
    assert.equal(run.status, 0);
    assert.match(run.output, /TESTMO_TOKEN absent/);
    assert.equal(run.args, null);
  });

  test("skips with a warning and exit 0 when no result file matches", () => {
    const run = publish(workspace(), { TESTMO_RESULTS: "missing/*.xml" });
    assert.equal(run.status, 0);
    assert.match(run.output, /aucun fichier de résultats/);
    assert.equal(run.args, null);
  });

  test("skips with a warning and exit 0 when a required input is missing", () => {
    const run = publish(workspace(), { TESTMO_COMMIT: "" });
    assert.equal(run.status, 0);
    assert.match(run.output, /TESTMO_COMMIT absent/);
    assert.equal(run.args, null);
  });

  test("skips with a warning and exit 0 when the configuration is missing or incomplete", () => {
    assert.match(publish(workspace({ config: null })).output, /introuvable/);
    const incomplete = publish(workspace({ config: { instance: "https://acme.testmo.net" } }));
    assert.equal(incomplete.status, 0);
    assert.match(incomplete.output, /project_id absent/);
  });

  test("exits 0 with a warning when the CLI fails", () => {
    const run = publish(workspace({ cliExit: 3 }));
    assert.equal(run.status, 0);
    assert.match(run.output, /échec du CLI Testmo/);
  });

  test("uses GitHub Actions annotations when running in GitHub Actions", () => {
    const run = publish(workspace(), { TESTMO_TOKEN: "", GITHUB_ACTIONS: "true" });
    assert.match(run.stdout, /^::warning title=Testmo::TESTMO_TOKEN absent/);
  });
});
