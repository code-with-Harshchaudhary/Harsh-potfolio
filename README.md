# Portfolio — React + Vite + FastAPI

A modern portfolio built with React 19, TypeScript, Vite, Tailwind CSS, and Python FastAPI.

## Structure

```
portfolio/
├── frontend/          # React 19 + Vite + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities
│   │   ├── App.tsx        # Root component
│   │   ├── main.tsx       # Entry point
│   │   └── index.css      # Global styles + Tailwind
│   ├── public/images/     # Static assets
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
└── backend/           # Python FastAPI
    ├── main.py
    └── requirements.txt
```

## Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server runs at `http://localhost:5173` and proxies `/api` to the backend.

### Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

The API runs at `http://localhost:8000`.

## Features Preserved from Original

- **TV CRT Preloader** — SMPTE bars, BIOS boot sequence, grain & glitch effects, skip option
- **WebGL Fluid Simulation** — Mouse-driven + idle orbital splats, deep navy/purple color
- **Topographic Contours** — Canvas 2D background with marching squares
- **Slot Machine Name** — "YOUR" / "NAME" animation on mouse side
- **Liquid-Masked Portrait** — Sketch overlay with fluid canvas mask
- **Side Labels** — "01 PROJECTS" (red glow) / "02 ARTWORKS" (cyan glow)
- **Custom Cursor** — Crosshair dot + ring, mix-blend-mode difference
- **Parallax Effects** — Portrait and name respond to mouse Y
- **Page CRT Overlay** — Scanlines, grain, vignette, barrel distortion
- **Scroll Reveal** — IntersectionObserver fade-in for sections
- **Contact Form** — Connected to FastAPI backend

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/contact` | Submit contact form |
| GET | `/api/projects` | Get all projects |
| GET | `/api/artworks` | Get all artworks |
| GET | `/api/contacts` | Get all contact submissions (admin) |

## Migration Notes

- All vanilla JS effects converted to React hooks
- WebGL fluid sim preserved as raw GLSL (no Three.js needed)
- Canvas 2D topographic contours preserved
- CSS converted to Tailwind + custom CSS in `index.css`
- Navigation scroll behavior via native `scrollIntoView`
- Contact form now POSTs to Python backend
