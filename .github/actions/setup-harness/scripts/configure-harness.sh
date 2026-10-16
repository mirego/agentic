#!/usr/bin/env bash
set -euo pipefail

config_dir="${RUNNER_TEMP}/pi-agent-harness"
mkdir -p "${config_dir}"

models_json_path="${config_dir}/models.json"
settings_json_path="${config_dir}/settings.json"

if [[ -n "${MODELS_JSON:-}" ]]; then
  printf '%s\n' "${MODELS_JSON}" > "${models_json_path}"
else
  api_key_field=""
  if [[ -n "${API_KEY_ENV:-}" ]]; then
    api_key_field=$(printf ',\n      "apiKey": "$%s"' "${API_KEY_ENV}")
  fi

  cat > "${models_json_path}" <<EOF
{
  "providers": {
    "${PROVIDER}": {
      "baseUrl": "${BASE_URL}",
      "api": "openai-completions"${api_key_field},
      "compat": {
        "supportsDeveloperRole": false,
        "requiresThinkingAsText": true
      },
      "models": [
        {
          "id": "claude-opus-5-reasoning",
          "name": "Claude Opus 5",
          "reasoning": true,
          "input": ["text", "image"],
          "contextWindow": 1000000,
          "maxTokens": 128000
        },
        {
          "id": "claude-sonnet-5",
          "name": "Claude Sonnet 5",
          "reasoning": true,
          "input": ["text", "image"],
          "contextWindow": 1000000,
          "maxTokens": 128000
        },
        {
          "id": "gpt-5.5",
          "name": "GPT-5.5",
          "reasoning": true,
          "input": ["text", "image"],
          "contextWindow": 1050000,
          "maxTokens": 128000
        },
        {
          "id": "gpt-5.6-sol",
          "name": "GPT-5.6 Sol",
          "reasoning": true,
          "input": ["text", "image"],
          "contextWindow": 272000,
          "maxTokens": 128000
        },
        {
          "id": "gpt-5.6-terra",
          "name": "GPT-5.6 Terra",
          "reasoning": true,
          "input": ["text", "image"],
          "contextWindow": 272000,
          "maxTokens": 128000
        },
        {
          "id": "gpt-5.6-luna",
          "name": "GPT-5.6 Luna",
          "reasoning": true,
          "input": ["text", "image"],
          "contextWindow": 272000,
          "maxTokens": 128000
        },
        {
          "id": "grok-4.5",
          "name": "Grok 4.5",
          "reasoning": true,
          "input": ["text", "image"],
          "contextWindow": 500000,
          "maxTokens": 128000
        },
        {
          "id": "azure-kimi-k2.7-code",
          "name": "Kimi K2.7-Code",
          "reasoning": true,
          "input": ["text", "image"],
          "contextWindow": 262144,
          "maxTokens": 262144
        },
        {
          "id": "azure-kimi-k3",
          "name": "Kimi K3",
          "reasoning": true,
          "input": ["text", "image"],
          "contextWindow": 262144,
          "maxTokens": 262144
        },
        {
          "id": "azure-kimi-k2.6",
          "name": "Kimi K2.6",
          "reasoning": true,
          "input": ["text"],
          "contextWindow": 262144,
          "maxTokens": 262144
        },
        {
          "id": "azure-deepseek-v4-pro",
          "name": "DeepSeek V4 Pro",
          "reasoning": true,
          "input": ["text"],
          "contextWindow": 1000000,
          "maxTokens": 128000
        },
        {
          "id": "azure-glm-5.2",
          "name": "GLM 5.2",
          "reasoning": true,
          "input": ["text"],
          "contextWindow": 1000000,
          "maxTokens": 128000
        }
      ]
    }
  }
}
EOF
fi

cat > "${settings_json_path}" <<'EOF'
{
  "defaultProjectTrust": "never",
  "enableInstallTelemetry": false
}
EOF

{
  echo "PI_CODING_AGENT_DIR=${config_dir}"
  echo "PI_SKIP_VERSION_CHECK=1"
  echo "PI_TELEMETRY=0"
  echo "PI_OFFLINE=0"
} >> "${GITHUB_ENV}"

{
  echo "config-dir=${config_dir}"
  echo "models-json-path=${models_json_path}"
  echo "provider=${PROVIDER}"
} >> "${GITHUB_OUTPUT}"

echo "Configured Pi harness in ${config_dir}"
echo "models.json -> ${models_json_path}"
if command -v jq >/dev/null 2>&1; then
  jq -e . "${models_json_path}" >/dev/null
fi
