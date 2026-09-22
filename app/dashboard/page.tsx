import "./dashboard.css";

const projects = [
  { name: "starter-web", stack: "Next.js", updated: "Just now", status: "Ready" },
  { name: "api-service", stack: "Node.js", updated: "Yesterday", status: "Stopped" },
];

export default function Dashboard() {
  return (
    <main className="dash">
      <aside className="dash-side">
        <a className="brand" href="/"><span className="brand-mark">C</span><span>Cloud IDE</span></a>
        <div className="dash-nav">
          <a className="selected" href="/dashboard">⌂ <span>Overview</span></a>
          <a href="/ide">◫ <span>Projects / IDE</span></a>
          <a href="#">◈ <span>Templates</span></a>
          <a href="#">↗ <span>Deployments</span></a>
        </div>
        <div className="side-bottom"><a href="#">⚙ <span>Settings</span></a><a href="/">← <span>Back to site</span></a></div>
      </aside>

      <section className="dash-main">
        <header className="dash-header"><div><span className="section-kicker">WORKSPACE</span><h1>Good morning.</h1></div><a className="new-project" href="/ide">+ New project</a></header>
        <div className="dash-banner"><div><span className="banner-icon">C</span><div><strong>Cloud IDE foundation</strong><p>Web app, dashboard, IDE shell, health endpoint, and sandbox provider are connected.</p></div></div><span className="ready">● Foundation</span></div>

        <div className="dash-section-head"><h2>Recent projects</h2><a href="/ide">Open IDE →</a></div>
        <div className="project-list">{projects.map((project) => <article className="project" key={project.name}><div className="project-icon">⌁</div><div className="project-info"><strong>{project.name}</strong><span>{project.stack} · {project.updated}</span></div><span className={project.status === "Ready" ? "status ready" : "status"}>● {project.status}</span><a href="/ide">Open →</a></article>)}</div>

        <div className="empty-card"><div className="empty-icon">+</div><h3>Open the working IDE shell</h3><p>File explorer, editable code surface, preview panel, terminal panel, and the runtime provider boundary are ready for the next integration.</p><a className="new-project" href="/ide">Open workspace</a></div>
      </section>
    </main>
  );
}
