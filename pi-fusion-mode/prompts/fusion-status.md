---
description: Health-check Fusion mode — main lock, pi-subagents / permission-system peers, model hints
argument-hint: []
---

You are in a Pi session. Run a **Fusion health-check** and report only — do not change anything, do not “fix” setup.

Prefer the extension command when available: the user can also run `/fusion-status` directly. Otherwise inspect yourself.

## 1. Mode and live lock

- Ask for or infer the current mode: `off` | `build` | `plan` (footer `pi-fusion:build` / `pi-fusion:plan`, or last `/fusion-*` command).
- Inspect your **active tools** (do not call them):
  - In **build** or **plan**: `edit` and `write` must be **absent**. `bash` and ideally `subagent` present.
  - In **off**: `edit`/`write` may be present — that is normal; report SKIP for the lock.
- If build/plan and `edit` or `write` are still visible → **FAIL** (fusion config not applied, or another extension re-widened tools; re-run `/fusion-build` or restart).

## 2. Bash allowlist (build/plan only)

- Do **not** run destructive commands.
- If mode is build or plan, you may try **one** benign off-allowlist command such as `echo fusion-probe` via bash: it must be **blocked**.
- An allowlisted command such as `git status` (or `git status -sb`) should **pass** (or only fail due to permission-system for another reason — note that).
- In **off** mode: SKIP this layer.

## 3. Peers and config

Check without modifying:

| Peer | How | Expected |
|------|-----|----------|
| pi-subagents | `subagent` tool present; or package listed in settings | required to delegate to `worker` |
| @gotgenes/pi-permission-system | package/extension loaded; path `*.env` typically deny at workstation level | recommended (path/secret guardrails, orthogonal to Fusion lock) |
| `subagents.maxSubagentDepth` | user/project settings | ≥ 2 recommended if worker nests scout |
| `subagents.agentOverrides.worker.model` | settings | warn if missing (worker on the same expensive model as parent) |

Do not read `auth.json` or secrets.

## 4. Verdict

End with one line:

- `Fusion: healthy` if mode is off (lock SKIP OK) **or** (build/plan with edit/write absent + plausible bash gate + subagent available)
- `Fusion: N issue(s)` + concrete fixes (`/fusion-build`, `pi install`, settings snippet, restart)

Role mapping reminders (do not invent sidekick.* agents):

| Need | pi-subagents agent |
|------|-------------------|
| Implement | `worker` |
| Explore repo | `scout` |
| Docs / web | `researcher` |
| Review | `reviewer` |
| Second opinion | `oracle` |
