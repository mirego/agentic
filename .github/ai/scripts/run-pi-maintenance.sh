#!/usr/bin/env bash
# Run Pi for maintenance tasks and capture a structured result + git patch.
set -euo pipefail

prompt_file="${PROMPT_FILE:?PROMPT_FILE is required}"
output_file="${OUTPUT_FILE:?OUTPUT_FILE is required}"
patch_file="${PATCH_FILE:?PATCH_FILE is required}"
model="${MODEL:?MODEL is required}"
thinking_level="${THINKING_LEVEL:-high}"
tools="${TOOLS:-read,grep,find,ls,bash,edit,write}"
validation_command="${VALIDATION_COMMAND:-}"
task_title="${TASK_TITLE:-Scheduled maintenance}"

mkdir -p "$(dirname "${output_file}")" "$(dirname "${patch_file}")"
rm -f "${output_file}" "${patch_file}"

instructions_file="$(mktemp)"
stdout_file="$(mktemp)"
trap 'rm -f "${instructions_file}" "${stdout_file}"' EXIT

validation_block="No validation command was provided."
if [[ -n "${validation_command}" ]]; then
  validation_block="After applying changes, run this validation command and fix failures when reasonable:

\`\`\`bash
${validation_command}
\`\`\`"
fi

cat > "${instructions_file}" <<EOF
# Runtime instructions

Task title: ${task_title}

## Hard requirements

1. Use only these tools: ${tools}
2. Make only the file changes required by the maintenance prompt.
3. Do not commit, push, create branches, or open pull requests.
4. Do not modify secrets or credential files.
5. Avoid changing \`.github/workflows/**\` unless the prompt explicitly requires it.
6. Prefer writing the result JSON to:
   ${output_file}
   If you cannot write the file, end with pure JSON in your final message instead.

## Result JSON shape

\`\`\`json
{
  "summary": "What changed and why",
  "has_changes": true,
  "title": "chore: short PR title",
  "body": "Markdown PR body",
  "labels": ["dependencies"],
  "draft": true,
  "changed_paths": ["path/a", "path/b"]
}
\`\`\`

If you decide no changes are warranted, leave the tree clean, set
\`has_changes\` to false, and still produce the JSON result.

## Validation

${validation_block}
EOF

set +e
pi \
  --no-session \
  --no-extensions \
  --no-skills \
  --no-prompt-templates \
  --no-approve \
  --no-mcp \
  --model "${model}" \
  --thinking "${thinking_level}" \
  --tools "${tools}" \
  -p \
  @"${prompt_file}" \
  @"${instructions_file}" \
  "Complete the maintenance task now." \
  | tee "${stdout_file}"
pi_status=${PIPESTATUS[0]}
set -e

if [[ "${pi_status}" -ne 0 ]]; then
  echo "Pi exited with status ${pi_status}" >&2
  exit "${pi_status}"
fi

if [[ ! -f "${output_file}" ]]; then
  python3 - "${stdout_file}" "${output_file}" <<'PY'
import json
import re
import sys
from pathlib import Path

stdout_path = Path(sys.argv[1])
output_path = Path(sys.argv[2])
text = stdout_path.read_text(encoding="utf-8", errors="replace").strip()
if not text:
    raise SystemExit("Pi produced neither a result file nor stdout JSON")

candidates = re.findall(r"```(?:json)?\s*(\{.*?\})\s*```", text, flags=re.DOTALL | re.IGNORECASE)
if text.startswith("{") and text.endswith("}"):
    candidates.append(text)
start = text.rfind("\n{")
if start == -1 and text.startswith("{"):
    start = 0
elif start != -1:
    start += 1
if start != -1:
    candidates.append(text[start:].strip())

parsed = None
for candidate in reversed(candidates):
    try:
        data = json.loads(candidate)
    except json.JSONDecodeError:
        continue
    if isinstance(data, dict) and "has_changes" in data and "title" in data:
        parsed = data
        break

if parsed is None:
    raise SystemExit("Unable to parse maintenance result JSON from Pi output")

output_path.write_text(json.dumps(parsed, indent=2) + "\n", encoding="utf-8")
print(f"Recovered maintenance artifact from stdout into {output_path}")
PY
fi

# Never include the toolkit checkout in the published patch.
if [[ -d .agentic-toolkit ]]; then
  mkdir -p .git/info
  grep -qxF '.agentic-toolkit/' .git/info/exclude 2>/dev/null || echo '.agentic-toolkit/' >> .git/info/exclude
fi

# Capture the working tree as a binary-capable patch for the publisher job.
git add -A
if git diff --cached --quiet; then
  : > "${patch_file}"
  # Ensure result consistency when the tree is clean.
  python3 - "${output_file}" <<'PY'
import json
import sys
from pathlib import Path
path = Path(sys.argv[1])
data = json.loads(path.read_text(encoding="utf-8"))
data["has_changes"] = False
data.setdefault("changed_paths", [])
path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
PY
  echo "No git changes produced"
else
  git diff --cached --binary > "${patch_file}"
  git reset --quiet
  echo "Wrote patch to ${patch_file}"
fi

echo "Maintenance artifact written to ${output_file}"
