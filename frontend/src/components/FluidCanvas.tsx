import { useRef, useEffect } from 'react';
import { useFluidSim } from '@/hooks/useFluidSim';

interface Props {
  isHeroVisible: boolean;
}

export default function FluidCanvas({ isHeroVisible }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { splat } = useFluidSim(canvasRef);

  useEffect(() => {
    if (!isHeroVisible) return;

    const onMouseMove = (e: MouseEvent) => {
      const dx = (e.movementX || 0) / window.innerWidth;
      const dy = (e.movementY || 0) / window.innerHeight;
      splat(e.clientX, e.clientY, dx, dy);
    };

    document.addEventListener('mousemove', onMouseMove);
    return () => document.removeEventListener('mousemove', onMouseMove);
  }, [splat, isHeroVisible]);

  return (
    <canvas
      ref={canvasRef}
      className="fluid-canvas"
      id="fluidCanvas"
      style={{ opacity: isHeroVisible ? 1 : 0, transition: 'opacity 0.4s ease' }}
    />
  );
}
