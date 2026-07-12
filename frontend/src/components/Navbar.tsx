import { useEffect, useState } from 'react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > window.innerHeight * 0.85);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`site-nav ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="nav-links" style={{ flex: 1, justifyContent: 'flex-start' }}>
        <a className="nav-link" onClick={() => scrollTo('projects')}>Projects</a>
        <a className="nav-link" onClick={() => scrollTo('artworks')}>Artworks</a>
      </div>

      <div className="nav-center">
        <span className="nav-center-text" onClick={() => scrollTo('hero')}>
          Harsh Chaudhary
        </span>
      </div>

      <div className="nav-links" style={{ flex: 1 }}>
        <a className="nav-link" onClick={() => scrollTo('contact')}>Contact</a>
        <a className="nav-link" onClick={() => scrollTo('about')}>About Me</a>
      </div>
    </nav>
  );
}