import { useRef } from 'react';
import { usePageGrain } from '@/hooks/usePageGrain';
import { useCRTShape } from '@/hooks/useCRTShape';

export default function PageTVOverlay() {
  const grainCanvasRef = useRef<HTMLCanvasElement>(null);
  usePageGrain(grainCanvasRef);
  useCRTShape();

  return (
    <>
      <div className="page-tv-overlay" aria-hidden="true">
        <div className="page-scanlines" />
        <canvas className="page-grain-canvas" ref={grainCanvasRef} width={800} height={600} />
        <div className="page-scanner-lines">
          <span style={{ '--dur': '10s', '--op': '0.10', '--del': '0.000s' } as React.CSSProperties} />
          <span style={{ '--dur': '13s', '--op': '0.07', '--del': '0.070s' } as React.CSSProperties} />
          <span style={{ '--dur': '17s', '--op': '0.04', '--del': '0.140s' } as React.CSSProperties} />
        </div>
        <div className="page-inner-glow" />
        <div className="page-vignette" />
      </div>

      <div className="page-crt-bevel" aria-hidden="true" />
      <div className="page-tv-frame" aria-hidden="true" />
      <svg xmlns="http://www.w3.org/2000/svg" className="page-tv-stroke" aria-hidden="true" viewBox="0 0 1536 776">
        <path d="" fill="none" stroke="rgba(30,28,26,0.10)" strokeWidth={6} />
      </svg>
    </>
  );
}
