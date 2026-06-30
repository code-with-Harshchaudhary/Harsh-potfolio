import { useState, useEffect, useCallback } from 'react';
import { useHeroVisibility } from '@/hooks/useHeroVisibility';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import Navbar from '@/components/Navbar';
import TVPreloader from '@/components/TVPreloader';
import HeroSection from '@/components/HeroSection';
import ProjectsSection from '@/components/ProjectsSection';
import ArtworksSection from '@/components/ArtworksSection';
import ContactSection from '@/components/ContactSection';
import CustomCursor from '@/components/CustomCursor';
import PageTVOverlay from '@/components/PageTVOverlay';

function App() {
  const isHeroVisible = useHeroVisibility();
  const [side, setSide] = useState<'left' | 'right' | 'center'>('left');
  const [isRevealed, setIsRevealed] = useState(false);
  const [bootPending, setBootPending] = useState(true);

  useScrollReveal();

  const handleReveal = useCallback(() => {
    setBootPending(false);
    setIsRevealed(true);

    // Defer DOM manipulation to allow React to mount HeroSection first.
    // Without this, getElementById returns null because HeroSection hasn't rendered yet.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const pSection = document.getElementById('portraitSection');
      const nSection = document.getElementById('nameSection');
      const sLeft = document.getElementById('sideLeft');
      const sRight = document.getElementById('sideRight');

      if (nSection) {
        nSection.style.animation = 'none';
        nSection.style.opacity = '0';
      }
      if (sLeft) {
        sLeft.style.animation = 'none';
        sLeft.style.opacity = '0';
        sLeft.style.transform = 'translateY(-50%) translateX(-180%)';
      }
      if (sRight) {
        sRight.style.animation = 'none';
        sRight.style.opacity = '0';
        sRight.style.transform = 'translateY(-50%) translateX(180%)';
      }

      if (pSection) {
        pSection.style.animation = 'none';
        pSection.style.opacity = '0';
        pSection.style.transition = 'none';

        const blinks: [number, string][] = [
          [50, '1'], [105, '0'], [160, '1'], [215, '0'], [270, '1'], [325, '0'],
          [380, '1'], [435, '0'], [555, '1'], [675, '0'], [855, '1'], [1035, '0'],
          [1285, '1'], [1535, '0'], [2135, '1'], [2600, '0'], [3300, '1'],
        ];
        blinks.forEach(([t, op]) => {
          setTimeout(() => { pSection.style.opacity = op; }, t);
        });
        setTimeout(() => {
          pSection.style.transition = 'opacity 0.6s ease';
          pSection.style.opacity = '1';
        }, 3400);
      }

      setTimeout(() => {
        if (nSection) {
          nSection.style.transition = 'opacity 1.3s ease';
          nSection.style.opacity = '1';
        }
      }, 4000);

      setTimeout(() => {
        [sLeft, sRight].forEach(el => {
          if (!el) return;
          requestAnimationFrame(() => requestAnimationFrame(() => {
            el.style.transition = 'opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1)';
            el.style.opacity = '1';
            el.style.transform = 'translateY(-50%) translateX(0)';
          }));
        });
      }, 4900);

      setTimeout(() => {
        const bgCanvas = document.getElementById('bgCanvas');
        const fluidCanvas = document.getElementById('fluidCanvas');
        const illustCanvas = document.getElementById('illustrationCanvas');
        if (bgCanvas) { bgCanvas.style.transition = 'opacity 1.4s ease'; bgCanvas.style.opacity = '1'; }
        if (fluidCanvas) { fluidCanvas.style.transition = 'opacity 1.4s ease'; fluidCanvas.style.opacity = '1'; }
        if (illustCanvas) { illustCanvas.style.transition = 'opacity 1.4s ease'; illustCanvas.style.opacity = '1'; }
      }, 6000);
    }));
  }, []);

  useEffect(() => {
    document.body.classList.remove('cursor-left', 'cursor-right');
    if (side === 'left') document.body.classList.add('cursor-left');
    else if (side === 'right') document.body.classList.add('cursor-right');
  }, [side]);

  useEffect(() => {
    let prevTouchX = 0, prevTouchY = 0;
    const fluidSim = (window as unknown as Record<string, unknown>).FluidSim as { splat: (x: number, y: number, dx: number, dy: number) => void } | undefined;

    const onTouchStart = (e: TouchEvent) => {
      if (!fluidSim) return;
      const t = e.changedTouches[0];
      prevTouchX = t.clientX; prevTouchY = t.clientY;
      fluidSim.splat(t.clientX, t.clientY, 0.08, 0.08);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!fluidSim) return;
      const t = e.changedTouches[0];
      const dx = (t.clientX - prevTouchX) / window.innerWidth;
      const dy = (t.clientY - prevTouchY) / window.innerHeight;
      fluidSim.splat(t.clientX, t.clientY, dx, dy);
      prevTouchX = t.clientX; prevTouchY = t.clientY;
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return (
    <>
      <a href="#mainContent" className="skip-to-content">Skip to content</a>
      <TVPreloader onReveal={handleReveal} />
      <Navbar />

      <main id="mainContent">
        <h1 className="sr-only">Your Name — Designer & Portfolio</h1>
        {!bootPending && <HeroSection isHeroVisible={isHeroVisible} setSide={setSide} side={side} />}
        <ProjectsSection />
        <ArtworksSection />
        <ContactSection />
      </main>

      {isRevealed && <CustomCursor isHeroVisible={isHeroVisible} />}
      <PageTVOverlay />
    </>
  );
}

export default App;