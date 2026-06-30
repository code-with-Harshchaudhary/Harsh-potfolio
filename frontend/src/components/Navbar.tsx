import { useEffect, useState } from 'react';
import { GlassButton } from '@/components/ui/glass-button';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [label, setLabel] = useState('YOUR NAME');

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const half = window.innerWidth / 2;
      setLabel(e.clientX < half ? 'Harsh chaudhary': 'PORTFOLIO');
    };
    document.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => document.removeEventListener('mousemove', onMouseMove);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className={`site-nav ${isScrolled ? 'is-scrolled' : ''}`} aria-label="Site navigation">
      <div className="nav-left">
        <span className="nav-left-text" id="navIndexLabel">{label}</span>
      </div>
      <div className="nav-links">
        <GlassButton
          size="sm"
          onClick={() => scrollTo('projects')}
        >
          Projects
        </GlassButton>
        <GlassButton
          size="sm"
          onClick={() => scrollTo('artworks')}
        >
          Artworks
        </GlassButton>
        <GlassButton
          size="sm"
          onClick={() => scrollTo('contact')}
        >
          Contact
        </GlassButton>
      </div>
    </nav>
  );
}
