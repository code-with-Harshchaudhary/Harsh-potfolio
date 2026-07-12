import { useEffect, useRef } from 'react';
import { StackedCards } from '@/components/ui/glass-cards';

const ARTWORK_CARDS = [
  { id: 1, title: 'Artwork 1', description: 'Abstract digital composition', color: 'rgba(255, 100, 150, 0.8)' },
  { id: 2, title: 'Artwork 2', description: 'Mixed media exploration', color: 'rgba(100, 200, 255, 0.8)' },
  { id: 3, title: 'Artwork 3', description: 'Generative art piece', color: 'rgba(150, 255, 100, 0.8)' },
  { id: 4, title: 'Artwork 4', description: 'Visual storytelling series', color: 'rgba(255, 200, 50, 0.8)' },
  { id: 5, title: 'Artwork 5', description: 'Contemporary illustration', color: 'rgba(200, 100, 255, 0.8)' },
  { id: 6, title: 'Artwork 6', description: 'Digital sculpture study', color: 'rgba(0, 255, 200, 0.8)' },
];

export default function ArtworksSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (section) {
      section.classList.add('is-visible');
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      id="artworks"
      className="page-section page-artworks"
      style={{ minHeight: 'auto', padding: 0 }}
    >
      <div style={{ background: '#0a0a0a', padding: '100px 60px 80px' }}>
        <div className="section-content">
          <h2
            className="section-title"
            style={{ color: '#ffffff', marginBottom: '60px' }}
          >
            ARTWORKS
          </h2>
          <StackedCards cards={ARTWORK_CARDS} />
        </div>
      </div>
    </section>
  );
}