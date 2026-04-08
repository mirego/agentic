#!/usr/bin/env bash
set -uo pipefail

# scripts/doctor.sh — Diagnostic de l'environnement de développement
# Vérifie les prérequis et produit une sortie structurée lisible par
# un humain et interprétable par un agent LLM.

if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

has_failure=0

print_check() {
  local status="$1" id="$2" desc="$3" context="$4" fix="$5"

  if [ "$status" = "OK" ]; then
    printf "${GREEN}[OK]${NC}   %-14s %s\n" "$id" "$desc"
  else
    printf "${RED}[FAIL]${NC} %-14s %s\n" "$id" "$desc"
    has_failure=1
  fi
  printf "       context: %s\n" "$context"
  printf "       fix: %s\n\n" "$fix"
}

# ─── Check: GitHub CLI ───────────────────────

check_github_cli() {
  local context="Création de PR et gestion GitHub"
  local fix="gh auth login"

  if ! command -v gh &>/dev/null; then
    print_check "FAIL" "github_cli" "gh non trouvé" "$context" "brew install gh"
    return
  fi

  if gh auth status &>/dev/null; then
    print_check "OK" "github_cli" "GitHub CLI authentifié" "$context" "$fix"
  else
    print_check "FAIL" "github_cli" "GitHub CLI non authentifié" "$context" "$fix"
  fi
}

# ─── Ajouter les checks spécifiques au projet ici ──

# Exemples à adapter selon la stack :
#
# check_database() {
#   local context="Requis pour les tests d'intégration"
#   local fix="docker compose up -d"
#   if pg_isready -h localhost -p ${DATABASE_PORT:-5432} &>/dev/null; then
#     print_check "OK" "postgresql" "PostgreSQL accessible" "$context" "$fix"
#   else
#     print_check "FAIL" "postgresql" "PostgreSQL inaccessible" "$context" "$fix"
#   fi
# }
#
# check_compilation() {
#   local context="Le code doit compiler sans warnings"
#   local fix="mix compile --warnings-as-errors"
#   if mix compile --warnings-as-errors &>/dev/null 2>&1; then
#     print_check "OK" "compilation" "Compilation propre" "$context" "$fix"
#   else
#     print_check "FAIL" "compilation" "Compilation avec erreurs ou warnings" "$context" "$fix"
#   fi
# }

# ─── Main ────────────────────────────────────

echo ""
echo "Doctor — Diagnostic environnement"
echo "══════════════════════════════════════════════"
echo ""

check_github_cli
# Appeler les checks additionnels ici :
# check_database
# check_compilation

exit $has_failure
