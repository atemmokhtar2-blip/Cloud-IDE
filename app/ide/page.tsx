"use client";

import { useMemo, useState } from "react";
import "./ide.css";

const files = [
  { name: "app", kind: "folder" },
  { name: "page.tsx", kind: "file", path: "page.tsx" },
  { name: "layout.tsx", kind: "file", path: "layout.tsx" },
  { name: "globals.css", kind: "file", path: "globals.css" },
  { name: "package.json", kind: "file", path: "package.json" },
  { name: "README.md", kind: "file", path: "README.md" },
];

const initialContent: Record<string, string> = {
  "page.tsx": "export default function Home() {\n  return (\n    <main>\n      <h1>Welcome to Cloud IDE</h1>\n      <p>Start building in the cloud.</p>\n    </main>\n  );\n}",
  "layout.tsx": "export default function RootLayout({\n  children,\n}: {\n  children: React.ReactNode;\n}) {\n  return (\n    <html lang=\"en\">\n      <body>{children}</body>\n    </html>\n  );\n}",
  "globals.css": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n}",
  "package.json": "{\n  \"name\": \"starter-project\",\n  \"private\": true,\n  \"scripts\": {\n    \"dev\": \"next dev\"\n  }\n}",
  "README.md": "# Starter project\n\nCreated in Cloud IDE.\n",
};

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

export default function IDEPage() {
  const [activeFile, setActiveFile] = useState("page.tsx");
  const [content, setContent] = useState(initialContent["page.tsx"]);
  const [terminal, setTerminal] = useState(["$ cloud-ide workspace", "Workspace not started.", "$ "]);
  const [preview, setPreview] = useState("Start a workspace to run your project.");
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const lineCount = useMemo(() => content.split("\n").length, [content]);

  function openFile(path: string) {
    setActiveFile(path);
    setContent(initialContent[path] ?? "");
  }

  async function ensureWorkspace() {
    if (workspaceId) return workspaceId;
    const data = await api<{ workspace: { id: string } }>("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: "starter-project" }),
    });
    setWorkspaceId(data.workspace.id);

    for (const [path, fileContent] of Object.entries(initialContent)) {
      await api("/api/workspaces/" + encodeURIComponent(data.workspace.id) + "/files", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, content: fileContent }),
      });
    }
    return data.workspace.id;
  }

  async function saveActiveFile(id = workspaceId) {
    if (!id) return;
    await api("/api/workspaces/" + encodeURIComponent(id) + "/files", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: activeFile, content }),
    });
  }

  async function runCommand() {
    setBusy(true);
    setTerminal((current) => [...current.slice(-8), "$ cloud-ide run", "Creating isolated workspace..."]);
    try {
      const id = await ensureWorkspace();
      await saveActiveFile(id);
      const data = await api<{ result: { exitCode: number; stdout: string; stderr: string } }>(
        "/api/workspaces/" + encodeURIComponent(id) + "/command",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: "node --version && printf \\"Cloud IDE workspace ready\\n\"" }),
        },
      );
      const output = [data.result.stdout, data.result.stderr].filter(Boolean).join("\n").trim();
      setTerminal((current) => [...current.slice(-8), output || "Command completed.", "$ "]);
      setPreview("Workspace running. Runtime is connected to Vercel Sandbox.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Runtime error";
      setTerminal((current) => [...current.slice(-8), "✕ " + message, "$ "]);
      setPreview("Runtime error — check the terminal output.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="ide-shell">
      <header className="ide-topbar">
        <a className="ide-brand" href="/"><span className="brand-mark">C</span><span>Cloud IDE</span></a>
        <div className="workspace-name"><span className="live-dot" /> {workspaceId ? "workspace connected" : "starter-project"}</div>
        <div className="ide-actions"><button onClick={runCommand} disabled={busy}>{busy ? "Running…" : "Run"}</button><button className="deploy">Deploy</button><a href="/dashboard">Dashboard</a></div>
      </header>
      <div className="ide-layout">
        <aside className="explorer">
          <div className="explorer-head"><span>EXPLORER</span><button>＋</button></div>
          <div className="root-name">⌄ STARTER-PROJECT</div>
          {files.map((file) => (
            <button key={file.name} className={file.path === activeFile ? "file active" : "file"} onClick={() => file.path && openFile(file.path)}>
              <span>{file.kind === "folder" ? "⌄" : "◦"}</span>{file.name}
            </button>
          ))}
        </aside>
        <section className="editor-panel">
          <div className="editor-tabs"><div className="editor-tab active"><span>◦</span>{activeFile}<b>×</b></div></div>
          <div className="code-area">
            <div className="line-numbers">{Array.from({ length: Math.max(lineCount, 1) }, (_, i) => <span key={i}>{i + 1}</span>)}</div>
            <textarea spellCheck={false} value={content} onChange={(event) => setContent(event.target.value)} aria-label="Code editor" />
          </div>
        </section>
        <aside className="preview-panel">
          <div className="panel-head"><span>PREVIEW</span><span className={workspaceId ? "panel-state" : "panel-state offline"}>{workspaceId ? "● CONNECTED" : "○ OFFLINE"}</span></div>
          <div className="preview-frame">
            <div className="preview-browser"><span>○</span><span>{workspaceId ? "sandbox://workspace" : "cloud-ide://preview"}</span><span>↻</span></div>
            <div className="preview-content"><div className="preview-logo">C</div><h2>Cloud IDE</h2><p>{preview}</p><button onClick={runCommand} disabled={busy}>{busy ? "Starting…" : "Start workspace"}</button></div>
          </div>
        </aside>
      </div>
      <section className="terminal-panel">
        <div className="terminal-tabs"><span className="selected">TERMINAL</span><span>OUTPUT</span><span>PROBLEMS</span></div>
        <pre>{terminal.join("\n")}</pre>
      </section>
    </main>
  );
}
