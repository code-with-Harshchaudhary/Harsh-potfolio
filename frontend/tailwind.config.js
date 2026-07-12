/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        beige: {
          DEFAULT: '#F5F0E8',
          dark: '#EDE8E0',
          darker: '#E5DED4',
        },
        fg: {
          DEFAULT: '#0a7a6d',
          dim: 'rgba(45,45,45,0.25)',
          dimmer: 'rgba(45,45,45,0.08)',
        },
        accent: {
          DEFAULT: '#C4A882',
          dim: 'rgba(196,168,130,0.15)',
        },
        navy: {
          fluid: '#1E195A',
        },
        side: {
          red: '#FF2D2D',
          cyan: '#00E5FF',
        }
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Arial Black', 'Impact', 'sans-serif'],
        name: ['"Barlow Condensed"', 'Arial Black', 'Impact', 'sans-serif'],
        ui: ['"Space Grotesk"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['"VT323"', 'monospace'],
      },
      animation: {
        'side-reveal-left': 'sideRevealLeft 0.8s cubic-bezier(0.22,1,0.36,1) 2.2s both',
        'side-reveal-right': 'sideRevealRight 0.8s cubic-bezier(0.22,1,0.36,1) 2.2s both',
        'name-reveal': 'nameReveal 1.0s cubic-bezier(0.22,1,0.36,1) 1.2s both',
        'portrait-reveal': 'portraitReveal 1.2s cubic-bezier(0.22,1,0.36,1) 0s both',
        'scan-down': 'pageScanDown var(--dur,10s) linear infinite',
        'bios-blink': 'biosBlink 0.42s step-end infinite',
        'cursor-blink': 'cursorBlink 0.5s step-end infinite',
        'skip-pulse': 'skipPulse 2s ease-in-out infinite',
        'arrow-drip': 'arrowDrip 1.1s ease-in-out infinite',
      },
      keyframes: {
        sideRevealLeft: {
          'from': { opacity: '0', transform: 'translateX(-50px) translateY(-50%)' },
          'to': { opacity: '1', transform: 'translateX(0) translateY(-50%)' },
        },
        sideRevealRight: {
          'from': { opacity: '0', transform: 'translateX(50px) translateY(-50%)' },
          'to': { opacity: '1', transform: 'translateX(0) translateY(-50%)' },
        },
        nameReveal: {
          'from': { opacity: '0', transform: 'translateY(60px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        portraitReveal: {
          'from': { opacity: '0', transform: 'translateX(-50%) translateY(100px)' },
          'to': { opacity: '1', transform: 'translateX(-50%) translateY(0)' },
        },
        pageScanDown: {
          '0%': { transform: 'translateY(0)', opacity: '0' },
          '3%': { opacity: '1' },
          '59%': { transform: 'translateY(calc(100vh + 8px))', opacity: '0.7' },
          '62%': { transform: 'translateY(calc(100vh + 8px))', opacity: '0' },
          '100%': { transform: 'translateY(calc(100vh + 8px))', opacity: '0' },
        },
        biosBlink: {
          '0%,49%': { opacity: '1' },
          '50%,100%': { opacity: '0' },
        },
        cursorBlink: {
          '0%,49%': { opacity: '1' },
          '50%,100%': { opacity: '0' },
        },
        skipPulse: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        arrowDrip: {
          '0%': { transform: 'translateY(-4px)', opacity: '0.25' },
          '45%': { transform: 'translateY(3px)', opacity: '1' },
          '55%': { transform: 'translateY(3px)', opacity: '1' },
          '100%': { transform: 'translateY(-4px)', opacity: '0.25' },
        },
      },
    },
  },
  plugins: [],
}
