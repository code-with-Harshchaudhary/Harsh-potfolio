import { useRef, useEffect, useState } from 'react';

interface Props {
  isHeroVisible: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TUNE THESE 3 VALUES until sketch aligns with photo
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SKETCH_SCALE = .85;    // Bigger = sketch person larger (try 1.1 — 1.4)
const SKETCH_OFFSET_X = 6;    // Positive = move sketch right (try -30 to +30)
const SKETCH_OFFSET_Y = 130;   // Positive = move sketch down (try -20 to +60)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function Portrait(_: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sketchImgRef = useRef<HTMLImageElement | null>(null);
  const baseImgRef = useRef<HTMLImageElement | null>(null);
  const [sketchLoaded, setSketchLoaded] = useState(false);
  const [baseLoaded, setBaseLoaded] = useState(false);

  useEffect(() => {
    const base = new Image();
    base.src = '/images/new_pot.png';
    base.onload = () => {
      baseImgRef.current = base;
      setBaseLoaded(true);
    };

    const sketch = new Image();
    sketch.src = '/images/sketch.png';
    sketch.onload = () => {
      sketchImgRef.current = sketch;
      setSketchLoaded(true);
    };
  }, []);

  useEffect(() => {
    if (!sketchLoaded || !baseLoaded || !sketchImgRef.current || !baseImgRef.current) return;

    const canvas = canvasRef.current;
    const frame = frameRef.current;
    if (!canvas || !frame) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const photoAR = baseImgRef.current.naturalWidth / baseImgRef.current.naturalHeight;

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

      // Step 1: Calculate where the PHOTO sits (contain + bottom center)
      let photoW: number, photoH: number, photoX: number, photoY: number;
      const canAR = cw / ch;

      if (photoAR > canAR) {
        photoW = cw;
        photoH = cw / photoAR;
        photoX = 0;
        photoY = ch - photoH;
      } else {
        photoH = ch;
        photoW = ch * photoAR;
        photoX = (cw - photoW) / 2;
        photoY = 0;
      }

      // Step 2: Draw sketch INSIDE the photo's bounding box,
      // but scaled up and offset to align the subject
      const sketchDrawW = photoW * SKETCH_SCALE;
      const sketchDrawH = photoH * SKETCH_SCALE;
      const sketchDrawX = photoX + (photoW - sketchDrawW) / 2 + SKETCH_OFFSET_X;
      const sketchDrawY = photoY + (photoH - sketchDrawH) / 2 + SKETCH_OFFSET_Y;

      ctx.clearRect(0, 0, cw, ch);

      // Draw sketch at adjusted position/scale
      ctx.drawImage(
        sketchImgRef.current!,
        sketchDrawX, sketchDrawY, sketchDrawW, sketchDrawH
      );

      // Mask with fluid
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
  }, [sketchLoaded, baseLoaded]);

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
        <canvas
          className="illustration-canvas"
          id="illustrationCanvas"
          ref={canvasRef}
        />
      </div>
    </div>
  );
}