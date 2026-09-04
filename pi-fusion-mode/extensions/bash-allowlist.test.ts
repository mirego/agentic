/**
 * Lightweight self-check for bash-allowlist (no test runner required).
 * Run: `node --experimental-strip-types extensions/bash-allowlist.test.ts`
 * from the pi-fusion-mode package root.
 */

import {
  evaluateBashCommand,
  hasCommandChain,
  compileBashGlob,
} from "./bash-allowlist.ts";

let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string): void {
  if (cond) {
    passed++;
  } else {
    failed++;
    console.error(`FAIL: ${msg}`);
  }
}

function expectPermit(
  cmd: string,
  mode: "build" | "plan",
  permitted: boolean,
  label?: string,
): void {
  const r = evaluateBashCommand(cmd, mode);
  assert(
    r.permitted === permitted,
    `${label ?? cmd} [${mode}]: expected permitted=${permitted}, got ${r.permitted} (${r.reason})`,
  );
}

// --- chains ---
assert(hasCommandChain("git status && git diff"), "detect &&");
assert(hasCommandChain("a || b"), "detect ||");
assert(hasCommandChain("a; b"), "detect ;");
assert(hasCommandChain("a | b"), "detect |");
assert(!hasCommandChain("git status"), "no false chain");
expectPermit("git status && make test", "build", false, "chain denied");

// --- glob bare command ---
assert(compileBashGlob("git *").test("git"), "git * matches bare git");
assert(compileBashGlob("git *").test("git status"), "git * matches git status");
assert(!compileBashGlob("git status*").test("git"), "git status* does not match bare git");

// --- build allows ---
expectPermit("pnpm run lint", "build", true);
expectPermit("pnpm run test unit", "build", true);
expectPermit("make check", "build", true);
expectPermit("make doctor", "build", true);
expectPermit("mix test", "build", true);
expectPermit("git status", "build", true);
expectPermit("git diff HEAD", "build", true);
expectPermit("git add -A", "build", true);
expectPermit("git commit -m 'x'", "build", true); // ask → permitted
expectPermit("git push origin main", "build", true); // ask → permitted
expectPermit("node --version", "build", true);

// --- build denies ---
expectPermit("git push --force", "build", false);
expectPermit("git push -f origin main", "build", false);
expectPermit("git push --delete origin branch", "build", false);
expectPermit("pnpm run lint --fix", "build", false);
expectPermit("pnpm run lint:fix", "build", false);
expectPermit("pnpm test -u", "build", false);
expectPermit("npx vitest run --update", "build", false);
expectPermit("make format", "build", false);
expectPermit("rm -rf /", "build", false);
expectPermit("cat .env", "build", false);
expectPermit("sed -i 's/a/b/' file", "build", false);

// --- plan: no git write ---
expectPermit("git status", "plan", true);
expectPermit("make test", "plan", true);
expectPermit("git add -A", "plan", false, "plan denies git add");
expectPermit("git commit -m x", "plan", false, "plan denies git commit");
expectPermit("git push", "plan", false, "plan denies git push");
expectPermit("git push --force", "plan", false);

// --- output redirects via git flags ---
expectPermit("git diff --output=/tmp/x", "build", false);
expectPermit("git log --output=/tmp/x", "plan", false);

console.log(`bash-allowlist tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
