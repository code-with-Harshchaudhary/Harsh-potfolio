import { useEffect, useRef } from 'react';
import { lerp } from '@/lib/utils';

export function useCustomCursor(isHeroVisible: boolean) {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rawX = useRef(0.5);
  const rawY = useRef(0.5);
  const smoothX = useRef(0.5);
  const smoothY = useRef(0.5);
  const rawRingX = useRef(-200);
  const rawRingY = useRef(-200);
  const mouseX = useRef(-200);
  const mouseY = useRef(-200);
  const rafRef = useRef(0);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      rawX.current = e.clientX / window.innerWidth;
      rawY.current = e.clientY / window.innerHeight;
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + 'px';
        dotRef.current.style.top = e.clientY + 'px';
      }
    };

    document.addEventListener('mousemove', onMouseMove);

    const loop = () => {
      smoothX.current = lerp(smoothX.current, rawX.current, 0.08);
      smoothY.current = lerp(smoothY.current, rawY.current, 0.08);

      rawRingX.current += (mouseX.current - rawRingX.current) * 0.12;
      rawRingY.current += (mouseY.current - rawRingY.current) * 0.12;

      if (ringRef.current) {
        ringRef.current.style.left = rawRingX.current.toFixed(2) + 'px';
        ringRef.current.style.top = rawRingY.current.toFixed(2) + 'px';
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { dotRef, ringRef };
}
