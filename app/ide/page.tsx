"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { OnMount } from "@monaco-editor/react";
import "./ide.css";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type FileItem = { name: string; kind: "folder" | "file"; path?: string };

const files: FileItem[] = [
  { name: "app", kind: "folder" },
  { name: "page.tsx", kind: "file", path: "app/page.tsx" },
  { name: "layout.tsx", kind: "file", path: "app/layout.tsx" },
  { name: "globals.css", kind: "file", path: "app/globals.css" },
  { name: "package.json", kind: "file", path: "package.json" },
  { name: "tsconfig.json", kind: "file", path: "tsconfig.json" },
  { name: "README.md", kind: "file", path: "README.md" },
];

const initialContent: Record<string, string> = {
  "app/page.tsx": `export default function Home() {
  return (
    <main>
      <h1>Welcome to Cloud IDE</h1>
      <p>Start building in the cloud.</p>
    </main>
  );
}
`,
  "app/layout.tsx": `export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`,
  "app/globals.css": `body {
  margin: 0;
  font-family: system-ui, sans-serif;
}
`,
  "package.json": `{
  "name": "starter-project",
  "private": true,
  "scripts": {
    "dev": "next dev"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
`,
  "tsconfig.json": `{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "noEmit": true,
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "skipLibCheck": true
  },
  "include": ["**/*.ts", "**/*.tsx"]
}
`,
  "README.md": "# Starter project\n\nCreated in Cloud IDE.\n",
};

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

export default function IDEPage() {
  const [activeFile, setActiveFile] = useState("app/page.tsx");
  const [content, setContent] = useState(initialContent["app/page.tsx"]);
  const [terminal, setTerminal] = useState(["$ cloud-ide workspace", "Workspace not started.", "$ "]);
  const [preview, setPreview] = useState("Start a workspace to run your project.");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "unsaved">("saved");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lineCount = useMemo(() => content.split("\n").length, [content]);

  const loadFile = useCallback(async (id: string, path: string) => {
    try {
      const data = await api<{ content: string }>(
        "/api/workspaces/" + encodeURIComponent(id) + "/files?path=" + encodeURIComponent(path),
      );
      setContent(data.content);
      setSaveState("saved");
    } catch {
      setContent(initialContent[path] ?? "");
      setSaveState("saved");
    }
  }, []);

  async function openFile(path: string) {
    setActiveFile(path);
    if (workspaceId) {
      await loadFile(workspaceId, path);
    } else {
      setContent(initialContent[path] ?? "");
      setSaveState("saved");
    }
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

  async function saveFile(id: string, path: string, value: string) {
    setSaveState("saving");
    await api("/api/workspaces/" + encodeURIComponent(id) + "/files", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, content: value }),
    });
    setSaveState("saved");
  }

  function scheduleSave(path: string, value: string) {
    setSaveState("unsaved");
    if (!workspaceId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void saveFile(workspaceId, path, value).catch(() => setSaveState("unsaved"));
    }, 800);
  }

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  const handleEditorMount: OnMount = (editor) => {
    editor.addAction({
      id: "cloud-ide-save",
      label: "Save File",
      keybindings: [2048 | 49],
      run: () => {
        if (!workspaceId) return;
        if (saveTimer.current) clearTimeout(saveTimer.current);
        void saveFile(workspaceId, activeFile, editor.getValue()).catch(() => setSaveState("unsaved"));
      },
    });
  };

  async function runCommand() {
    setBusy(true);
    setTerminal((current) => [...current.slice(-8), "$ cloud-ide run", "Creating isolated workspace..."]);
    try {
      const id = await ensureWorkspace();
      await saveFile(id, activeFile, content);
      const data = await api<{ result: { exitCode: number; stdout: string; stderr: string } }>(
        "/api/workspaces/" + encodeURIComponent(id) + "/command",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            command:
              "if [ ! -d node_modules ]; then npm install --no-audit --no-fund; fi && (nohup npm run dev -- --hostname 0.0.0.0 > /tmp/cloud-ide.log 2>&1 & echo $!)",
          }),
        },
      );
      const output = [data.result.stdout, data.result.stderr].filter(Boolean).join("\n").trim();
      const previewData = await api<{ url: string }>(
        "/api/workspaces/" + encodeURIComponent(id) + "/preview?port=3000",
      );
      setTerminal((current) => [
        ...current.slice(-8),
        output || "Development server started.",
        "Preview: " + previewData.url,
        "$ ",
      ]);
      setPreview("Live preview is running inside the isolated workspace.");
      setPreviewUrl(previewData.url);
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
        <div className="ide-actions">
          <span className={"save-state " + saveState}>{saveState === "saved" ? "Saved" : saveState === "saving" ? "Saving…" : "Unsaved"}</span>
          <button onClick={runCommand} disabled={busy}>{busy ? "Running…" : "Run"}</button>
          <button className="deploy">Deploy</button>
          <a href="/dashboard">Dashboard</a>
        </div>
      </header>

      <div className="ide-layout">
        <aside className="explorer">
          <div className="explorer-head"><span>EXPLORER</span><button>＋</button></div>
          <div className="root-name">⌄ STARTER-PROJECT</div>
          {files.map((file) => (
            <button
              key={file.path ?? file.name}
              className={file.path === activeFile ? "file active" : "file"}
              onClick={() => file.path && void openFile(file.path)}
            >
              <span>{file.kind === "folder" ? "⌄" : "◦"}</span>{file.name}
            </button>
          ))}
        </aside>

        <section className="editor-panel">
          <div className="editor-tabs"><div className="editor-tab active"><span>◦</span>{activeFile}<b>×</b></div></div>
          <div className="monaco-area">
            <MonacoEditor
              height="100%"
              language={activeFile.endsWith(".css") ? "css" : activeFile.endsWith(".json") ? "json" : activeFile.endsWith(".md") ? "markdown" : "typescript"}
              theme="vs-dark"
              value={content}
              onChange={(value) => {
                const next = value ?? "";
                setContent(next);
                scheduleSave(activeFile, next);
              }}
              onMount={handleEditorMount}
              options={{
                minimap: { enabled: false },
                fontSize: 12,
                lineHeight: 21,
                padding: { top: 18, bottom: 30 },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                tabSize: 2,
              }}
            />
          </div>
        </section>

        <aside className="preview-panel">
          <div className="panel-head"><span>PREVIEW</span><span className={workspaceId ? "panel-state" : "panel-state offline"}>{workspaceId ? "● CONNECTED" : "○ OFFLINE"}</span></div>
          <div className="preview-frame">
            <div className="preview-browser"><span>○</span><span>{workspaceId ? "sandbox://workspace" : "cloud-ide://preview"}</span><span>↻</span></div>
            {previewUrl ? (
              <iframe className="preview-iframe" src={previewUrl} title="Cloud IDE live preview" />
            ) : (
              <div className="preview-content"><div className="preview-logo">C</div><h2>Cloud IDE</h2><p>{preview}</p><button onClick={runCommand} disabled={busy}>{busy ? "Starting…" : "Start workspace"}</button></div>
            )}
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
