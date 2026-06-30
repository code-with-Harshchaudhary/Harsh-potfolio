import { useEffect, useRef } from 'react';

export function usePageGrain(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = 800, H = 600;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    const img = ctx.createImageData(W, H);
    const data = img.data;
    let tick = 0;

    function draw() {
      tick++;
      if (tick % 2 === 0) {
        for (let i = 0; i < data.length; i += 4) {
          const v = (Math.random() * 255) | 0;
          data[i] = data[i + 1] = data[i + 2] = v;
          data[i + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
      }
      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(rafRef.current);
  }, [canvasRef]);
}
