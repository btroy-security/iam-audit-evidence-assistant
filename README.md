# IAM Audit Evidence Assistant

An educational audit-readiness tool for Identity and Access Management (IAM)
controls. It helps analysts, control owners, and students understand what
evidence an auditor typically expects for a given IAM control, and provides
a transparent, rules-based way to self-assess readiness before a real audit.

> **Status: Phase 1 complete.** This README will grow as later phases (AI
> assistant, MCP server, deployment) are added.

## The business problem

Preparing for an IAM-related audit (SOX, PCI DSS, NIST-aligned assessments,
etc.) is often harder than it should be — not because the controls are
unclear, but because it's not always obvious *what evidence proves a control
is working*, *who should own that evidence*, or *how "good" evidence differs
from "not quite good enough."* Teams often find this out the hard way, in
the middle of an actual audit.

## Why I built this

I work in IAM and IT security/compliance, with hands-on experience across
Active Directory, SailPoint, Okta, CyberArk, ServiceNow, and SIEM platforms,
plus a background in access reviews, entitlement validation, and audit
readiness. This project is a practical way to combine that background with
what I'm learning about building applications and AI-assisted tools — while
producing something genuinely useful for practicing audit-readiness
thinking.

## What the application does (Phase 1)

- **Home dashboard** — overview of available frameworks and controls, entry
  point into the app.
- **Control Explorer** — search and filter the IAM control library by
  framework, topic, or keyword.
- **Audit Evidence Workspace** — for a selected control: plain-language
  explanation, evidence an auditor may request, ownership, review frequency,
  example audit test/finding, risks, and recommended remediation.
- **Evidence Validation Checklist** — mark each evidence item as Available,
  Missing, Incomplete, Outdated, or Not applicable, with optional notes.
- **Assessment Results** — a transparent, rules-based readiness score and
  status, with the specific reasons behind the score, identified gaps, and a
  printable/exportable summary.

## How the readiness score works

The score is **not** decided by an AI model. It's a visible, rules-based
calculation in `lib/scoring.ts`:

- Each evidence status (Missing, Incomplete, Outdated, Available, Not
  applicable) has a defined point deduction.
- The control's documented risk severity applies a multiplier (Low 0.8x —
  Critical 1.5x).
- Controls involving privileged access get an extra 1.15x weight.
- The final score maps to one of four readiness statuses: Ready, Partially
  ready, Evidence gaps identified, Significant gaps identified.

Every contributing factor is shown back to the user as plain-English
reasons on the Assessment Results screen.

## How the AI assistant works

*Not yet built — planned for Phase 2.* It will run server-side, use the
selected control as context, and answer follow-up questions about evidence,
ownership, and remediation. It will never be the sole source of control
facts (see MCP server, below) and will always be clearly labeled as
AI-generated guidance, not a compliance determination.

## How the MCP server works

*Not yet built — planned for Phase 3.* A small TypeScript MCP server will
become the controlled source of truth for framework/control data, exposing
tools like `search_controls`, `get_control_details`, and
`validate_evidence_status`. The AI assistant will be required to retrieve
facts from this server rather than inventing them.

## Supported frameworks (Phase 1 sample library)

- NIST SP 800-53 (Account Management — AC-2, Privileged Access — AC-6,
  Multifactor Authentication — IA-2, Password/Authenticator Management — IA-5)
- NIST Cybersecurity Framework (User Deprovisioning, Joiner-Mover-Leaver
  Lifecycle — concepts)
- PCI DSS (Periodic User Access Reviews — concept)
- SOX (Segregation of Duties — concept)
- CIS Controls (Logging & Monitoring of Privileged Activity, Service
  Accounts — concepts)

10 control records across 4 frameworks and 10 of the 14 IAM topics in the
full spec. Where an official control identifier could be verified, it's
included (AC-2, AC-6, IA-2, IA-5). Where it couldn't, the record is
explicitly labeled a "general control concept" rather than an invented
official number.

## Application architecture

```
apps/
├── web/            Next.js (TypeScript, Tailwind) — frontend + API routes
└── mcp-server/      (Phase 3) TypeScript MCP server — source of truth for control data
```

The frontend never talks to an AI provider or holds API keys directly — that
will live in server-side API routes (`app/api/...`) once Phase 2 is built.

## Security safeguards

- No AI API keys in this Phase 1 build (none are needed yet).
- `.env` files are git-ignored; `.env.example` will be added in Phase 2 with
  placeholder values only.
- All sample/demo data is fictional — no real employee, employer, or
  production-system information.
- Dependency versions were checked against known CVEs during setup
  (including a Next.js React Server Components vulnerability, CVE-2025-66478
  and its follow-ups) and pinned to patched releases.
- Two remaining `npm audit` findings (in `sharp`/`postcss`, both **internal**
  build-time dependencies bundled inside Next.js's own image-optimization
  pipeline, which this app doesn't use) are not resolvable without an
  unsupported downgrade of Next.js itself; they don't affect this app's
  runtime code and are noted here for transparency.
- This application does not claim to certify any organization as compliant
  and is not a substitute for a qualified auditor.

## Local installation

Requirements: Node.js 20+ and npm (already verified working if you're
reading this as part of our build process).

```bash
cd apps/web
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

## Environment variables

None required for Phase 1. Phase 2 will introduce `.env.example` for the AI
provider API key.

## Testing instructions

```bash
cd apps/web
npx tsc --noEmit    # type-check
npm run lint        # ESLint
npm run build       # production build
```

Automated test suite (`npm test`) will be added alongside the MCP server in
Phase 3, per the testing requirements (search, retrieval, invalid IDs,
evidence validation, risk scoring).

## GitHub and Vercel deployment

*Instructions will be added once we publish the repository together.*

## Current limitations

- No AI assistant yet (Phase 2).
- No MCP server yet (Phase 3) — control data is read directly from a local
  JSON file.
- Only 10 sample control records so far (of the 14 IAM topics in the full
  spec — still open: User Provisioning, Dormant/Inactive Accounts, Periodic
  Entitlement Reviews, and a standalone Least Privilege record distinct
  from Privileged Access).
- Evidence checklist state is stored in the browser's session storage only
  — it is not saved to a database and will not persist across devices or
  browser sessions.
- No authentication — this is a single-user portfolio/demo tool.

## Future enhancements

- AI assistant with MCP-backed retrieval (Phases 2–4)
- Full 14-topic control library
- Persistent storage for assessments (database instead of session storage)
- `compare_controls` cross-framework comparison view
- Accessibility and security review pass (Phase 5)

## Screenshots

*To be added once the app is deployed.*

## Educational-use disclaimer

This application is an educational audit-readiness aid. It does not
certify any organization as compliant with any framework, does not perform
a formal audit, and is not a substitute for a qualified auditor or legal/
compliance counsel. All control records, evidence examples, and scenarios
use realistic but fictional data.
