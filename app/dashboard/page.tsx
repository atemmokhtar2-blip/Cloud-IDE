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
          <a href="#">◫ <span>Projects</span></a>
          <a href="#">◈ <span>Templates</span></a>
          <a href="#">↗ <span>Deployments</span></a>
        </div>
        <div className="side-bottom">
          <a href="#">⚙ <span>Settings</span></a>
          <a href="/">← <span>Back to site</span></a>
        </div>
      </aside>

      <section className="dash-main">
        <header className="dash-header">
          <div>
            <span className="section-kicker">WORKSPACE</span>
            <h1>Good morning.</h1>
          </div>
          <button className="new-project">+ New project</button>
        </header>

        <div className="dash-banner">
          <div><span className="banner-icon">C</span><div><strong>Cloud IDE foundation</strong><p>Your cloud workspace is ready for the next milestone.</p></div></div>
          <span className="ready">● Foundation</span>
        </div>

        <div className="dash-section-head"><h2>Recent projects</h2><a href="#">View all →</a></div>
        <div className="project-list">
          {projects.map((project) => (
            <article className="project" key={project.name}>
              <div className="project-icon">⌁</div>
              <div className="project-info"><strong>{project.name}</strong><span>{project.stack} · {project.updated}</span></div>
              <span className={project.status === "Ready" ? "status ready" : "status"}>● {project.status}</span>
              <button>Open →</button>
            </article>
          ))}
        </div>

        <div className="empty-card">
          <div className="empty-icon">+</div>
          <h3>Create your first real workspace</h3>
          <p>Project creation, file storage, editor, terminal, and runtime are coming together in the next milestones.</p>
          <button className="new-project">Create project</button>
        </div>
      </section>
    </main>
  );
}
