---
description: Health-check the sidekick setup - installed, loaded, and enforcing
argument-hint: []
---

Run a sidekick-pattern health check and report the results. Check three layers, report each as PASS, FAIL, or SKIP with one line of evidence, and do NOT fix anything - this command only reports.

This command runs as whichever agent is currently active. Layer 1 only means something from a restricted primary: if the active agent is `build` or `plan`, proceed. If it is `normal` or any unrestricted agent, report layer 1 as SKIP and say which agent is active - an unrestricted agent is *supposed* to have `edit`, so its toolset proves nothing about the setup.

Throughout, CONFIG DIR means opencode's global config directory: `$XDG_CONFIG_HOME/opencode/` when `XDG_CONFIG_HOME` is set and non-empty, otherwise `~/.config/opencode/`. Resolve it against the real value first, or a correct install under a custom `XDG_CONFIG_HOME` will look missing and be reported as a false FAIL.

## 1. Live enforcement (this running session)

Inspect your own available tools - do not call anything, just check what exists in your toolset. This package denies `edit`, `grep`, `glob`, and `list` for this agent, and opencode removes denied tools from the tool schema entirely.

- If any of those four tools is available to you right now, the sidekick config is NOT loaded in this session. Report FAIL and that a full restart of opencode is the fix.
- If all four are absent and `task` is available, report PASS.

This is the layer that catches the most common failure: correct files on disk, stale session. opencode reads config only at startup.

## 2. Config on disk

Read the config in CONFIG DIR. It may be `opencode.json` OR `opencode.jsonc` - check both and use whichever exists (if both exist, report that as a warning, since it is ambiguous). FAIL if neither exists or the file does not parse.

Then report:

- Each `agent.<role>.model` assignment found. FAIL if `build` or `sidekick` has no model. `explore` should normally have one too; `plan` reuses the top-level default, and research/design/reviewer/vision are optional - report them as absent rather than failing.
- `subagent_depth`. FAIL if it is missing or less than 2. The pattern needs 2 so the sidekick can delegate a read-only lookup to explore or research; opencode defaults to 1, which silently blocks that nested call. Note that this key requires opencode 1.18 or newer - on 1.17 and older opencode rejects the whole config file and will not start at all, so if you are running, the key is supported.

Do not look for any installer manifest. This package is deployed by APM; provenance lives in the consumer's `apm.lock.yaml`, not in a package-specific file.

## 3. Resolved agents

Run `opencode agent list` and use its output as ground truth. It reports each agent's mode and its fully resolved permissions after all config merging, which is what actually governs behaviour - more reliable than reading individual agent files, whose deployed location differs between APM (`agents/`) and hand-installed setups (`agent/`).

Confirm:

- `build`, `plan`, `sidekick`, and `normal` are all present. `build`, `plan`, and `normal` should be `primary`; `sidekick` should be `subagent`.
- `build`'s resolved permissions include `edit` -> `deny`. This is the core mechanical guarantee; a missing denial is FAIL.
- `plan`'s resolved permissions include `edit` -> `deny`, and its `task` allowlist does NOT include `sidekick`.
- `normal` carries no delegation denials - it is the escape hatch and is expected to be unrestricted. Report it as present, not as a failure.
- For each optional specialist that has a model in the config, confirm it appears in the list.

If `opencode agent list` cannot be run from this agent's bash allowlist, say so and fall back to reading the agent markdown files in CONFIG DIR, trying `agents/` first and then `agent/`.

## Diagnosis rules

- Layer 1 FAIL with layers 2-3 PASS means the config changed after startup - a restart fixes it.
- A role with a model in the config but no corresponding agent in `opencode agent list` runs without its permissions and prompt - point to `apm install -g mirego/agentic/sidekick` to reinstall.
- `subagent_depth` missing or 1 with everything else passing means delegation works one level but the sidekick cannot use its read-only helpers.

End with a one-line verdict: `Sidekick: healthy` or `Sidekick: <n> issue(s)` followed by the specific fix for each issue.
