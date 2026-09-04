# Coexistence with `@gotgenes/pi-permission-system`

`pi-fusion-mode` and `pi-permission-system` **compose**; they do not replace each other.

## Who does what

| Layer | Owner | Examples |
|-------|--------|----------|
| Fusion posture (opt-in) | `pi-fusion-mode` extension | deny main `edit`/`write`; build/plan bash allowlist; block `worker` spawn in plan |
| Workstation guardrails | `@gotgenes/pi-permission-system` | deny `*.env`, `~/.ssh/*`, ask on `git push`, etc. |

In **off** mode, only permission-system (and your user config) applies — normal Pi behavior.

In **build** / **plan**, both run:

1. `setActiveTools` removes `edit`/`write` from the schema.
2. pi-fusion-mode `tool_call` rejects bash outside the allowlist (and writers in plan).
3. permission-system `tool_call` may still **deny** / **ask** (secret paths, git push, …).

A deny from either layer blocks the call.

## Do not overwrite user config

`pi-fusion-mode` **does not write** `~/.pi/agent/extensions/pi-permission-system/config.json`.

Your path denylist (secrets, credentials) remains the workstation source of truth. Fusion bash allowlist examples live in extension code (`extensions/bash-allowlist.ts`), not in that file.

## Mental order when something is blocked

1. Is Fusion mode on? (`/fusion-status`, footer `pi-fusion:build|plan`)
2. Bash rejection → Fusion allowlist first, then permission-system.
3. Path / `.env` rejection → permission-system only.
4. `edit` impossible in build → expected; delegate to `worker`.

## YOLO / bypass

If `yoloMode: true` in permission-system, that extension’s **ask** rules become allow — **not** Fusion denies (`edit`/`write`/bash allowlist). The Fusion lock stays mechanical while mode is build/plan.
