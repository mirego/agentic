/**
 * Bash allowlist for pi-fusion-mode (build / plan).
 *
 * Semantics mirror OpenCode / sidekick-style permission maps:
 * - patterns are ordered; **last match wins**
 * - `*` matches any substring (including empty)
 * - a pattern ending with ` *` also matches the bare command without args
 *   (e.g. `git *` matches both `git` and `git status`)
 * - chained commands (`&&`, `||`, `;`, `|`, bare newlines) are rejected up front
 *   — the allowlist matches one command at a time
 *
 * Decisions: `allow` | `deny` | `ask`
 * - `ask` is treated as allow for the mechanical gate (no UI prompt in this
 *   extension); pi-permission-system may still prompt on overlapping rules.
 */

export type BashDecision = "allow" | "deny" | "ask";

export type BashRule = {
  pattern: string;
  decision: BashDecision;
};

/** Shared verification + version probes (build and plan). */
const VERIFICATION_ALLOWS: BashRule[] = [
  { pattern: "pnpm run lint*", decision: "allow" },
  { pattern: "pnpm run test*", decision: "allow" },
  { pattern: "pnpm test*", decision: "allow" },
  { pattern: "pnpm run build*", decision: "allow" },
  { pattern: "pnpm exec tsc --noEmit*", decision: "allow" },
  { pattern: "pnpm exec vitest run*", decision: "allow" },
  { pattern: "pnpm run check*", decision: "allow" },
  { pattern: "npm run lint*", decision: "allow" },
  { pattern: "npm test*", decision: "allow" },
  { pattern: "npm run build*", decision: "allow" },
  { pattern: "npx tsc --noEmit*", decision: "allow" },
  { pattern: "npx vitest run*", decision: "allow" },
  { pattern: "make check*", decision: "allow" },
  { pattern: "make lint*", decision: "allow" },
  { pattern: "make test*", decision: "allow" },
  { pattern: "make doctor*", decision: "allow" },
  { pattern: "mix test*", decision: "allow" },
  { pattern: "mix format --check-formatted*", decision: "allow" },
  { pattern: "mix credo*", decision: "allow" },
  { pattern: "mix dialyzer*", decision: "allow" },
  { pattern: "node --version*", decision: "allow" },
  { pattern: "pnpm --version*", decision: "allow" },
  { pattern: "npm --version*", decision: "allow" },
];

/** Read-only git inspection. */
const GIT_READ_ALLOWS: BashRule[] = [
  { pattern: "git diff*", decision: "allow" },
  { pattern: "git status*", decision: "allow" },
  { pattern: "git log*", decision: "allow" },
  { pattern: "git show*", decision: "allow" },
  { pattern: "git ls-files*", decision: "allow" },
  { pattern: "git branch*", decision: "allow" },
  { pattern: "git rev-parse*", decision: "allow" },
];

/** Build-only: staging + commit/push with ask (mechanical allow; human layer elsewhere). */
const GIT_WRITE_BUILD: BashRule[] = [
  { pattern: "git add*", decision: "allow" },
  { pattern: "git commit*", decision: "ask" },
  { pattern: "git push*", decision: "ask" },
];

/** Dangerous / mutating forms — must come AFTER broader allows (last-match-wins). */
const GIT_DANGER_DENIES: BashRule[] = [
  { pattern: "git push --force*", decision: "deny" },
  { pattern: "git push -f*", decision: "deny" },
  { pattern: "git push -uf*", decision: "deny" },
  { pattern: "git push -fu*", decision: "deny" },
  { pattern: "git push * --force*", decision: "deny" },
  { pattern: "git push * -f*", decision: "deny" },
  { pattern: "git push * -uf*", decision: "deny" },
  { pattern: "git push * -fu*", decision: "deny" },
  { pattern: "git push --mir*", decision: "deny" },
  { pattern: "git push * --mir*", decision: "deny" },
  { pattern: "git push --delete*", decision: "deny" },
  { pattern: "git push * --delete*", decision: "deny" },
  { pattern: "git push -d*", decision: "deny" },
  { pattern: "git push * -d*", decision: "deny" },
  { pattern: "git push --prune*", decision: "deny" },
  { pattern: "git push * --prune*", decision: "deny" },
  { pattern: "git push * :*", decision: "deny" },
  { pattern: "git push * +*", decision: "deny" },
  { pattern: "git diff --output*", decision: "deny" },
  { pattern: "git diff *--output*", decision: "deny" },
  { pattern: "git log --output*", decision: "deny" },
  { pattern: "git log *--output*", decision: "deny" },
  { pattern: "git show --output*", decision: "deny" },
  { pattern: "git show *--output*", decision: "deny" },
];

/** Lint/test flags that mutate the tree — after verification allows. */
const MUTATING_FLAG_DENIES: BashRule[] = [
  { pattern: "pnpm run lint *--fix*", decision: "deny" },
  { pattern: "pnpm run lint:fix*", decision: "deny" },
  { pattern: "pnpm test -u*", decision: "deny" },
  { pattern: "pnpm test * -u*", decision: "deny" },
  { pattern: "pnpm test *--update*", decision: "deny" },
  { pattern: "pnpm test --update*", decision: "deny" },
  { pattern: "pnpm exec vitest run -u*", decision: "deny" },
  { pattern: "pnpm exec vitest run --update*", decision: "deny" },
  { pattern: "pnpm exec vitest run * -u*", decision: "deny" },
  { pattern: "pnpm exec vitest run *--update*", decision: "deny" },
  { pattern: "npm run lint *--fix*", decision: "deny" },
  { pattern: "npm test -u*", decision: "deny" },
  { pattern: "npm test * -u*", decision: "deny" },
  { pattern: "npm test *--update*", decision: "deny" },
  { pattern: "npm test --update*", decision: "deny" },
  { pattern: "npx vitest run -u*", decision: "deny" },
  { pattern: "npx vitest run --update*", decision: "deny" },
  { pattern: "npx vitest run * -u*", decision: "deny" },
  { pattern: "npx vitest run *--update*", decision: "deny" },
  { pattern: "npx tsc --noEmitOnError*", decision: "deny" },
  { pattern: "make format*", decision: "deny" },
];

/**
 * Build mode: verification + git read/add + commit/push ask, deny-by-default.
 * Order: deny-all → allows → specific denies (last match wins).
 */
export const BUILD_BASH_RULES: BashRule[] = [
  { pattern: "*", decision: "deny" },
  ...VERIFICATION_ALLOWS,
  ...GIT_READ_ALLOWS,
  ...GIT_WRITE_BUILD,
  ...GIT_DANGER_DENIES,
  ...MUTATING_FLAG_DENIES,
];

/**
 * Plan mode: verification + git read only. No git add/commit/push.
 */
export const PLAN_BASH_RULES: BashRule[] = [
  { pattern: "*", decision: "deny" },
  ...VERIFICATION_ALLOWS,
  ...GIT_READ_ALLOWS,
  ...GIT_DANGER_DENIES.filter((r) => r.pattern.includes("output")),
  ...MUTATING_FLAG_DENIES,
];

export type BashEvalResult = {
  decision: BashDecision;
  /** Mechanical gate: allow or ask → true; deny → false */
  permitted: boolean;
  matchedPattern: string | null;
  reason: string;
};

const CHAIN_RE = /(?:&&|\|\||;|\||\n)/;

export function hasCommandChain(command: string): boolean {
  return CHAIN_RE.test(command);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Compile an OpenCode-style glob (`*` / `?`) to a full-string regex. */
export function compileBashGlob(pattern: string): RegExp {
  let escaped = pattern
    .split("*")
    .map((part) => escapeRegExp(part).replaceAll("\\?", "."))
    .join(".*");

  // "git *" also matches bare "git"
  if (escaped.endsWith(" .*")) {
    escaped = `${escaped.slice(0, -3)}( .*)?`;
  }

  return new RegExp(`^${escaped}$`, "s");
}

type CompiledRule = {
  pattern: string;
  decision: BashDecision;
  regex: RegExp;
};

function compileRules(rules: BashRule[]): CompiledRule[] {
  return rules.map((r) => ({
    pattern: r.pattern,
    decision: r.decision,
    regex: compileBashGlob(r.pattern),
  }));
}

const BUILD_COMPILED = compileRules(BUILD_BASH_RULES);
const PLAN_COMPILED = compileRules(PLAN_BASH_RULES);

function findLastMatch(
  command: string,
  compiled: CompiledRule[],
): CompiledRule | null {
  let last: CompiledRule | null = null;
  for (const rule of compiled) {
    if (rule.regex.test(command)) last = rule;
  }
  return last;
}

/**
 * Evaluate a single bash command against build or plan rules.
 * Leading/trailing whitespace is trimmed; internal spacing is preserved.
 */
export function evaluateBashCommand(
  command: string,
  mode: "build" | "plan",
): BashEvalResult {
  const trimmed = command.trim();

  if (!trimmed) {
    return {
      decision: "deny",
      permitted: false,
      matchedPattern: null,
      reason: "Empty command.",
    };
  }

  if (hasCommandChain(trimmed)) {
    return {
      decision: "deny",
      permitted: false,
      matchedPattern: null,
      reason:
        "Chained commands (&&, ||, ;, |) are blocked. Run each allowlisted command as its own bash call.",
    };
  }

  const compiled = mode === "build" ? BUILD_COMPILED : PLAN_COMPILED;
  const match = findLastMatch(trimmed, compiled);

  if (!match) {
    return {
      decision: "deny",
      permitted: false,
      matchedPattern: null,
      reason: "No matching bash rule (deny-by-default).",
    };
  }

  const permitted = match.decision === "allow" || match.decision === "ask";
  const reason =
    match.decision === "deny"
      ? `Denied by pattern "${match.pattern}".`
      : match.decision === "ask"
        ? `Matched "${match.pattern}" (ask — permitted by pi-fusion-mode; permission-system may still prompt).`
        : `Allowed by pattern "${match.pattern}".`;

  return {
    decision: match.decision,
    permitted,
    matchedPattern: match.pattern,
    reason,
  };
}
