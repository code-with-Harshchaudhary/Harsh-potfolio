import { useRef, useEffect, useState } from 'react';

interface Props {
  isHeroVisible: boolean;
}

export default function Portrait(_: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sketchImgRef = useRef<HTMLImageElement | null>(null);
  const [sketchLoaded, setSketchLoaded] = useState(false);

  // Preload sketch image for canvas masking
  useEffect(() => {
    const img = new Image();
    img.src = '/images/sketch.png';
    img.onload = () => {
      sketchImgRef.current = img;
      setSketchLoaded(true);
    };
    img.onerror = () => {
      console.error('[Portrait] Failed to load sketch.png');
    };
  }, []);

  // Canvas loop: draws sketch masked by fluid canvas.
  // Uses destination-in compositing — the fluid canvas alpha IS the mask.
  // Where fluid is present → sketch shows. Where no fluid → transparent.
  // No pixel sampling needed; the compositing handles it naturally.
  useEffect(() => {
    if (!sketchLoaded || !sketchImgRef.current) return;

    const canvas = canvasRef.current;
    const frame = frameRef.current;
    if (!canvas || !frame) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const loop = () => {
      const frameRect = frame.getBoundingClientRect();
      if (frameRect.width === 0 || frameRect.height === 0) {
        raf = requestAnimationFrame(loop);
        return;
      }

      const cw = Math.round(frameRect.width);
      const ch = Math.round(frameRect.height);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }

      const fluidCanvas = document.getElementById('fluidCanvas') as HTMLCanvasElement;
      if (!fluidCanvas || fluidCanvas.width === 0) {
        ctx.clearRect(0, 0, cw, ch);
        raf = requestAnimationFrame(loop);
        return;
      }

      const img = sketchImgRef.current!;
      const imgAR = img.naturalWidth / img.naturalHeight;
      const canAR = cw / ch;
      let dw: number, dh: number, dx: number, dy: number;

      if (imgAR > canAR) {
        dw = cw; dh = cw / imgAR;
        dx = 0; dy = ch - dh;
      } else {
        dh = ch; dw = ch * imgAR;
        dx = (cw - dw) / 2; dy = 0;
      }

      ctx.clearRect(0, 0, cw, ch);

      // Draw sketch, then mask with fluid using destination-in.
      // The fluid canvas alpha naturally reveals the sketch where
      // fluid is present and keeps it transparent elsewhere.
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(
        fluidCanvas,
        frameRect.left, frameRect.top, frameRect.width, frameRect.height,
        0, 0, cw, ch
      );
      ctx.globalCompositeOperation = 'source-over';

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [sketchLoaded]);

  return (
    <div className="portrait-section" id="portraitSection">
      <div className="portrait-frame" id="portraitFrame" ref={frameRef}>
        <img
          className="portrait-base"
          id="portraitBase"
          src="/images/new_pot.png"
          alt="Portrait photo"
          draggable={false}
          fetchPriority="high"
        />
        <img
          className="portrait-illustration"
          id="portraitIllustration"
          src="/images/sketch.png"
          alt="Sketch illustration"
          draggable={false}
          style={{ visibility: 'hidden' }}
        />
        <canvas
          className="illustration-canvas"
          id="illustrationCanvas"
          ref={canvasRef}
        />
      </div>
    </div>
  );
}