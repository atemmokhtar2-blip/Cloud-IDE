# Cloud IDE

Cloud IDE is a cloud-native browser development platform for creating, editing, running, previewing, and deploying projects from one workspace.

## Current foundation

- Dark-first Cloud IDE brand and landing page
- Dashboard shell
- Browser IDE shell with explorer, editor surface, preview panel, and terminal
- Provider-agnostic workspace engine
- Vercel Sandbox provider for isolated code execution
- Deployment health endpoint at `/api/health`
- Vercel deployment configuration
- GitHub-ready repository workflow
- Production-safe runtime gate for the not-yet-authenticated workspace APIs

## Architecture

Browser
→ Cloud IDE Web App
→ Workspace Manager
→ Workspace Provider
→ Vercel Sandbox

The runtime is intentionally provider-agnostic. The same IDE can later use Docker or Kubernetes without rewriting the frontend.

Vercel Sandbox provides isolated Linux microVMs for running untrusted or user-generated code. Persistent sandboxes can be resumed by name, which fits the Cloud IDE workspace model. Public execution should remain disabled until authentication and workspace ownership are implemented.

## Deploy the web app

The primary web host is Vercel.

1. Import the GitHub repository `atemmokhtar2-blip/Cloud-IDE` into Vercel.
2. Keep the project root at `./`.
3. Vercel should detect Next.js automatically.
4. The repository includes `.nvmrc` targeting Node 24 and `vercel.json`.
5. Build command: `npm run build`.
6. Install command: `npm install`.
7. Deploy.

After deployment, verify:

- `/` landing page
- `/dashboard` dashboard
- `/ide` IDE shell
- `/api/health` returns JSON with `ok: true`

Vercel project environment variables are configured under Project Settings → Environment Variables. Changes to environment variables require a new deployment to take effect. citeturn0search0

## Vercel Sandbox environment variables

The web deployment needs Vercel Sandbox authentication because the Cloud IDE API creates and controls Sandboxes.

Recommended on Vercel:
- `VERCEL_OIDC_TOKEN`

Alternative:
- `VERCEL_TOKEN`
- `VERCEL_TEAM_ID`
- `VERCEL_PROJECT_ID`

Do not commit real secret values to GitHub. The repository contains `.env.example` as a template.

For local development, Vercel documents linking the project and pulling the development OIDC token with `vercel env pull`. citeturn0search1turn0search3

Vercel Sandbox also supports environment variables supplied at sandbox creation and inherited by commands. citeturn0search2

## Runtime safety gate

`CLOUD_IDE_RUNTIME_ENABLED=false` is the safe default.

When false, the workspace creation, command, file, preview, and lifecycle APIs return HTTP 503 instead of exposing sandbox operations publicly.

Do **not** change it to `true` yet. Before enabling it for real users, implement:

- authentication
- workspace ownership checks
- project/file persistence
- rate limiting
- command/resource policies
- process lifecycle
- audit logging

This prevents the deployed site from becoming an unauthenticated remote command-execution service.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Type checking:

```bash
npm run typecheck
```

## Status

Milestone 1 foundation + IDE shell + Vercel deployment preparation + runtime safety gate.
