import { useEffect, useRef, useCallback, useState } from 'react';

interface BiosLine {
  delay: number;
  type: string;
  text: string;
  ok?: string;
}

const BIOS_LINES: BiosLine[] = [
  { delay: 0, type: 'empty', text: '' },
  { delay: 80, type: 'status', text: 'DEEP SIGNAL SCAN .......................', ok: '[LOCKED]' },
  { delay: 240, type: 'status', text: 'CREATIVE NETWORK LINK ..................', ok: '[ESTABLISHED]' },
  { delay: 400, type: 'status', text: 'DESIGN MATRIX ..........................', ok: '[ONLINE]' },
  { delay: 560, type: 'status', text: 'VISUAL CORTEX ..........................', ok: '[SYNCHRONIZED]' },
  { delay: 720, type: 'status', text: 'ART CANVAS .............................', ok: '[LOADED]' },
  { delay: 880, type: 'status', text: 'STYLE MATRIX ...........................', ok: '[STABLE]' },
  { delay: 1040, type: 'status', text: 'PROJECT ENGINE .........................', ok: '[ACTIVE]' },
  { delay: 1200, type: 'status', text: 'ARTWORK GRID ...........................', ok: '[MOUNTED]' },
  { delay: 1360, type: 'empty', text: '' },
  { delay: 1440, type: 'section', text: 'SYSTEM DIAGNOSTICS' },
  { delay: 1520, type: 'sep', text: '─'.repeat(20) },
  { delay: 1640, type: 'status', text: 'MEMORY BANK ............................', ok: '[CLEAR]' },
  { delay: 1790, type: 'status', text: 'ERROR TRACE ............................', ok: '[NONE]' },
  { delay: 1940, type: 'plain', text: 'LATENCY ................................ 0.01ms' },
  { delay: 2090, type: 'plain', text: 'CREATIVE POWER ......................... 99%' },
  { delay: 2240, type: 'status', text: 'IMAGINATION CORE .......................', ok: '[FLOWING]' },
  { delay: 2400, type: 'empty', text: '' },
  { delay: 2480, type: 'section', text: 'SUBSYSTEM INITIALIZATION' },
  { delay: 2560, type: 'sep', text: '─'.repeat(20) },
  { delay: 2680, type: 'status', text: 'INSPIRATION ENGINE .....................', ok: '[ACTIVE]' },
  { delay: 2830, type: 'status', text: 'IDEA GENERATOR .........................', ok: '[GENERATING]' },
  { delay: 2980, type: 'status', text: 'VISUAL LIBRARY .........................', ok: '[INDEXED]' },
  { delay: 3130, type: 'status', text: 'CONCEPT ARCHIVE ........................', ok: '[SYNCED]' },
  { delay: 3280, type: 'status', text: 'REALITY DISTORTION MODULE .............', ok: '[ENABLED]' },
  { delay: 3440, type: 'empty', text: '' },
  { delay: 3520, type: 'section', text: 'IDENTITY PROTOCOL' },
  { delay: 3600, type: 'sep', text: '─'.repeat(20) },
  { delay: 3720, type: 'status', text: 'CREATOR SIGNATURE ......................', ok: '[VERIFIED]' },
  { delay: 3870, type: 'status', text: 'ACCESS LEVEL ...........................', ok: '[OMEGA PRIME]' },
  { delay: 4020, type: 'status', text: 'NEURAL LINK ............................', ok: '[STABLE]' },
  { delay: 4180, type: 'empty', text: '' },
  { delay: 4260, type: 'sep', text: '═'.repeat(48) },
  { delay: 4380, type: 'empty', text: '' },
  { delay: 4460, type: 'access', text: 'CREATIVE SYSTEM READY' },
  { delay: 4620, type: 'empty', text: '' },
  { delay: 4700, type: 'welcome', text: 'WELCOME, FRIEND' },
  { delay: 4860, type: 'empty', text: '' },
  { delay: 4940, type: 'welcome', text: "IT'S ALWAYS NICE TO SEE YOU" },
  { delay: 5100, type: 'welcome', text: 'HAVE A NICE DAY' },
  { delay: 5180, type: 'enter', text: 'ENTERING THE PORTFOLIO...' },
  { delay: 5380, type: 'enter', text: 'EXPANDING CREATIVE UNIVERSE' },
];

interface Props {
  onReveal: () => void;
}

export default function TVPreloader({ onReveal }: Props) {
  const [progress, setProgress] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showBios, setShowBios] = useState(false);
  const [biosLines, setBiosLines] = useState<BiosLine[]>([]);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [tvInnerOpacity, setTvInnerOpacity] = useState(1);
  const skippedRef = useRef(false);
  const grainRafRef = useRef(0);
  const glitchRafRef = useRef(0);
  const loadTimerRef = useRef<ReturnType<typeof setInterval>>();
  const biosTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const revealTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const terminalBodyRef = useRef<HTMLDivElement>(null);
  const biosContainerRef = useRef<HTMLDivElement>(null);

  const skip = useCallback(() => {
    if (skippedRef.current) return;
    skippedRef.current = true;
    clearInterval(loadTimerRef.current);
    clearTimeout(biosTimerRef.current);
    clearTimeout(revealTimerRef.current);
    cancelAnimationFrame(grainRafRef.current);
    cancelAnimationFrame(glitchRafRef.current);
    setIsVisible(false);
    onReveal();
  }, [onReveal]);

  // Auto-scroll terminal when lines change
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [biosLines, typedText]);

  useEffect(() => {
    const isInternalNav = sessionStorage.getItem('txText') !== null;
    if (isInternalNav) {
      setIsVisible(false);
      onReveal();
      return;
    }

    // Visit count
    const SKIP_KEY = 'portfolio_vc';
    let vc = 0;
    try { vc = parseInt(localStorage.getItem(SKIP_KEY) || '0', 10) || 0; } catch(e) {}
    vc++;
    try { localStorage.setItem(SKIP_KEY, String(vc)); } catch(e) {}
    const shouldShowSkip = vc >= 2;

    // Loading bar
    let loadN = 0;
    loadTimerRef.current = setInterval(() => {
      loadN += Math.random() > 0.4 ? 3 : 2;
      if (loadN >= 100) { loadN = 100; clearInterval(loadTimerRef.current); }
      setProgress(loadN);
    }, 42);

    // Skip hint
    if (shouldShowSkip) {
      const isMobile = window.matchMedia('(pointer: coarse)').matches;
      const hintDelay = isMobile ? 800 : 1100;
      setTimeout(() => {
        if (skippedRef.current) return;
        setShowSkip(true);
        if (isMobile) {
          setTimeout(() => { if (!skippedRef.current) setIsPulsing(true); }, 700);
        }
      }, hintDelay);

      const keyHandler = (e: KeyboardEvent) => {
        if (e.key === ' ' || e.key === 'Escape') { e.preventDefault(); skip(); }
      };
      document.addEventListener('keydown', keyHandler);
    }

    // BIOS Sequence starts at 3300ms
    biosTimerRef.current = setTimeout(() => {
      if (skippedRef.current) return;

      // Fade out tv-inner
      setTvInnerOpacity(0);

      // Show BIOS
      setShowBios(true);

      // Schedule each BIOS line
      BIOS_LINES.forEach((line) => {
        setTimeout(() => {
          if (skippedRef.current) return;
          setBiosLines(prev => [...prev, line]);

          if (line.type === 'enter' && line.text === 'EXPANDING CREATIVE UNIVERSE') {
            setIsTyping(true);
            let i = 0;
            const typeNext = () => {
              if (i < line.text.length) {
                setTypedText(prev => prev + line.text[i]);
                i++;
                setTimeout(typeNext, 48);
              } else {
                setIsTyping(false);
                setIsBlinking(true);
                // After typing finishes + blink delay, hide preloader and reveal page
                revealTimerRef.current = setTimeout(() => {
                  if (!skippedRef.current) {
                    setIsVisible(false);
                    onReveal();
                  }
                }, 1600);
              }
            };
            setTimeout(typeNext, 60);
          }
        }, line.delay);
      });
    }, 3300);

    return () => {
      clearInterval(loadTimerRef.current);
      clearTimeout(biosTimerRef.current);
      clearTimeout(revealTimerRef.current);
      cancelAnimationFrame(grainRafRef.current);
      cancelAnimationFrame(glitchRafRef.current);
    };
  }, [skip, onReveal]);

  // Grain effect
  useEffect(() => {
    if (!isVisible || showBios) return;
    const canvas = document.getElementById('tvGrainCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    canvas.width = 1600;
    canvas.height = 900;
    const gc = canvas.getContext('2d')!;
    let tick = 0;

    function drawGrain() {
      tick++;
      if (tick % 5 === 0) {
        const img = gc.createImageData(1600, 900);
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
          const v = Math.random() * 255 | 0;
          d[i] = d[i + 1] = d[i + 2] = v;
          d[i + 3] = 255;
        }
        gc.putImageData(img, 0, 0);
      }
      grainRafRef.current = requestAnimationFrame(drawGrain);
    }
    grainRafRef.current = requestAnimationFrame(drawGrain);
    return () => cancelAnimationFrame(grainRafRef.current);
  }, [isVisible, showBios]);

  // Glitch effect
  useEffect(() => {
    if (!isVisible || showBios) return;
    const canvas = document.getElementById('tvGlitchCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    const GW = 320, GH = 200;
    canvas.width = GW;
    canvas.height = GH;
    const gg = canvas.getContext('2d')!;
    const snowImg = gg.createImageData(GW, GH);
    const sd = snowImg.data;
    const STRIP_COLORS = [
      [191, 191, 191], [191, 191, 0], [0, 191, 191],
      [0, 191, 0], [191, 0, 191], [191, 0, 0], [0, 0, 191]
    ];
    const N_STRIPS = STRIP_COLORS.length;
    const stripOffsets = new Float32Array(N_STRIPS);
    const stripTargets = new Float32Array(N_STRIPS);
    const STRIP_H = Math.ceil(GH * 0.62);
    const STRIP_W = Math.ceil(GW / N_STRIPS);
    const BURST_AT = [400, 1100];
    const BURST_DUR = 220;
    const glitchStart = Date.now();
    let burstActive = false;
    let burstEnd = 0;
    let nextBurst = 0;
    let shakeTimer: ReturnType<typeof setInterval> | null = null;
    const tvInnerEl = document.getElementById('tvInner');

    const stopShake = () => {
      if (shakeTimer) { clearInterval(shakeTimer); shakeTimer = null; }
      if (tvInnerEl) tvInnerEl.style.transform = '';
    };

    const startShake = () => {
      stopShake();
      let step = 0;
      shakeTimer = setInterval(() => {
        step++;
        if (step >= 12 || !tvInnerEl) { stopShake(); return; }
        tvInnerEl.style.transform = `translateX(${(Math.random() - 0.5) * 28}px)`;
      }, BURST_DUR / 12);
    };

    const activateBurst = () => {
      burstActive = true;
      burstEnd = Date.now() + BURST_DUR;
      for (let i = 0; i < N_STRIPS; i++) stripTargets[i] = (Math.random() - 0.5) * 36;
      startShake();
    };

    function drawGlitch() {
      const now = Date.now();
      const elapsed = now - glitchStart;

      if (!burstActive && nextBurst < BURST_AT.length && elapsed >= BURST_AT[nextBurst]) {
        activateBurst(); nextBurst++;
      }

      if (burstActive && now >= burstEnd) {
        burstActive = false;
        stopShake();
        gg.clearRect(0, 0, GW, GH);
        stripOffsets.fill(0);
      }

      if (burstActive) {
        for (let i = 0; i < sd.length; i += 4) {
          const v = Math.random() * 255 | 0;
          sd[i] = sd[i + 1] = sd[i + 2] = v;
          sd[i + 3] = (Math.random() * 180 + 55) | 0;
        }
        gg.putImageData(snowImg, 0, 0);
        for (let i = 0; i < N_STRIPS; i++) {
          stripOffsets[i] += (stripTargets[i] - stripOffsets[i]) * 0.35;
          if (Math.random() < 0.18) stripTargets[i] = (Math.random() - 0.5) * 36;
          const [r, g, b] = STRIP_COLORS[i];
          gg.fillStyle = `rgba(${r},${g},${b},0.72)`;
          gg.fillRect(i * STRIP_W + stripOffsets[i], 0, STRIP_W + 1, STRIP_H);
        }
      }
      glitchRafRef.current = requestAnimationFrame(drawGlitch);
    }
    glitchRafRef.current = requestAnimationFrame(drawGlitch);

    return () => {
      cancelAnimationFrame(glitchRafRef.current);
      stopShake();
    };
  }, [isVisible, showBios]);

  if (!isVisible) return null;

  return (
    <div className="preloader" id="preloader" aria-hidden="true" role="presentation">
      <div className="tv-outer">
        <div className="tv-screen">
          <div className="tv-inner" id="tvInner" style={{ opacity: tvInnerOpacity, transition: 'opacity 0.28s ease' }}>
            {/* SMPTE Color Bars */}
            <div className="tv-bars" aria-hidden="true">
              <div className="tv-bar tv-bar--w" /><div className="tv-bar tv-bar--y" />
              <div className="tv-bar tv-bar--c" /><div className="tv-bar tv-bar--g" />
              <div className="tv-bar tv-bar--m" /><div className="tv-bar tv-bar--r" />
              <div className="tv-bar tv-bar--b" />
            </div>
            <div className="tv-bars-bottom" aria-hidden="true">
              <div className="tv-bar-b tv-bar-b--1" /><div className="tv-bar-b tv-bar-b--2" />
              <div className="tv-bar-b tv-bar-b--3" /><div className="tv-bar-b tv-bar-b--4" />
              <div className="tv-bar-b tv-bar-b--5" /><div className="tv-bar-b tv-bar-b--6" />
              <div className="tv-bar-b tv-bar-b--7" />
            </div>
            <div className="tv-barcode tv-barcode--left" aria-hidden="true" />
            <div className="tv-barcode tv-barcode--right" aria-hidden="true" />
            <div className="tv-chaos" aria-hidden="true">
              {Array.from({ length: 30 }, (_, i) => (
                <div key={i} className={`tv-cb tv-cb-${i + 1}`} />
              ))}
              <div className="tv-cross tv-cross-1" />
              <div className="tv-cross tv-cross-2" />
              <div className="tv-cross tv-cross-3" />
            </div>
            <div className="tv-center">
              <div className="tv-panel">
                <div className="tv-msg">STREAM<br/>STARTING<br/>SOON</div>
                <div className="tv-panel-bar">
                  <div className="tv-progress">
                    <div
                      className="tv-progress-fill"
                      id="tvProgressFill"
                      style={{
                        width: progress >= 100 ? '100%' : `${(progress / 100) * 100}%`,
                        background: 'repeating-linear-gradient(to right, rgba(255,255,255,0.95) 0px, rgba(255,255,255,0.95) 7px, transparent 7px, transparent 10px)',
                      }}
                    />
                  </div>
                  <span className="tv-pct" id="tvPct" style={{ display: 'none' }}>{progress}%</span>
                </div>
                <div className={`tv-skip-hint ${showSkip ? 'is-visible' : ''} ${isPulsing ? 'is-pulsing' : ''}`} id="tvSkipHint" aria-hidden="true">
                  <span className="tv-skip-desktop">PRESS SPACE OR ESC TO SKIP</span>
                  <span className="tv-skip-mobile">TAP TO SKIP</span>
                </div>
              </div>
            </div>
          </div>

          {/* BIOS */}
          <div className={`tv-bios ${showBios ? 'is-visible' : ''}`} id="tvBios" ref={biosContainerRef}>
            <div className="bios-line bios-line--empty" />
            <div className="bios-line bios-line--logo">P O R T F O L I O</div>
            <div className="bios-line bios-line--logo-tag">CREATIVE DESIGN SYSTEM  ■  v2026</div>
            <div className="bios-line bios-line--empty" />
            <div className="bios-line bios-line--header">PORTFOLIO BOOT SEQUENCE v1.0</div>
            <div className="bios-line bios-line--sep">{'═'.repeat(48)}</div>
            <div className="bios-terminal-body" ref={terminalBodyRef}>
              {biosLines.map((line, i) => {
                if (line.type === 'status') {
                  return (
                    <div key={i} className="bios-line bios-line--status">
                      <span className="bl-label">{line.text}</span>
                      <span className="bl-ok">{line.ok}</span>
                    </div>
                  );
                }
                if (line.type === 'enter' && line.text === 'EXPANDING CREATIVE UNIVERSE') {
                  return (
                    <div key={i} className={`bios-line bios-line--enter ${isBlinking ? 'is-blinking' : ''}`}>
                      {typedText}
                      {isTyping && <span className="bios-cursor" />}
                    </div>
                  );
                }
                const classMap: Record<string, string> = {
                  empty: 'bios-line--empty',
                  section: 'bios-line--section',
                  sep: 'bios-line--sep',
                  plain: 'bios-line--status',
                  access: 'bios-line--access',
                  welcome: 'bios-line--welcome',
                  enter: 'bios-line--enter',
                };
                return (
                  <div key={i} className={`bios-line ${classMap[line.type] || ''}`}>
                    {line.text}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="tv-scanlines" aria-hidden="true" />
          <canvas className="tv-grain-canvas" id="tvGrainCanvas" width={1600} height={900} />
          <canvas className="tv-glitch-canvas" id="tvGlitchCanvas" width={320} height={200} />
          <div className="tv-scanner-lines" aria-hidden="true">
            <span style={{ '--dur': '9s', '--del': '0s' } as React.CSSProperties} />
            <span style={{ '--dur': '13s', '--del': '-5s' } as React.CSSProperties} />
            <span style={{ '--dur': '17s', '--del': '-10s' } as React.CSSProperties} />
          </div>
          <div className="tv-inner-glow" aria-hidden="true" />
          <div className="tv-vignette" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
