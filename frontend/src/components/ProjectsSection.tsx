const PROJECTS = [
  { name: 'Brand Identity', category: 'Visual Design', gradient: 'from-[#e8e0d4] via-[#d4c8b8] to-[#c4b8a8]' },
  { name: 'Web Design', category: 'UX/UI', gradient: 'from-[#d4c8b8] via-[#c4b8a8] to-[#b8a898]' },
  { name: 'Mobile App', category: 'Interface Design', gradient: 'from-[#c4b8a8] via-[#b8a898] to-[#a89888]' },
  { name: 'Illustration', category: 'Digital Art', gradient: 'from-[#b8a898] via-[#a89888] to-[#988878]' },
];

export default function ProjectsSection() {
  return (
    <section id="projects" className="page-section page-projects">
      <div className="section-content">
        <h2 className="section-title">PROJECTS</h2>
        <div className="projects-grid">
          {PROJECTS.map((project, i) => (
            <article className="project-card" key={i}>
              <div className="project-image-wrap">
                <div className={`project-image-placeholder bg-gradient-to-br ${project.gradient}`}>
                  <span className="project-placeholder-text">Project {i + 1}</span>
                </div>
              </div>
              <div className="project-info">
                <h3 className="project-name">{project.name}</h3>
                <p className="project-category">{project.category}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
