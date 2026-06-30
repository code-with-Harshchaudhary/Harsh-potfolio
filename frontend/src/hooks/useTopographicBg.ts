import { useEffect, useRef, useCallback } from 'react';

interface Peak {
  x: number;
  y: number;
  sx: number;
  sy: number;
  amp: number;
}

const PEAKS: Peak[] = [
  [0.20, 0.40, 0.22, 0.28, 1.00],
  [0.72, 0.28, 0.26, 0.30, 1.00],
  [0.48, 0.72, 0.24, 0.20, 0.90],
  [0.05, 0.60, 0.18, 0.24, 0.80],
  [0.92, 0.55, 0.20, 0.26, 0.80],
  [0.38, 0.05, 0.22, 0.18, 0.70],
  [0.75, 0.90, 0.20, 0.22, 0.70],
  [0.15, 0.92, 0.18, 0.20, 0.60],
  [0.46, 0.34, 0.14, 0.18, 0.50],
].map(([x, y, sx, sy, amp]) => ({ x, y, sx, sy, amp }));

export function useTopographicBg(canvasRef: React.RefObject<HTMLCanvasElement | null>, isVisible: boolean) {
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const hGridRef = useRef<Float32Array | null>(null);
  const bgTimeRef = useRef(0);
  const rafRef = useRef(0);
  const mobileDrawnRef = useRef(false);
  const isMobileRef = useRef(window.innerWidth < 768);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, [canvasRef]);

  const drawBackground = useCallback((dt: number) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const isMobile = window.innerWidth < 768;
    isMobileRef.current = isMobile;

    if (isMobile) {
      if (mobileDrawnRef.current) return;
      mobileDrawnRef.current = true;
    }

    bgTimeRef.current += dt;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#F5F0E8';
    ctx.fillRect(0, 0, W, H);

    const GW = isMobile ? 60 : 140;
    const GH = isMobile ? 40 : 100;
    const GW1 = GW + 1;
    const TOTAL = GW1 * (GH + 1);
    if (!hGridRef.current || hGridRef.current.length !== TOTAL) {
      hGridRef.current = new Float32Array(TOTAL);
    }

    const cellW = W / GW;
    const cellH = H / GH;
    const bs = bgTimeRef.current * 0.5;

    for (let row = 0; row <= GH; row++) {
      const ny = row / GH;
      const base = row * GW1;
      for (let col = 0; col <= GW; col++) {
        const nx = col / GW;
        let h = 0;
        for (let p = 0; p < PEAKS.length; p++) {
          const pk = PEAKS[p];
          const driftX = 0.014 * Math.sin(bs * 0.08 + p * 2.1);
          const driftY = 0.010 * Math.cos(bs * 0.10 + p * 1.7);
          const amp = pk.amp * (1.0 + 0.18 * Math.sin(bs * 0.28 + p * 0.9));
          const dx = (nx - pk.x - driftX) / pk.sx;
          const dy = (ny - pk.y - driftY) / pk.sy;
          h += amp * Math.exp(-0.5 * (dx * dx + dy * dy));
        }
        hGridRef.current[base + col] = h;
      }
    }

    const lv_min = 0.22, lv_max = 2.58, nL = 14;
    const spacing = (lv_max - lv_min) / (nL - 1);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let li = 0; li < nL; li++) {
      const lv = lv_min + li * spacing;
      const isIdx = (li % 4 === 0);
      const bA = isIdx ? 0.35 : 0.14;
      ctx.beginPath();
      ctx.lineWidth = isIdx ? 1.4 : 0.65;
      ctx.strokeStyle = isIdx
        ? `rgba(160,130,90,${bA.toFixed(3)})`
        : `rgba(180,150,100,${bA.toFixed(3)})`;

      for (let row = 0; row < GH; row++) {
        const r0 = row * GW1, r1 = (row + 1) * GW1;
        const y0 = row * cellH, y1 = y0 + cellH;
        for (let col = 0; col < GW; col++) {
          const h00 = hGridRef.current[r0 + col], h10 = hGridRef.current[r0 + col + 1];
          const h11 = hGridRef.current[r1 + col + 1], h01 = hGridRef.current[r1 + col];
          const b0 = h00 > lv ? 1 : 0, b1 = h10 > lv ? 1 : 0;
          const b2 = h11 > lv ? 1 : 0, b3 = h01 > lv ? 1 : 0;
          const mc = b0 | (b1 << 1) | (b2 << 2) | (b3 << 3);
          if (mc === 0 || mc === 15) continue;

          const x0 = col * cellW, x1 = x0 + cellW;
          let moveX = 0, moveY = 0, lineX = 0, lineY = 0;

          switch (mc) {
            case 1: case 14:
              moveX = x0 + ((lv - h00) / (h10 - h00)) * cellW; moveY = y0;
              lineX = x0; lineY = y0 + ((lv - h00) / (h01 - h00)) * cellH;
              break;
            case 2: case 13:
              moveX = x0 + ((lv - h00) / (h10 - h00)) * cellW; moveY = y0;
              lineX = x1; lineY = y0 + ((lv - h10) / (h11 - h10)) * cellH;
              break;
            case 3: case 12:
              moveX = x0; moveY = y0 + ((lv - h00) / (h01 - h00)) * cellH;
              lineX = x1; lineY = y0 + ((lv - h10) / (h11 - h10)) * cellH;
              break;
            case 4: case 11:
              moveX = x1; moveY = y0 + ((lv - h10) / (h11 - h10)) * cellH;
              lineX = x0 + ((lv - h01) / (h11 - h01)) * cellW; lineY = y1;
              break;
            case 5:
              moveX = x0 + ((lv - h00) / (h10 - h00)) * cellW; moveY = y0;
              lineX = x0; lineY = y0 + ((lv - h00) / (h01 - h00)) * cellH;
              ctx.moveTo(moveX, moveY); ctx.lineTo(lineX, lineY);
              moveX = x1; moveY = y0 + ((lv - h10) / (h11 - h10)) * cellH;
              lineX = x0 + ((lv - h01) / (h11 - h01)) * cellW; lineY = y1;
              break;
            case 6: case 9:
              moveX = x0 + ((lv - h00) / (h10 - h00)) * cellW; moveY = y0;
              lineX = x0 + ((lv - h01) / (h11 - h01)) * cellW; lineY = y1;
              break;
            case 7: case 8:
              moveX = x0; moveY = y0 + ((lv - h00) / (h01 - h00)) * cellH;
              lineX = x0 + ((lv - h01) / (h11 - h01)) * cellW; lineY = y1;
              break;
            case 10:
              moveX = x0 + ((lv - h00) / (h10 - h00)) * cellW; moveY = y0;
              lineX = x1; lineY = y0 + ((lv - h10) / (h11 - h10)) * cellH;
              ctx.moveTo(moveX, moveY); ctx.lineTo(lineX, lineY);
              moveX = x0; moveY = y0 + ((lv - h00) / (h01 - h00)) * cellH;
              lineX = x0 + ((lv - h01) / (h11 - h01)) * cellW; lineY = y1;
              break;
          }
          ctx.moveTo(moveX, moveY); ctx.lineTo(lineX, lineY);
        }
      }
      ctx.stroke();
    }
  }, [canvasRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = canvas.getContext('2d');
    resizeCanvas();

    let lastTs = 0;
    const loop = (ts: number) => {
      if (!isVisible) { rafRef.current = requestAnimationFrame(loop); return; }
      const dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;
      drawBackground(dt);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const onResize = () => { resizeCanvas(); mobileDrawnRef.current = false; };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, [canvasRef, isVisible, resizeCanvas, drawBackground]);
}
