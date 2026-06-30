import { useEffect, useRef } from 'react';
import { lerp } from '@/lib/utils';

interface Props {
  side: 'left' | 'right' | 'center';
  setSide: (side: 'left' | 'right' | 'center') => void;
  isHeroVisible: boolean;
}

export default function SideLabels({ side, setSide, isHeroVisible }: Props) {
  const slideOffset = useRef(0);
  const targetSlide = useRef(0);
  const slideGroupRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const loop = () => {
      slideOffset.current = lerp(slideOffset.current, targetSlide.current, 0.045);
      if (slideGroupRef.current) {
        slideGroupRef.current.style.transform = `translateX(${slideOffset.current.toFixed(2)}px)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    if (side === 'left') targetSlide.current = 250;
    else if (side === 'right') targetSlide.current = -250;
    else targetSlide.current = 0;
  }, [side]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const leftOpacity = isHeroVisible ? 1 : 0;
  const rightOpacity = isHeroVisible ? 1 : 0;

  return (
    <nav aria-label="Section navigation" className="hero-sides">
      <a
        href="#projects"
        className="side side--left"
        id="sideLeft"
        aria-label="Projects"
        onClick={(e) => { e.preventDefault(); scrollTo('projects'); }}
        style={{
          opacity: leftOpacity,
          transform: isHeroVisible ? 'translateY(-50%)' : 'translateY(-50%) translateX(-80px)',
          transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <span className="side-text"><span className="side-arrow">←</span> PROJECTS</span>
        <span className="side-nr">01</span>
      </a>
      <a
        href="#artworks"
        className="side side--right"
        id="sideRight"
        aria-label="Artworks"
        onClick={(e) => { e.preventDefault(); scrollTo('artworks'); }}
        style={{
          opacity: rightOpacity,
          transform: isHeroVisible ? 'translateY(-50%)' : 'translateY(-50%) translateX(80px)',
          transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <span className="side-nr">02</span>
        <span className="side-text">ARTWORKS <span className="side-arrow">→</span></span>
      </a>
    </nav>
  );
}
