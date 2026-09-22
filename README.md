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

## Architecture

Browser
→ Cloud IDE Web App
→ Workspace Manager
→ Workspace Provider
→ Vercel Sandbox

The runtime is intentionally provider-agnostic. The same IDE can later use Docker or Kubernetes without rewriting the frontend.

Vercel Sandbox provides isolated Linux microVMs for running untrusted or user-generated code. Persistent sandboxes can be resumed by name, which fits the Cloud IDE workspace model. See the official Vercel Sandbox documentation before enabling user execution in production.

## Deploy the web app

The primary web host is Vercel.

1. Import the GitHub repository `atemmokhtar2-blip/Cloud-IDE` into Vercel.
2. Keep the project root at `./`.
3. Vercel should detect Next.js automatically.
4. The repository already includes `.nvmrc` targeting Node 24 and `vercel.json`.
5. Build command: `npm run build`.
6. Install command: `npm install`.
7. Deploy.

After deployment, verify:

- `/` landing page
- `/dashboard` dashboard
- `/ide` IDE shell
- `/api/health` returns JSON with `ok: true`

Vercel supports zero-config Next.js deployments and can deploy from Git pushes. Production secrets should be added through Vercel project environment variables rather than committed to Git.

## Vercel Sandbox runtime

The codebase contains `lib/workspace/vercel-sandbox.ts`, which keeps sandbox operations behind the `WorkspaceProvider` interface.

The next runtime milestone will add:

- authenticated workspace creation
- project/file persistence
- command execution API
- process lifecycle
- live preview URLs
- resource and timeout policies
- workspace ownership checks
- audit logging

Do not expose the command execution method directly to unauthenticated users.

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

Milestone 1 foundation + IDE shell + deployment preparation.

