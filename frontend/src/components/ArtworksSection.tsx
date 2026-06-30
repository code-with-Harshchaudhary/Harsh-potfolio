const ARTWORKS = [
  { id: 1, large: true, gradient: 'from-[#e8e0d4] to-[#d4c8b8]' },
  { id: 2, large: false, gradient: 'from-[#d4c8b8] to-[#c4b8a8]' },
  { id: 3, large: false, gradient: 'from-[#c4b8a8] to-[#b8a898]' },
  { id: 4, large: false, gradient: 'from-[#b8a898] to-[#a89888]' },
  { id: 5, large: true, gradient: 'from-[#e8e0d4] to-[#c4b8a8]' },
  { id: 6, large: false, gradient: 'from-[#d4c8b8] to-[#a89888]' },
];

export default function ArtworksSection() {
  return (
    <section id="artworks" className="page-section page-artworks" style={{ background: 'linear-gradient(180deg, var(--bg) 0%, #EDE8E0 100%)' }}>
      <div className="section-content">
        <h2 className="section-title">ARTWORKS</h2>
        <div className="artworks-grid">
          {ARTWORKS.map((art) => (
            <div key={art.id} className={`artwork-item ${art.large ? 'large' : ''}`}>
              <div className={`artwork-placeholder bg-gradient-to-br ${art.gradient}`}>
                <span>Artwork {art.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
