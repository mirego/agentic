# pi-fusion-mode

**Fusion** posture for [Pi](https://pi.earendil.works/): the **main** session plans, decides, and reviews, but **does not mutate** code while the mode is active. Implementation goes through [pi-subagents](https://github.com/nicobailon/pi-subagents) builtins (`worker`, `scout`, …). Path/secret guardrails stay with [`@gotgenes/pi-permission-system`](https://github.com/gotgenes/pi-packages/tree/main/packages/pi-permission-system).

Inspired by the sidekick / Devin Fusion pattern (architect vs editor), **without** porting the OpenCode `sidekick` package: we do not recreate an agent roster — we **lock the parent** and reuse pi-subagents.

## Prerequisites

| Peer | Role |
|------|------|
| **Pi** + recent extension API | `setActiveTools`, `tool_call`, commands |
| **pi-subagents** | `subagent` tool, agents `worker` / `scout` / `researcher` / `reviewer` / `oracle` |
| **@gotgenes/pi-permission-system** (recommended) | path/secrets, git asks — orthogonal to the Fusion lock |

Use at least two models (strong parent, cheap worker) via your Pi settings.

## Install

From a local checkout of the agentic monorepo (or after clone):

```bash
pi install /path/to/agentic/pi-fusion-mode
# or, once published on a branch/tag:
# pi install git:github.com/mirego/agentic/pi-fusion-mode@main
```

Default scope is user (`~/.pi/agent/settings.json` → `packages`). Restart Pi after install.

This package **does not** enable the lock by itself (default **off**).

## Commands

| Command | Effect |
|---------|--------|
| `/fusion-build` | Lock main: no `edit`/`write`; verification bash allowlist + git read/add; `worker` delegation OK |
| `/fusion-plan` | Same as build, **without** writer spawns (`worker`, `delegate`, …); no `git add` |
| `/fusion-off` | Restore tools from before the lock |
| `/fusion-status` | Mode + tools snapshot and peer hints |

Matching prompt template: `/fusion-status` (`prompts/fusion-status.md`) for a guided natural-language check.

TUI footer when active: `pi-fusion:build` or `pi-fusion:plan`.

## Role mapping (pi-subagents)

| Need | Agent | Notes |
|------|--------|------|
| Implement / edit files | `worker` | Cheap model recommended |
| Explore the repo | `scout` | Read-oriented |
| Docs / web | `researcher` | |
| Plan or diff review | `reviewer` | Ideally another vendor |
| Second opinion / drift | `oracle` | Read-only critique |
| Main escape hatch | `/fusion-off` | “Normal” unrestricted main |

**Do not** invent `sidekick.*` agents — builtins are enough.

## Double gate (mechanical)

1. **`setActiveTools`** — removes `edit` and `write` from the schema in build/plan (defense in depth).
2. **`tool_call`** — rejects bash outside the allowlist; in plan, rejects writer agent spawns; rejects any residual `edit`/`write`.

If the model “forgets” to delegate → **inaction**, not a stealth edit.

Bash allowlist: `extensions/bash-allowlist.ts` (last-match-wins, OpenCode sidekick-style). Chains `&&` / `||` / `;` / `|` are rejected — one command per bash call.

Self-check tests:

```bash
cd pi-fusion-mode
node --experimental-strip-types extensions/bash-allowlist.test.ts
```

## Model config (example)

Merge [`examples/settings.subagents.json`](examples/settings.subagents.json) into `~/.pi/agent/settings.json`:

- Parent: your strong `defaultModel`.
- `subagents.agentOverrides.worker.model`: fast/cheap model.
- `subagents.maxSubagentDepth`: `2` if the worker should nest scout/research.

No `model` is hardcoded in this package.

## Coexistence with permission-system

See [`examples/permission-system-notes.md`](examples/permission-system-notes.md).

In short: pi-fusion-mode does not write your permission-system `config.json`. Your `*.env` / SSH denies stay yours. Both `tool_call` handlers compose.

## Plannotator

Plannotator plan-mode (e.g. shift-tab) is **orthogonal**. Human workflow: `/fusion-plan` → Plannotator review → `/fusion-build` — no code coupling.

## Manual verification (E2E)

1. Peers loaded (`subagent` visible; permission-system installed).
2. `/fusion-off`: `edit` possible (under your user policy).
3. `/fusion-build`:
   - `edit` / `write` absent or blocked;
   - `subagent` → `worker` can change a file;
   - `echo probe` (bash) blocked;
   - `git status` OK;
   - `git push --force` blocked.
4. `/fusion-plan`: `worker` spawn blocked; `git add` blocked.
5. `/fusion-status` matches the mode.
6. `.env` reads still governed by permission-system (path deny).
7. Plannotator shift-tab unchanged.

## Layout

```
pi-fusion-mode/
  package.json
  README.md
  extensions/
    pi-fusion-mode.ts
    bash-allowlist.ts
    bash-allowlist.test.ts
  prompts/
    fusion-status.md
  examples/
    settings.subagents.json
    permission-system-notes.md
```

## License

Same as the agentic monorepo — [New BSD](../LICENSE.md).
