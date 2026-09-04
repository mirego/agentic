/**
 * pi-fusion-mode — Fusion posture for the Pi main session.
 *
 * Opt-in modes (default off):
 * - /fusion-build  — no edit/write; bash allowlist; delegate impl to `worker`
 * - /fusion-plan   — like build, but writer agents (worker, delegate, …) blocked
 * - /fusion-off    — restore previous tools; no fusion gate
 * - /fusion-status — health snapshot (also available as prompt template)
 *
 * Double gate: setActiveTools (schema) + tool_call (bash + residual denies).
 * Coexists with @gotgenes/pi-permission-system (path/secrets/asks) and pi-subagents.
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { evaluateBashCommand } from "./bash-allowlist.ts";

export type FusionMode = "off" | "build" | "plan";

const CUSTOM_TYPE = "pi-fusion-mode";

/** Tools removed from the schema in build/plan. */
const MUTATION_TOOLS = new Set(["edit", "write"]);

/**
 * Builtins the main should keep for review + verification + delegation.
 * Extension tools (subagent, …) that were already active are preserved.
 */
const FUSION_CORE_TOOLS = ["read", "bash", "grep", "find", "ls", "subagent"];

/** Agent names blocked from spawn in plan mode (writers / general executors). */
const PLAN_BLOCKED_AGENTS = new Set([
  "worker",
  "delegate",
  "developer",
  "coder",
  "implementer",
  "develop",
  "sidekick",
  "design",
]);

type PersistedState = {
  mode: FusionMode;
  toolsBeforeFusion?: string[];
};

function unique(names: string[]): string[] {
  return [...new Set(names)];
}

function extractBashCommand(input: unknown): string | null {
  if (!input || typeof input !== "object") return null;
  const rec = input as Record<string, unknown>;
  if (typeof rec.command === "string") return rec.command;
  if (typeof rec.cmd === "string") return rec.cmd;
  return null;
}

/**
 * Best-effort agent name from a subagent tool call.
 * pi-subagents uses `agent` on single launches; workflows may nest differently.
 */
function extractSubagentTarget(input: unknown): string | null {
  if (!input || typeof input !== "object") return null;
  const rec = input as Record<string, unknown>;

  if (typeof rec.agent === "string" && rec.agent.trim()) {
    return rec.agent.trim().toLowerCase();
  }

  // workflowScript / multi — try a shallow scan of common shapes
  if (Array.isArray(rec.agents)) {
    const first = rec.agents.find((a) => typeof a === "string");
    if (typeof first === "string") return first.toLowerCase();
  }

  return null;
}

function isWriterAgent(name: string): boolean {
  const base = name.includes(".") ? name.slice(name.lastIndexOf(".") + 1) : name;
  return PLAN_BLOCKED_AGENTS.has(base) || PLAN_BLOCKED_AGENTS.has(name);
}

const BUILD_GUIDELINE = `Fusion mode **build** is active (mechanical lock):
- You do NOT have edit/write. File changes go through the pi-subagents **worker** (subagent).
- Explore the codebase via **scout**; external facts via **researcher**; critique via **reviewer** / **oracle**.
- Bash is allowlisted to verification (lint/test/build/check) and git read/add; commit/push may still prompt via permission-system. No command chains (&&, ||, ;, |).
- Own the plan, ambiguity calls, review, and final verification. Do not narrate the lock — just delegate.
- Prefer: clarify → scout → worker → reviewer.`;

const PLAN_GUIDELINE = `Fusion mode **plan** is active (mechanical lock):
- You do NOT have edit/write. You cannot spawn **worker** (or other writers).
- Investigate with **scout** / **researcher**; critique plans with **reviewer** / **oracle**.
- Bash is verification + read-only git only (no git add/commit/push).
- Deliver a concrete plan, then tell the user to run /fusion-build to execute.
- Do not narrate the lock — describe the work.`;

export default function fusionModeExtension(pi: ExtensionAPI): void {
  let mode: FusionMode = "off";
  let toolsBeforeFusion: string[] | undefined;

  function fusionToolsFrom(baseline: string[]): string[] {
    const withoutMutation = baseline.filter((n) => !MUTATION_TOOLS.has(n));
    // Prefer tools that actually exist; unknown names are ignored by setActiveTools.
    const available = new Set(pi.getAllTools().map((t) => t.name));
    const core = FUSION_CORE_TOOLS.filter((t) => available.has(t) || t === "subagent");
    return unique([...withoutMutation, ...core]);
  }

  function captureBaseline(): void {
    if (toolsBeforeFusion === undefined) {
      toolsBeforeFusion = pi.getActiveTools();
    }
  }

  function applyToolsForMode(next: FusionMode): void {
    if (next === "off") {
      if (toolsBeforeFusion !== undefined) {
        pi.setActiveTools(toolsBeforeFusion);
      }
      toolsBeforeFusion = undefined;
      return;
    }

    captureBaseline();
    const baseline = toolsBeforeFusion ?? pi.getActiveTools();
    pi.setActiveTools(fusionToolsFrom(baseline));
  }

  function persist(): void {
    const data: PersistedState = {
      mode,
      toolsBeforeFusion,
    };
    pi.appendEntry(CUSTOM_TYPE, data);
  }

  function updateFooter(ctx: ExtensionContext): void {
    if (mode === "off") {
      ctx.ui.setStatus("pi-fusion-mode", undefined);
      return;
    }
    const label = mode === "build" ? "pi-fusion:build" : "pi-fusion:plan";
    const color = mode === "build" ? "accent" : "warning";
    ctx.ui.setStatus("pi-fusion-mode", ctx.ui.theme.fg(color, label));
  }

  function setMode(next: FusionMode, ctx: ExtensionContext, notify = true): void {
    if (mode === next) {
      if (notify) {
        ctx.ui.notify(`Fusion mode already ${next}.`, "info");
      }
      return;
    }

    // Switching plan↔build keeps baseline; off clears it after restore
    if (mode === "off" && next !== "off") {
      captureBaseline();
    }

    mode = next;
    applyToolsForMode(next);
    updateFooter(ctx);
    persist();

    if (!notify) return;

    if (next === "off") {
      ctx.ui.notify("Fusion mode off. Full tool access restored (subject to permission-system).", "info");
    } else if (next === "build") {
      ctx.ui.notify(
        "Fusion build on: edit/write locked. Delegate implementation to worker via subagent.",
        "info",
      );
    } else {
      ctx.ui.notify(
        "Fusion plan on: edit/write locked; worker spawns blocked. Explore and plan only.",
        "info",
      );
    }
  }

  function formatStatus(ctx: ExtensionContext): string {
    const active = pi.getActiveTools();
    const hasEdit = active.includes("edit");
    const hasWrite = active.includes("write");
    const hasSubagent = active.includes("subagent");
    const hasBash = active.includes("bash");

    const lines: string[] = [
      `# Fusion status`,
      ``,
      `- **Mode:** \`${mode}\``,
      `- **edit active:** ${hasEdit ? "yes" : "no"}`,
      `- **write active:** ${hasWrite ? "yes" : "no"}`,
      `- **bash active:** ${hasBash ? "yes" : "no"}`,
      `- **subagent active:** ${hasSubagent ? "yes" : "no"}`,
    ];

    if (mode === "off") {
      lines.push(
        ``,
        `Mode is off — fusion gate inactive. Run \`/fusion-build\` or \`/fusion-plan\` to lock the main session.`,
      );
    } else {
      const editOk = !hasEdit && !hasWrite;
      lines.push(
        ``,
        `## Live lock`,
        `- Schema lock (no edit/write): **${editOk ? "PASS" : "FAIL"}**`,
        `- Bash allowlist: **enforced** (${mode})`,
        mode === "plan"
          ? `- Writer spawn block (worker/delegate/…): **enforced**`
          : `- Writer spawn block: n/a (build allows worker)`,
      );
    }

    lines.push(
      ``,
      `## Peers (manual check)`,
      `- **pi-subagents** should expose the \`subagent\` tool and builtins worker/scout/reviewer/researcher/oracle.`,
      `- **@gotgenes/pi-permission-system** should still gate path/secrets (e.g. \`*.env\`) independently.`,
      `- Recommended settings: \`subagents.maxSubagentDepth >= 2\`, \`subagents.agentOverrides.worker.model\` = cheap/fast.`,
      ``,
      `See package examples/settings.subagents.json and examples/permission-system-notes.md.`,
    );

    // Touch ctx so linters keep the param used if UI expands later
    void ctx;
    return lines.join("\n");
  }

  // --- Commands ---

  pi.registerCommand("fusion-build", {
    description: "Enable Fusion build: main cannot edit; delegate to worker",
    handler: async (_args, ctx) => setMode("build", ctx),
  });

  pi.registerCommand("fusion-plan", {
    description: "Enable Fusion plan: read-only main; no worker spawns",
    handler: async (_args, ctx) => setMode("plan", ctx),
  });

  pi.registerCommand("fusion-off", {
    description: "Disable Fusion mode; restore previous tools",
    handler: async (_args, ctx) => setMode("off", ctx),
  });

  pi.registerCommand("fusion-status", {
    description: "Show Fusion mode health (lock, tools, peer hints)",
    handler: async (_args, ctx) => {
      const text = formatStatus(ctx);
      await ctx.ui.notify(text, "info");
      // Also surface as a non-turn message when possible
      try {
        pi.sendMessage(
          { customType: "pi-fusion-status", content: text, display: true },
          { triggerTurn: false },
        );
      } catch {
        // older hosts may not accept custom display messages
      }
    },
  });

  // --- tool_call gate ---

  pi.on("tool_call", async (event) => {
    if (mode === "off") return;

    const name = event.toolName;

    // Residual mutation tools (if still present somehow)
    if (MUTATION_TOOLS.has(name)) {
      return {
        block: true,
        reason: `Fusion ${mode}: ${name} is locked on the main session. Delegate file changes to the worker subagent (\`subagent\` → agent: "worker").`,
      };
    }

    if (name === "bash") {
      const command = extractBashCommand(event.input);
      if (command === null) {
        return {
          block: true,
          reason: `Fusion ${mode}: bash call missing command string.`,
        };
      }
      const result = evaluateBashCommand(command, mode);
      if (!result.permitted) {
        return {
          block: true,
          reason: `Fusion ${mode}: bash blocked. ${result.reason}\nCommand: ${command}`,
        };
      }
      return;
    }

    // Plan mode: block writer agent launches
    if (mode === "plan" && (name === "subagent" || name === "Task" || name === "task")) {
      const target = extractSubagentTarget(event.input);
      if (target && isWriterAgent(target)) {
        return {
          block: true,
          reason: `Fusion plan: cannot spawn writer agent "${target}". Use scout/researcher/reviewer/oracle, or /fusion-build to implement.`,
        };
      }
    }
  });

  // --- guidelines before each turn ---

  pi.on("before_agent_start", async (event) => {
    if (mode === "off") return;

    // Re-assert tool lock each turn (other extensions may have widened tools)
    if (toolsBeforeFusion !== undefined) {
      pi.setActiveTools(fusionToolsFrom(toolsBeforeFusion));
    } else {
      captureBaseline();
      pi.setActiveTools(fusionToolsFrom(toolsBeforeFusion ?? pi.getActiveTools()));
    }

    const guideline = mode === "build" ? BUILD_GUIDELINE : PLAN_GUIDELINE;
    return {
      systemPrompt: `${event.systemPrompt}\n\n${guideline}`,
    };
  });

  // --- session restore ---

  pi.on("session_start", async (_event, ctx) => {
    try {
      const entries = ctx.sessionManager.getEntries();
      const last = [...entries]
        .reverse()
        .find(
          (e: { type?: string; customType?: string }) =>
            e.type === "custom" && e.customType === CUSTOM_TYPE,
        ) as { data?: PersistedState } | undefined;

      const saved = last?.data;
      if (!saved || saved.mode === "off") {
        mode = "off";
        toolsBeforeFusion = undefined;
        updateFooter(ctx);
        return;
      }

      // Fresh baseline on resume — do not trust stale tool lists across sessions
      toolsBeforeFusion = undefined;
      mode = saved.mode;
      applyToolsForMode(mode);
      updateFooter(ctx);
      persist();
    } catch {
      mode = "off";
    }
  });

  }
