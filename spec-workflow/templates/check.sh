#!/usr/bin/env bash
set -uo pipefail

# scripts/check.sh — Vérifications de qualité du code
# Même format structuré que doctor.sh — absorbe la sortie verbeuse
# des commandes et ne produit qu'un résumé compact.

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

# ─── Ajouter les checks spécifiques au projet ici ──

# Exemples à adapter selon la stack :
#
# Elixir/Phoenix :
# check_format() {
#   local context="Formatage du code Elixir"
#   local fix="mix format"
#   if mix format --check-formatted &>/dev/null 2>&1; then
#     print_check "OK" "format" "Code formaté" "$context" "$fix"
#   else
#     print_check "FAIL" "format" "Code non formaté" "$context" "$fix"
#   fi
# }
#
# check_compile() {
#   local context="Compilation sans warnings"
#   local fix="mix compile --warnings-as-errors"
#   if mix compile --warnings-as-errors &>/dev/null 2>&1; then
#     print_check "OK" "compile" "Compilation propre" "$context" "$fix"
#   else
#     print_check "FAIL" "compile" "Erreurs de compilation" "$context" "$fix"
#   fi
# }
#
# check_test() {
#   local context="Suite de tests"
#   local fix="mix test"
#   if mix test &>/dev/null 2>&1; then
#     print_check "OK" "test" "Tests passent" "$context" "$fix"
#   else
#     print_check "FAIL" "test" "Tests en échec" "$context" "$fix"
#   fi
# }
#
# Node.js/TypeScript :
# check_format()  → npm run format -- --check
# check_compile() → npm run build
# check_test()    → npm test

# ─── Main ────────────────────────────────────

echo ""
echo "Quality checks"
echo "══════════════════════════════════════════════"
echo ""

# Appeler les checks ici :
# check_format
# check_compile
# check_test

exit $has_failure
