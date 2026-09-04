# Changelog

## Unreleased

### Added

- Initial `pi-fusion-mode` package — Fusion posture for Pi (pi-subagents + double gate).
  - Extension: `/fusion-build`, `/fusion-plan`, `/fusion-off` (default off).
  - Double gate: `setActiveTools` (strip edit/write) + `tool_call` (strict bash allowlist, block writers in plan).
  - Prompt `/fusion-status` — mode and peer health-check.
  - Examples: `subagents` snippets, coexistence notes for `@gotgenes/pi-permission-system`, phase-2 worker git-deny stub.
  - Allowlist self-check: `node --experimental-strip-types extensions/bash-allowlist.test.ts`.
  - Manual E2E checklist documented in the README.
