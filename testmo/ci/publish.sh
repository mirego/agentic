#!/usr/bin/env bash
# publish.sh — Publie des résultats JUnit XML dans Testmo, depuis n'importe quelle CI.
#
# Toutes les entrées sont explicites (variables d'environnement) ; voir README.md.
# Ce script n'est JAMAIS bloquant : token absent, résultats absents, config
# invalide ou échec du CLI → avertissement et sortie 0. Le token n'est jamais
# affiché ni passé en argument : le CLI Testmo le lit dans TESTMO_TOKEN.

set -uo pipefail

TESTMO_CLI_VERSION="1.5.0"
# Commande du CLI Testmo. Surchargée par les tests du paquet pour simuler le CLI.
TESTMO_CLI="${TESTMO_CLI:-npx -y @testmo/testmo-cli@${TESTMO_CLI_VERSION}}"

warn() {
  if [ "${GITHUB_ACTIONS:-}" = "true" ]; then
    echo "::warning title=Testmo::$1"
  else
    echo "warning (testmo): $1" >&2
  fi
}

skip() {
  warn "$1 — publication Testmo sautée."
  exit 0
}

[ -n "${TESTMO_TOKEN:-}" ] || skip "TESTMO_TOKEN absent"

for var in TESTMO_RESULTS TESTMO_SOURCE TESTMO_RUN_NAME TESTMO_COMMIT TESTMO_BRANCH; do
  [ -n "${!var:-}" ] || skip "$var absent"
done

command -v jq >/dev/null 2>&1 || skip "jq introuvable"

config="${TESTMO_CONFIG:-.testmo.json}"
[ -f "$config" ] || skip "configuration $config introuvable"

instance="$(jq -r '.instance // empty' "$config" 2>/dev/null)"
project_id="$(jq -r '.project_id // empty' "$config" 2>/dev/null)"
[ -n "$instance" ] && [ -n "$project_id" ] || skip "instance ou project_id absent de $config"

shopt -s globstar nullglob 2>/dev/null || shopt -s nullglob
# shellcheck disable=SC2206 # expansion volontaire du glob
matches=($TESTMO_RESULTS)
shopt -u globstar nullglob 2>/dev/null || shopt -u nullglob
[ "${#matches[@]}" -gt 0 ] || skip "aucun fichier de résultats pour « $TESTMO_RESULTS »"

resources="$(mktemp "${TMPDIR:-/tmp}/testmo-resources.XXXXXX")"
trap 'rm -f "$resources"' EXIT

jq -n \
  --arg commit "$TESTMO_COMMIT" \
  --arg branch "$TESTMO_BRANCH" \
  --arg author "${TESTMO_CHANGE_AUTHOR:-}" \
  --arg triggered_by "${TESTMO_TRIGGERED_BY:-}" \
  --arg change_url "${TESTMO_CHANGE_URL:-}" \
  --arg commit_url "${TESTMO_COMMIT_URL:-}" \
  --arg build_url "${TESTMO_BUILD_URL:-}" \
  '
  def field($name; $value): if $value == "" then empty else {type: "string", name: $name, value: $value} end;
  def link($name; $url): if $url == "" then empty else {name: $name, url: $url} end;
  {
    fields: [
      field("Commit"; $commit),
      field("Branch"; $branch),
      field("Author"; $author),
      field("Triggered by"; $triggered_by)
    ],
    links: [
      link("Change"; $change_url),
      link("Commit"; $commit_url),
      link("Build"; $build_url)
    ]
  }
  ' >"$resources" || skip "impossible de construire le fichier de ressources"

args=(
  automation:run:submit
  --instance "$instance"
  --project-id "$project_id"
  --name "$TESTMO_RUN_NAME"
  --source "$TESTMO_SOURCE"
  --results "$TESTMO_RESULTS"
  --resources "$resources"
  --no-ansi
)

# Tags séparés par des virgules ou des espaces ; les deux-points sont refusés par Testmo.
if [ -n "${TESTMO_TAGS:-}" ]; then
  read -r -a tags <<<"$(echo "$TESTMO_TAGS" | tr ',:' ' -')"
  [ "${#tags[@]}" -gt 0 ] && args+=(--tags "${tags[@]}")
fi

echo "Testmo : publication de ${#matches[@]} fichier(s) de résultats (source « $TESTMO_SOURCE »)."

# shellcheck disable=SC2086 # TESTMO_CLI est une commande composée
if ! $TESTMO_CLI "${args[@]}"; then
  warn "échec du CLI Testmo — publication non effectuée"
fi

exit 0
