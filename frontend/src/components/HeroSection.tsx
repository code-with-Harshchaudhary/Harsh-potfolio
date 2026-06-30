import { useEffect, useRef } from 'react';
import { lerp } from '@/lib/utils';
import FluidCanvas from './FluidCanvas';
import TopographicBg from './TopographicBg';
import Portrait from './Portrait';
import SlotMachineName from './SlotMachineName';
import SideLabels from './SideLabels';
import { GlassButton } from '@/components/ui/glass-button';

interface Props {
  isHeroVisible: boolean;
  setSide: (side: 'left' | 'right' | 'center') => void;
  side: 'left' | 'right' | 'center';
}

export default function HeroSection({ isHeroVisible, setSide, side }: Props) {
  const smoothParaY = useRef(0);
  const smoothParaName = useRef(0);
  const rawY = useRef(0.5);
  const rafRef = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>();
  const isIdle = useRef(true);
  const idleT = useRef(0);
  const idleFluidTimer = useRef(0);
  const prevMouseX = useRef(0);
  const prevMouseY = useRef(0);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      rawY.current = e.clientY / window.innerHeight;
      const x = e.clientX / window.innerWidth;

      if (!isHeroVisible) {
        if (side !== 'center') setSide('center');
        isIdle.current = false;
        clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(() => { isIdle.current = true; }, 2200);
        return;
      }

      let newSide: 'left' | 'right' | 'center';
      if (x < 0.4) newSide = 'left';
      else if (x > 0.6) newSide = 'right';
      else newSide = 'center';
      if (newSide !== side) setSide(newSide);

      isIdle.current = false;
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => { isIdle.current = true; }, 2200);

      prevMouseX.current = e.clientX;
      prevMouseY.current = e.clientY;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', () => { isIdle.current = true; });

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      clearTimeout(idleTimer.current);
    };
  }, [isHeroVisible, side, setSide]);

  // Idle fluid splats
  useEffect(() => {
    if (!isHeroVisible) return;
    const fluidSim = (window as unknown as Record<string, unknown>).FluidSim as { splat: (x: number, y: number, dx: number, dy: number) => void } | undefined;

    const loop = () => {
      if (isIdle.current && fluidSim) {
        idleT.current += 0.016;
        idleFluidTimer.current += 0.016;
        if (idleFluidTimer.current >= 0.038) {
          idleFluidTimer.current = 0;
          const cx = window.innerWidth * 0.50;
          const cy = window.innerHeight * 0.44;
          const baseR = Math.min(window.innerWidth, window.innerHeight) * 0.15;
          [
            { spd: 0.52, r: baseR * 1.00, ph: 0.00 },
            { spd: 0.33, r: baseR * 1.55, ph: Math.PI * 0.667 },
            { spd: 0.74, r: baseR * 0.72, ph: Math.PI * 1.333 },
          ].forEach(s => {
            const ang = idleT.current * s.spd + s.ph;
            const sx = cx + Math.cos(ang) * s.r;
            const sy = cy + Math.sin(ang) * s.r;
            const vx = -Math.sin(ang) * s.spd * 0.0018;
            const vy = Math.cos(ang) * s.spd * 0.0018;
            fluidSim.splat(sx, sy, vx, vy);
          });
        }
      }

      // Parallax — apply directly to portrait/name elements by ID
      if (isHeroVisible) {
        const paraTarget = rawY.current - 0.5;
        smoothParaY.current = lerp(smoothParaY.current, paraTarget, 0.022);
        smoothParaName.current = lerp(smoothParaName.current, paraTarget, 0.09);
        const portraitEl = document.getElementById('portraitSection');
        if (portraitEl) {
          portraitEl.style.transform =
            `translateX(-50%) translateY(${(smoothParaY.current * -45).toFixed(1)}px)`;
        }
        const nameEl = document.getElementById('nameSection');
        if (nameEl) {
          nameEl.style.transform =
            `translateY(${(smoothParaName.current * -15).toFixed(1)}px)`;
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isHeroVisible]);

  return (
    <section className="hero-section" id="hero">
      <div className="bg-layer" aria-hidden="true">
        <TopographicBg isHeroVisible={isHeroVisible} />
        <FluidCanvas isHeroVisible={isHeroVisible} />
        <div className="bg-noise" />
      </div>

      <div className="slide-group" id="slideGroup">
        <Portrait isHeroVisible={isHeroVisible} />
        <SlotMachineName side={side} isHeroVisible={isHeroVisible} />
      </div>

      <SideLabels side={side} setSide={setSide} isHeroVisible={isHeroVisible} />
    </section>
  );
}

