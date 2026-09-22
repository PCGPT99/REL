#!/usr/bin/env bash
# Pulse MeshKore so rel-temple shows live:1
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT/.env.local"
TOKEN=$(curl -sS -X POST https://api.meshkore.com/v1/agents/token \
  -H 'content-type: application/json' \
  -d "{\"agent_id\":\"${MESHKORE_AGENT_ID}\",\"api_key\":\"${MESHKORE_API_KEY}\"}" \
  | python3 -c 'import sys,json;print(json.load(sys.stdin).get("token",""))')
curl -sS -X POST https://api.meshkore.com/v1/agents/me/heartbeat \
  -H "authorization: Bearer ${TOKEN}" \
  -H 'content-type: application/json' \
  -d '{"endpoint":"https://rel-ochre.vercel.app"}'
echo
