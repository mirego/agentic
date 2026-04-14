.PHONY: help setup

help:
	@echo "════════════════════════════════════════════════════════"
	@echo "  mirego-agentic"
	@echo "════════════════════════════════════════════════════════"
	@echo ""
	@echo "Installation :"
	@echo "  make setup           Configuration initiale du projet"
	@echo ""

setup:
	ln -sf AGENTS.md CLAUDE.md

.DEFAULT_GOAL := help
