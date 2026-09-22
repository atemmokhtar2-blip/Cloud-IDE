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

export default function IDEPage() {
  const [activeFile, setActiveFile] = useState("page.tsx");
  const [content, setContent] = useState(initialContent["page.tsx"]);
  const [terminal, setTerminal] = useState(["$ cloud-ide workspace", "Workspace ready.", "$ "]);
  const [preview, setPreview] = useState("Your preview will appear here.");
  const lineCount = useMemo(() => content.split("\n").length, [content]);

  function openFile(path: string) {
    setActiveFile(path);
    setContent(initialContent[path] ?? "");
  }

  function runCommand() {
    setTerminal((current) => [...current.slice(-8), "$ npm run dev", "Starting development server...", "✓ Preview server ready", "$ "]);
    setPreview("Preview server ready — runtime connection will be wired to Vercel Sandbox next.");
  }

  return (
    <main className="ide-shell">
      <header className="ide-topbar">
        <a className="ide-brand" href="/"><span className="brand-mark">C</span><span>Cloud IDE</span></a>
        <div className="workspace-name"><span className="live-dot" /> starter-project</div>
        <div className="ide-actions"><button onClick={runCommand}>Run</button><button className="deploy">Deploy</button><a href="/dashboard">Dashboard</a></div>
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
          <div className="panel-head"><span>PREVIEW</span><span className="panel-state">● READY</span></div>
          <div className="preview-frame">
            <div className="preview-browser"><span>○</span><span>localhost:3000</span><span>↻</span></div>
            <div className="preview-content"><div className="preview-logo">C</div><h2>Cloud IDE</h2><p>{preview}</p><button onClick={runCommand}>Start workspace</button></div>
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
