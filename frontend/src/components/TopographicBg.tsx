import { useRef } from 'react';
import { useTopographicBg } from '@/hooks/useTopographicBg';

interface Props {
  isHeroVisible: boolean;
}

export default function TopographicBg({ isHeroVisible }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useTopographicBg(canvasRef, isHeroVisible);

  return (
    <canvas
      ref={canvasRef}
      className="bg-canvas"
      id="bgCanvas"
      style={{ opacity: isHeroVisible ? 1 : 0, transition: 'opacity 0.4s ease' }}
    />
  );
}
