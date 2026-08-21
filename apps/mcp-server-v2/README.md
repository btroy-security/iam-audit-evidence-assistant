# IAM Audit Evidence Assistant — MCP Server

A Model Context Protocol (MCP) server exposing the IAM Audit Evidence
Assistant's control library as structured tools. This is Phase 3 of the
project: it replaces the AI assistant's current shortcut (reading
`controls.json` directly) with a proper, standalone service that any MCP
client — including this project's own AI assistant, once Phase 4 connects
them — can query.

This server owns its own copy of the control library
(`src/data/controls.json`), independent from `apps/web`'s copy, so the two
apps stay properly decoupled — the same way a real client/server pair
would in production.

## Why stateless mode

While building an MCP *client* earlier (for a classroom exercise against a
different, external MCP server), we hit a real bug: that server's
sessions expired faster than expected, causing repeated failures. This
server deliberately runs in **stateless mode** — every request gets its
own short-lived connection with no session to track or expire. It's
simpler and more robust for a server like this one.

## Tools

| Tool | What it does |
|---|---|
| `list_frameworks` | Lists supported frameworks with control counts and topics. |
| `search_controls` | Searches by framework, topic, and/or keyword. |
| `get_control_details` | Returns the complete record for one control. |
| `get_evidence_requirements` | Returns evidence types, owner, quality criteria, and review frequency for one control. |
| `validate_evidence_status` | Accepts a checklist of evidence statuses; returns the same transparent, rules-based readiness score used by the web app. |
| `compare_controls` | Compares 2-5 controls, explicitly not claiming legal equivalence. |
| `generate_remediation_guidance` | Returns structured remediation recommendations for named evidence gaps. |

Every tool validates its input with a Zod schema and returns a clear,
specific error message for invalid framework names, control ids, or
evidence item ids — it never silently fails or guesses.

## Local development

```bash
cd apps/mcp-server
npm install
npm run dev
```

This starts the server on **http://localhost:5000** (override with a
`PORT` environment variable), watching for file changes.

For a production-style run:
```bash
npm run build
npm start
```

## Testing

`test-client.mjs` is a real MCP client that connects to a running server
and exercises all 7 tools, including invalid-input cases. With the server
running in one terminal:

```bash
node test-client.mjs
```

Prints each tool's response and a final `ALL TESTS PASSED` /
`N TEST(S) FAILED` summary.

## Endpoints

- `POST /mcp` — the MCP endpoint (JSON-RPC over streamable HTTP)
- `GET /health` — simple status check, no MCP protocol needed

## Current limitations

- No authentication yet — fine for local development, but this would need
  a bearer-token scheme (like the classroom MCP server this project
  connected to) before any public deployment.
- Not yet connected to the web app's AI assistant — that's Phase 4. Right
  now this server runs standalone and can be tested with `test-client.mjs`
  or any other MCP client.
- Runs locally only; Vercel/cloud deployment is Phase 5.
