import { useEffect, useCallback } from 'react';

export function useCRTShape() {
  const computeBarrelPaths = useCallback(() => {
    const vv = window.visualViewport;
    const W = vv ? Math.round(vv.width) : window.innerWidth;
    const H = vv ? Math.round(vv.height) : window.innerHeight;
    const isMobile = W <= 768;
    const M_CORNER = isMobile ? 12 : 38;
    const M_MID = isMobile ? 4 : 8;
    const R = isMobile
      ? Math.min(Math.max(18, W * 0.030), 28)
      : Math.min(Math.max(40, W * 0.042), 70);

    const inner = [
      `M ${M_CORNER + R},${M_CORNER}`,
      `Q ${W / 2},${M_MID} ${W - M_CORNER - R},${M_CORNER}`,
      `Q ${W - M_CORNER},${M_CORNER} ${W - M_CORNER},${M_CORNER + R}`,
      `Q ${W - M_MID},${H / 2} ${W - M_CORNER},${H - M_CORNER - R}`,
      `Q ${W - M_CORNER},${H - M_CORNER} ${W - M_CORNER - R},${H - M_CORNER}`,
      `Q ${W / 2},${H - M_MID} ${M_CORNER + R},${H - M_CORNER}`,
      `Q ${M_CORNER},${H - M_CORNER} ${M_CORNER},${H - M_CORNER - R}`,
      `Q ${M_MID},${H / 2} ${M_CORNER},${M_CORNER + R}`,
      `Q ${M_CORNER},${M_CORNER} ${M_CORNER + R},${M_CORNER}`,
      `Z`
    ].join(' ');

    const outer = `M 0,0 L ${W},0 L ${W},${H} L 0,${H} Z`;
    return { inner, outer, W, H };
  }, []);

  const setPageCRTShape = useCallback(() => {
    const paths = computeBarrelPaths();
    const { W, H } = paths;

    const frame = document.querySelector('.page-tv-frame') as HTMLElement;
    if (frame) {
      frame.style.clipPath = `path(evenodd, '${paths.outer} ${paths.inner}')`;
      frame.style.visibility = 'visible';
    }

    const bevel = document.querySelector('.page-crt-bevel') as HTMLElement;
    if (bevel) {
      bevel.style.clipPath = `path('${paths.inner}')`;
    }

    const sv = document.querySelector('.page-tv-stroke') as SVGSVGElement;
    if (sv) {
      sv.setAttribute('viewBox', `0 0 ${W} ${H}`);
      sv.style.clipPath = `path('${paths.inner}')`;
      const p = sv.querySelector('path');
      if (p) p.setAttribute('d', paths.inner);
    }
  }, [computeBarrelPaths]);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(setPageCRTShape));

    let resizeTimer: number;
    const onViewportChange = () => {
      cancelAnimationFrame(resizeTimer);
      resizeTimer = requestAnimationFrame(setPageCRTShape);
    };

    window.addEventListener('resize', onViewportChange);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onViewportChange);
      window.visualViewport.addEventListener('scroll', onViewportChange);
    }

    return () => {
      window.removeEventListener('resize', onViewportChange);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', onViewportChange);
        window.visualViewport.removeEventListener('scroll', onViewportChange);
      }
    };
  }, [setPageCRTShape]);
}
