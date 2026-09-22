# Cloud IDE

Cloud IDE is a cloud-native browser development platform for creating, editing, running, previewing, and deploying projects from one workspace.

## Foundation MVP

- Dark-first Cloud IDE brand and landing page
- Dashboard shell
- Browser IDE shell
- Provider-agnostic workspace engine interface
- Vercel Sandbox integration point for future isolated execution
- Live preview architecture
- GitHub integration architecture
- Deployment architecture

## Architecture

Browser
→ Cloud IDE Web App
→ Workspace Manager
→ Workspace Provider
→ Sandbox / Container Runtime

The runtime is intentionally provider-agnostic so the execution layer can move from a hosted sandbox to dedicated containers or Kubernetes later without rewriting the IDE.

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Status

Early foundation / Milestone 1.
