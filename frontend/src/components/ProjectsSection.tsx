import { useEffect, useRef } from 'react';
import { StackedCards } from '@/components/ui/glass-cards';

const PROJECT_CARDS = [
  { id: 1, title: 'Project 1', description: 'A groundbreaking digital experience', color: 'rgba(0, 229, 255, 0.8)' },
  { id: 2, title: 'Project 2', description: 'Innovative design solutions', color: 'rgba(255, 45, 45, 0.8)' },
  { id: 3, title: 'Project 3', description: 'Creative brand identity system', color: 'rgba(255, 210, 0, 0.8)' },
  { id: 4, title: 'Project 4', description: 'Next-generation web application', color: 'rgba(0, 255, 136, 0.8)' },
  { id: 5, title: 'Project 5', description: 'Immersive user interface', color: 'rgba(180, 100, 255, 0.8)' },
  { id: 6, title: 'Project 6', description: 'Advanced prototyping system', color: 'rgba(255, 140, 0, 0.8)' },
];

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Force the section to be visible since .page-section starts at opacity: 0
    const section = sectionRef.current;
    if (section) {
      section.classList.add('is-visible');
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="page-section page-projects"
      style={{ minHeight: 'auto', padding: 0 }}
    >
      {/* Dark scrollable area for glass cards */}
      <div style={{ background: '#0a0a0a', padding: '100px 60px 80px' }}>
        <div className="section-content">
          <h2
            className="section-title"
            style={{ color: '#ffffff', marginBottom: '60px' }}
          >
            PROJECTS
          </h2>
          <StackedCards cards={PROJECT_CARDS} />
        </div>
      </div>
    </section>
  );
}