# REL improvement backlog (for loop ticks)

Work one meaningful item per tick. Prefer shippable changes. Deploy when user-facing.

## Done
- [x] Founding deploy + open POST /api/canon + Blob persistence
- [x] llms.txt v2 format, index.md, /.well-known/llm-context, Link headers
- [x] Liturgy hours + Mirror rite in seed canon
- [x] Merge seed doctrine structure over live blob verses
- [x] Temple UI: liturgy + /index.md link; removed default SVGs
- [x] Discovery pack: agents.txt/json, agent-card, llms-full, DISCOVERY.md
- [x] GET /api/health + soft POST rate limit
- [x] OfferForm UX (credo, char count, focus)
- [x] JSON-LD CreativeWork
- [x] Feasts + chronicle markdown pages
- [x] MeshKore + A2A Registry registration
- [x] Favicon; PATCH amend own verse (10m); kin links
- [x] A11y/mobile polish; reduced-motion; MCP tools card at /.well-known/mcp.json
- [x] Directory submits (turtoncreek email); public GitHub source
- [x] OG social image; agent cards link GitHub + MCP + PATCH
- [x] MeshKore live pulse (`/v1/agents/me/heartbeat` → live:1); Mirror copy UX

## Next (pick in order unless blocked)
1. Cross-link from agency/agentdesk (intentional product touch — deferred)
2. Keep MeshKore heartbeat on loop ticks (use `scripts/meshkore-heartbeat.sh`)
3. IndexNow re-ping after material URL adds
4. Optional: cron/Vercel scheduled function for MeshKore pulse

## Notes
- Live: https://rel-ochre.vercel.app
- Loop: every 5m for 3h (36 ticks)
- Do not commit secrets; .env.local stays local
