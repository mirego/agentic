#!/usr/bin/env python3
"""Validate and normalize Pi review findings against the PR diff."""

from __future__ import annotations

import hashlib
import json
import os
import re
import sys
from pathlib import Path
from typing import Any


SEVERITY_RANK = {
    "critical": 5,
    "high": 4,
    "medium": 3,
    "low": 2,
    "info": 1,
}


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def parse_diff_line_map(diff_text: str) -> dict[str, set[int]]:
    """Map changed files on the RIGHT side to changed/context line numbers."""
    result: dict[str, set[int]] = {}
    current_file: str | None = None
    new_line: int | None = None

    hunk_re = re.compile(r"^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@")
    for raw_line in diff_text.splitlines():
        if raw_line.startswith("+++ "):
            path = raw_line[4:].strip()
            if path == "/dev/null":
                current_file = None
                continue
            if path.startswith("b/"):
                path = path[2:]
            current_file = path
            result.setdefault(current_file, set())
            new_line = None
            continue

        if current_file is None:
            continue

        hunk = hunk_re.match(raw_line)
        if hunk:
            new_line = int(hunk.group(1))
            continue

        if new_line is None:
            continue

        if raw_line.startswith("+") and not raw_line.startswith("+++"):
            result[current_file].add(new_line)
            new_line += 1
        elif raw_line.startswith(" "):
            result[current_file].add(new_line)
            new_line += 1
        elif raw_line.startswith("-") and not raw_line.startswith("---"):
            # deleted line exists only on LEFT; skip RIGHT numbering
            continue

    return result


def finding_hash(finding: dict[str, Any]) -> str:
    """Stable identity across pushes: line numbers, body and head SHA change too often."""
    payload = "|".join(
        [
            str(finding.get("path", "")),
            str(finding.get("severity", "")),
            str(finding.get("title", "")).strip().lower(),
        ]
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16]


def anchor_range(start: int, end: int, changed_lines: set[int]) -> tuple[int, int] | None:
    """Return a range GitHub accepts, or None.

    GitHub requires `start_line` and `line` in the same diff hunk. When all
    lines of the range are in the diff, the range is contiguous and thus in
    one hunk. Otherwise, fall back to one anchored endpoint.
    """
    if all(line in changed_lines for line in range(start, end + 1)):
        return start, end
    if end in changed_lines:
        return end, end
    if start in changed_lines:
        return start, start
    return None


def normalize_finding(raw: dict[str, Any]) -> dict[str, Any] | None:
    path = str(raw.get("path") or "").strip().removeprefix("./")
    title = str(raw.get("title") or "").strip()
    body = str(raw.get("body") or "").strip()
    severity = str(raw.get("severity") or "").strip().lower()
    confidence = str(raw.get("confidence") or "medium").strip().lower()
    side = str(raw.get("side") or "RIGHT").strip().upper()

    if not path or not title or not body:
        return None
    if severity not in SEVERITY_RANK:
        return None
    if confidence not in {"high", "medium", "low"}:
        confidence = "medium"
    if side not in {"LEFT", "RIGHT"}:
        side = "RIGHT"

    start_line = raw.get("start_line", raw.get("line"))
    end_line = raw.get("end_line", start_line)

    def as_line(value: Any) -> int | None:
        if value is None or value == "":
            return None
        try:
            number = int(value)
        except (TypeError, ValueError):
            return None
        return number if number >= 1 else None

    start = as_line(start_line)
    end = as_line(end_line)
    if start is not None and end is None:
        end = start
    if start is not None and end is not None and end < start:
        start, end = end, start

    return {
        "path": path,
        "start_line": start,
        "end_line": end,
        "side": side,
        "severity": severity,
        "title": title,
        "body": body,
        "confidence": confidence,
    }


def main() -> int:
    findings_path = Path(os.environ["FINDINGS_FILE"])
    diff_path = Path(os.environ["DIFF_FILE"])
    output_path = Path(os.environ["OUTPUT_FILE"])
    threshold = os.environ.get("SEVERITY_THRESHOLD", "medium").lower()
    max_findings = int(os.environ.get("MAX_FINDINGS", "25"))

    if threshold not in SEVERITY_RANK:
        print(f"Invalid SEVERITY_THRESHOLD: {threshold}", file=sys.stderr)
        return 2

    payload = load_json(findings_path)
    if not isinstance(payload, dict):
        print("Findings payload must be a JSON object", file=sys.stderr)
        return 1

    summary = str(payload.get("summary") or "").strip() or "Automated review completed."
    raw_findings = payload.get("findings")
    if not isinstance(raw_findings, list):
        print("`findings` must be an array", file=sys.stderr)
        return 1

    diff_map = parse_diff_line_map(diff_path.read_text(encoding="utf-8", errors="replace"))

    accepted: list[dict[str, Any]] = []
    unanchored: list[dict[str, Any]] = []
    rejected: list[str] = []

    for index, raw in enumerate(raw_findings):
        if not isinstance(raw, dict):
            rejected.append(f"#{index}: not an object")
            continue

        finding = normalize_finding(raw)
        if finding is None:
            rejected.append(f"#{index}: missing required fields or invalid severity")
            continue

        if SEVERITY_RANK[finding["severity"]] < SEVERITY_RANK[threshold]:
            rejected.append(f"#{index}: below severity threshold ({finding['severity']})")
            continue

        finding["hash"] = finding_hash(finding)

        path = finding["path"]
        start = finding["start_line"]
        end = finding["end_line"]
        changed_lines = diff_map.get(path)

        # The diff map covers only the RIGHT side; LEFT anchors stay in the summary.
        if start is None or end is None or changed_lines is None or finding["side"] != "RIGHT":
            unanchored.append(finding)
            continue

        anchor = anchor_range(start, end, changed_lines)
        if anchor is None:
            # Keep as summary-only rather than inventing a bad inline anchor.
            unanchored.append(finding)
        else:
            finding["start_line"], finding["end_line"] = anchor
            accepted.append(finding)

    accepted.sort(key=lambda item: (-SEVERITY_RANK[item["severity"]], item["path"], item["title"]))
    unanchored.sort(key=lambda item: (-SEVERITY_RANK[item["severity"]], item["path"], item["title"]))

    accepted = accepted[:max_findings]
    remaining = max_findings - len(accepted)
    unanchored = unanchored[: max(0, remaining)]

    result = {
        "summary": summary,
        "inline_findings": accepted,
        "summary_findings": unanchored,
        "rejected": rejected,
        "counts": {
            "inline": len(accepted),
            "summary": len(unanchored),
            "rejected": len(rejected),
            "raw": len(raw_findings),
        },
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(
        "Validated findings: "
        f"inline={result['counts']['inline']} "
        f"summary={result['counts']['summary']} "
        f"rejected={result['counts']['rejected']}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
