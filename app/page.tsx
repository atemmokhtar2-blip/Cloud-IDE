const features = [
  { icon: "⌘", title: "Browser-native development", text: "Edit projects, manage files, run commands, and preview your app without leaving the browser." },
  { icon: "◈", title: "Isolated workspaces", text: "Each project gets its own workspace boundary so execution can scale independently from the web app." },
  { icon: "↗", title: "Deploy when ready", text: "Move from an idea to a shareable deployment with a workflow designed around Git and cloud hosting." },
];

const steps = [
  ["01", "Create a project", "Start from scratch or a template."],
  ["02", "Build in your workspace", "Edit files and use the terminal from one interface."],
  ["03", "Preview instantly", "Run your app and open its live preview."],
  ["04", "Deploy", "Connect GitHub and ship when you are ready."],
];

export default function Home() {
  return (
    <main>
      <nav className="nav">
        <a className="brand" href="/"><span className="brand-mark">C</span><span>Cloud IDE</span></a>
        <div className="nav-links"><a href="#features">Features</a><a href="#workflow">How it works</a><a href="#roadmap">Roadmap</a></div>
        <a className="nav-cta" href="/ide">Open IDE <span>→</span></a>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse" /> Your development environment, in the cloud</div>
          <h1>Build software<br /><span>without the setup.</span></h1>
          <p>Cloud IDE brings your editor, terminal, preview, workspace, and deployment workflow into one fast browser experience.</p>
          <div className="hero-actions"><a className="primary-btn" href="/ide">Start building <span>→</span></a><a className="secondary-btn" href="#features">Explore the platform</a></div>
          <div className="hero-note"><span>●</span> Designed for modern cloud development</div>
        </div>

        <div className="ide-preview">
          <div className="window-bar"><div className="window-dots"><i /><i /><i /></div><div className="window-title">cloud-ide / starter</div><div className="window-status">● Ready</div></div>
          <div className="ide-body">
            <aside className="ide-sidebar">
              <div className="side-label">EXPLORER</div><div className="tree active">⌄ <span>src</span></div><div className="tree indent">◦ app.tsx</div><div className="tree indent">◦ page.tsx</div><div className="tree indent">◦ styles.css</div><div className="tree">◇ package.json</div><div className="tree">◇ README.md</div>
            </aside>
            <section className="editor">
              <div className="tabs"><span className="tab active">page.tsx</span><span className="tab">styles.css</span></div>
              <pre>{`01  import { Hero } from "./components";
02
03  export default function Home() {
04    return (
05      <main>
06        <Hero
07          title="Build in the cloud."
08          action="Start building"
09        />
10      </main>
11    );
12  }`}</pre>
            </section>
            <aside className="terminal"><div className="terminal-head"><span>TERMINAL</span><span>×</span></div><pre>{`$ npm run dev

  Ready in 1.8s

  Local:   http://localhost:3000

  ✓ Compiled / in 320ms
  ✓ Preview server started

$`}</pre></aside>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="section-heading"><span className="section-kicker">THE PLATFORM</span><h2>Everything you need to build.</h2><p>One workspace from first file to production.</p></div>
        <div className="feature-grid">{features.map((feature) => <article className="feature-card" key={feature.title}><div className="feature-icon">{feature.icon}</div><h3>{feature.title}</h3><p>{feature.text}</p><span className="card-arrow">↗</span></article>)}</div>
      </section>

      <section className="section workflow" id="workflow">
        <div className="section-heading"><span className="section-kicker">SIMPLE FLOW</span><h2>From idea to running software.</h2></div>
        <div className="steps">{steps.map(([number, title, text]) => <div className="step" key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{text}</p></div>)}</div>
      </section>

      <section className="architecture">
        <div><span className="section-kicker">CLOUD ARCHITECTURE</span><h2>Built to scale beyond the MVP.</h2><p>The IDE stays independent from the runtime. Start with hosted sandboxes, then move execution to dedicated containers or Kubernetes as usage grows.</p></div>
        <div className="flow"><div>Cloud IDE</div><b>→</b><div>Workspace Manager</div><b>→</b><div>Sandbox Provider</div></div>
      </section>

      <section className="section roadmap" id="roadmap">
        <div className="section-heading"><span className="section-kicker">ROADMAP</span><h2>The foundation comes first.</h2></div>
        <div className="roadmap-list">{[
          ["01", "Foundation", "Brand, landing page, dashboard, project structure", true],
          ["02", "IDE", "File explorer, editor, file API, project creation", true],
          ["03", "Runtime", "Sandbox workspaces, terminal, process lifecycle", false],
          ["04", "Preview", "Ports, logs, live preview, process management", false],
          ["05", "Ship", "GitHub, deployments, templates", false],
        ].map(([n, title, text, done]) => <div className="roadmap-row" key={n}><span>{n}</span><strong>{title}</strong><p>{text}</p><em>{done ? "IN PROGRESS" : "PLANNED"}</em></div>)}</div>
      </section>

      <section className="cta"><div><span className="section-kicker">CLOUD IDE</span><h2>Open a workspace.<br />Start building.</h2></div><a className="primary-btn" href="/ide">Open Cloud IDE <span>→</span></a></section>
      <footer><div className="brand"><span className="brand-mark">C</span><span>Cloud IDE</span></div><span>Build anywhere. Ship everywhere.</span><span>© 2026 Cloud IDE</span></footer>
    </main>
  );
}
