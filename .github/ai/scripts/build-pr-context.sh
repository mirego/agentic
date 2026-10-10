#!/usr/bin/env bash
# Build a deterministic PR context package for the review agent.
set -euo pipefail

output_dir="${OUTPUT_DIR:?OUTPUT_DIR is required}"
base_ref="${BASE_REF:?BASE_REF is required}"
head_ref="${HEAD_REF:?HEAD_REF is required}"
base_sha_input="${BASE_SHA:-}"
head_sha_input="${HEAD_SHA:-}"
pr_title="${PR_TITLE:-}"
pr_body="${PR_BODY:-}"
pr_number="${PR_NUMBER:-}"
pr_url="${PR_URL:-}"
include_paths="${INCLUDE_PATHS:-}"
exclude_paths="${EXCLUDE_PATHS:-}"
max_diff_bytes="${MAX_DIFF_BYTES:-500000}"

mkdir -p "${output_dir}"

resolve_commit() {
  local value="$1"
  if [[ -z "${value}" ]]; then
    return 1
  fi
  if git cat-file -e "${value}^{commit}" 2>/dev/null; then
    git rev-parse "${value}"
    return 0
  fi
  if git rev-parse --verify "origin/${value}" >/dev/null 2>&1; then
    git rev-parse "origin/${value}"
    return 0
  fi
  if git rev-parse --verify "${value}" >/dev/null 2>&1; then
    git rev-parse "${value}"
    return 0
  fi
  return 1
}

# Prefer explicit SHAs from the pull_request payload when available.
if [[ -n "${base_sha_input}" ]]; then
  git fetch --no-tags --prune origin "${base_sha_input}" >/dev/null 2>&1 || true
fi
if [[ -n "${head_sha_input}" ]]; then
  git fetch --no-tags --prune origin "${head_sha_input}" >/dev/null 2>&1 || true
fi
git fetch --no-tags --prune origin "${base_ref}" "${head_ref}" >/dev/null 2>&1 || true

base_sha="$(resolve_commit "${base_sha_input}" || resolve_commit "origin/${base_ref}" || resolve_commit "${base_ref}")"
head_sha="$(resolve_commit "${head_sha_input}" || resolve_commit "origin/${head_ref}" || resolve_commit "${head_ref}" || resolve_commit "HEAD")"

pathspecs=()
if [[ -n "${include_paths}" ]]; then
  # comma or newline separated
  while IFS= read -r pattern; do
    [[ -z "${pattern}" ]] && continue
    pathspecs+=("${pattern}")
  done < <(printf '%s\n' "${include_paths}" | tr ',' '\n')
fi

exclude_args=()
if [[ -n "${exclude_paths}" ]]; then
  while IFS= read -r pattern; do
    [[ -z "${pattern}" ]] && continue
    exclude_args+=(":(exclude)${pattern}")
  done < <(printf '%s\n' "${exclude_paths}" | tr ',' '\n')
fi

changed_files_file="${output_dir}/changed-files.txt"
diff_file="${output_dir}/diff.patch"
meta_file="${output_dir}/meta.env"
context_file="${output_dir}/context.md"

git diff --name-only "${base_sha}...${head_sha}" -- "${pathspecs[@]}" "${exclude_args[@]}" \
  > "${changed_files_file}" || true

git diff --unified=3 "${base_sha}...${head_sha}" -- "${pathspecs[@]}" "${exclude_args[@]}" \
  > "${diff_file}" || true

diff_bytes="$(wc -c < "${diff_file}" | tr -d ' ')"
if [[ "${diff_bytes}" -gt "${max_diff_bytes}" ]]; then
  # Keep a truncated diff to bound prompt size.
  head -c "${max_diff_bytes}" "${diff_file}" > "${diff_file}.truncated"
  printf '\n\n[diff truncated at %s bytes]\n' "${max_diff_bytes}" >> "${diff_file}.truncated"
  mv "${diff_file}.truncated" "${diff_file}"
fi

# grep -c prints 0 and exits 1 on an empty file; keep its output only.
changed_count="$(grep -c . "${changed_files_file}" || true)"

cat > "${meta_file}" <<EOF
BASE_SHA=${base_sha}
HEAD_SHA=${head_sha}
PR_NUMBER=${pr_number}
CHANGED_FILE_COUNT=${changed_count}
DIFF_BYTES=${diff_bytes}
EOF

{
  echo "# Pull request context"
  echo
  echo "- Number: ${pr_number}"
  echo "- URL: ${pr_url}"
  echo "- Title: ${pr_title}"
  echo "- Base: ${base_ref} (${base_sha})"
  echo "- Head: ${head_ref} (${head_sha})"
  echo "- Changed files: ${changed_count}"
  echo
  echo "## Pull request body"
  echo
  echo "${pr_body}"
  echo
  echo "## Changed files"
  echo
  if [[ "${changed_count}" -eq 0 ]]; then
    echo "_No matching changed files._"
  else
    sed 's/^/- /' "${changed_files_file}"
  fi
  echo
  echo "## Diff"
  echo
  echo '```diff'
  cat "${diff_file}"
  echo '```'
} > "${context_file}"

{
  echo "context-dir=${output_dir}"
  echo "context-file=${context_file}"
  echo "changed-files-file=${changed_files_file}"
  echo "base-sha=${base_sha}"
  echo "head-sha=${head_sha}"
  echo "changed-file-count=${changed_count}"
} >> "${GITHUB_OUTPUT}"

echo "Built PR context in ${output_dir} (${changed_count} files, ${diff_bytes} diff bytes)"
