import { useState, useCallback, useRef } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function useSlotMachine() {
  const [currentName, setCurrentName] = useState('Harsh');
  const [isAnimating, setIsAnimating] = useState(false);
  const animatingRef = useRef(false);

  const getCharHeight = useCallback(() => {
    const d = document.createElement('span');
    d.className = 'name-char';
    d.textContent = 'A';
    d.style.cssText = 'visibility:hidden;position:absolute';
    const display = document.getElementById('nameDisplay');
    if (!display) return 180;
    display.appendChild(d);
    const h = d.getBoundingClientRect().height;
    d.remove();
    return h || 180;
  }, []);

  const getCharWidth = useCallback((ch: string) => {
    const d = document.createElement('span');
    d.className = 'name-char';
    d.textContent = ch;
    d.style.cssText = 'visibility:hidden;position:absolute';
    const display = document.getElementById('nameDisplay');
    if (!display) return 60;
    display.appendChild(d);
    const w = d.getBoundingClientRect().width;
    d.remove();
    return w || 60;
  }, []);

  /** Populate the display on first mount without animation */
  const initName = useCallback((name: string) => {
    const display = document.getElementById('nameDisplay');
    if (!display || display.children.length > 0) return;
    setCurrentName(name);
    name.split('').forEach((ch) => {
      const slot = document.createElement('div');
      slot.className = 'name-slot';
      slot.style.width = 'auto';
      const reel = document.createElement('div');
      reel.className = 'name-reel';
      const span = document.createElement('span');
      span.className = 'name-char';
      span.textContent = ch;
      reel.appendChild(span);
      slot.appendChild(reel);
      display.appendChild(slot);
    });
  }, []);

  const animateNameChange = useCallback((newName: string) => {
    if (animatingRef.current || currentName === newName) return;
    animatingRef.current = true;
    setIsAnimating(true);

    const display = document.getElementById('nameDisplay');
    if (!display) { animatingRef.current = false; setIsAnimating(false); return; }

    const existing = display.querySelectorAll('.name-slot');
    const oldLen = existing.length;

    if (oldLen > newName.length) {
      for (let i = newName.length; i < oldLen; i++) {
        const s = existing[i] as HTMLElement;
        s.classList.add('exiting');
        setTimeout(() => s.remove(), 380);
      }
    }

    newName.split('').forEach((targetChar, i) => {
      const spinCount = 2 + Math.floor(Math.random() * 3);
      let slot = existing[i] as HTMLElement | undefined;

      if (!slot) {
        slot = document.createElement('div');
        slot.className = 'name-slot';
        slot.style.cssText = 'width:0;opacity:0';
        display.appendChild(slot);
        setTimeout(() => {
          slot!.style.width = getCharWidth(targetChar) + 'px';
          slot!.style.opacity = '1';
        }, i * 70 + Math.random() * 35);
      }

      const oldReel = slot.querySelector('.name-reel');
      if (oldReel) oldReel.remove();
      const reel = document.createElement('div');
      reel.className = 'name-reel';
      reel.style.cssText = 'transform:translateY(0);transition:none';
      slot.appendChild(reel);

      for (let s = 0; s < spinCount; s++) {
        const ch = document.createElement('span');
        ch.className = 'name-char';
        ch.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
        reel.appendChild(ch);
      }
      const finalCh = document.createElement('span');
      finalCh.className = 'name-char';
      finalCh.textContent = targetChar;
      reel.appendChild(finalCh);

      const dur = 380 + spinCount * 130;
      setTimeout(() => {
        const h = getCharHeight();
        reel.style.transition = `transform ${dur}ms cubic-bezier(0.25,0.46,0.45,0.94)`;
        reel.style.transform = `translateY(-${spinCount * h}px)`;
        setTimeout(() => {
          reel.style.cssText = 'transform:translateY(0);transition:none';
          reel.innerHTML = '';
          const fc = document.createElement('span');
          fc.className = 'name-char';
          fc.textContent = targetChar;
          reel.appendChild(fc);
          if (i === newName.length - 1) {
            animatingRef.current = false;
            setIsAnimating(false);
            setCurrentName(newName);          // <-- ONLY update React state here
          }
        }, dur + 15);
      }, i * 70 + Math.random() * 35);
    });
  }, [currentName, getCharWidth, getCharHeight]);

  return { currentName, isAnimating, animateNameChange, initName };
}