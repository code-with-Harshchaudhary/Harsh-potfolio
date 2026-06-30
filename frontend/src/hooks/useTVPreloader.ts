import { useState, useEffect, useRef, useCallback } from 'react';

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
  { delay: 1520, type: 'sep', text: '─'.repeat(40) },
  { delay: 1640, type: 'status', text: 'MEMORY BANK ............................', ok: '[CLEAR]' },
  { delay: 1790, type: 'status', text: 'ERROR TRACE ............................', ok: '[NONE]' },
  { delay: 1940, type: 'plain', text: 'LATENCY ................................ 0.01ms' },
  { delay: 2090, type: 'plain', text: 'CREATIVE POWER ......................... 99%' },
  { delay: 2240, type: 'status', text: 'IMAGINATION CORE .......................', ok: '[FLOWING]' },
  { delay: 2400, type: 'empty', text: '' },
  { delay: 2480, type: 'section', text: 'SUBSYSTEM INITIALIZATION' },
  { delay: 2560, type: 'sep', text: '─'.repeat(40) },
  { delay: 2680, type: 'status', text: 'INSPIRATION ENGINE .....................', ok: '[ACTIVE]' },
  { delay: 2830, type: 'status', text: 'IDEA GENERATOR .........................', ok: '[GENERATING]' },
  { delay: 2980, type: 'status', text: 'VISUAL LIBRARY .........................', ok: '[INDEXED]' },
  { delay: 3130, type: 'status', text: 'CONCEPT ARCHIVE ........................', ok: '[SYNCED]' },
  { delay: 3280, type: 'status', text: 'REALITY DISTORTION MODULE .............', ok: '[ENABLED]' },
  { delay: 3440, type: 'empty', text: '' },
  { delay: 3520, type: 'section', text: 'IDENTITY PROTOCOL' },
  { delay: 3600, type: 'sep', text: '─'.repeat(40) },
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

export function useTVPreloader() {
  const [progress, setProgress] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showBios, setShowBios] = useState(false);
  const [biosLines, setBiosLines] = useState<BiosLine[]>([]);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const skippedRef = useRef(false);
  const grainRafRef = useRef(0);
  const glitchRafRef = useRef(0);
  const loadTimerRef = useRef<ReturnType<typeof setInterval>>();

  const skip = useCallback(() => {
    if (skippedRef.current) return;
    skippedRef.current = true;
    setIsVisible(false);
    cancelAnimationFrame(grainRafRef.current);
    cancelAnimationFrame(glitchRafRef.current);
    clearInterval(loadTimerRef.current);
  }, []);

  useEffect(() => {
    const isInternalNav = sessionStorage.getItem('txText') !== null;
    if (isInternalNav) {
      setIsVisible(false);
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
      return () => document.removeEventListener('keydown', keyHandler);
    }

    // BIOS sequence
    const biosTimer = setTimeout(() => {
      setShowBios(true);
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
                setTimeout(() => {
                  if (!skippedRef.current) {
                    setIsVisible(false);
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
      clearTimeout(biosTimer);
      cancelAnimationFrame(grainRafRef.current);
      cancelAnimationFrame(glitchRafRef.current);
    };
  }, [skip]);

  return {
    progress, showSkip, isPulsing, isVisible, showBios,
    biosLines, typedText, isTyping, isBlinking, skip
  };
}
