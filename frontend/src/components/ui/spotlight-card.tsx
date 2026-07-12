import React, { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface SpotlightCardData {
  id: number;
  title: string;
  description: string;
  color: string; // e.g. "rgba(0, 229, 255, 0.8)"
}

interface CardProps {
  title: string;
  description: string;
  index: number;
  totalCards: number;
  color: string;
}

const Card: React.FC<CardProps> = ({ title, description, index, totalCards, color }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const borderGlowRef = useRef<HTMLDivElement>(null);

  // Extract base RGB from rgba color for the glow
  const getGlowColor = useCallback(() => {
    // Parse rgba( r, g, b, a ) -> rgb(r, g, b)
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return `rgb(${match[1]}, ${match[2]}, ${match[3]})`;
    }
    return color;
  }, [color]);

  useEffect(() => {
    const card = cardRef.current;
    const container = containerRef.current;
    if (!card || !container) return;

    const targetScale = 1 - (totalCards - index) * 0.05;

    gsap.set(card, {
      scale: 1,
      transformOrigin: 'center top',
    });

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top center',
      end: 'bottom center',
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        const scale = gsap.utils.interpolate(1, targetScale, progress);
        gsap.set(card, {
          scale: Math.max(scale, targetScale),
          transformOrigin: 'center top',
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, [index, totalCards]);

  // Mouse move handler for spotlight effect
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    const glow = glowRef.current;
    const borderGlow = borderGlowRef.current;
    if (!card || !glow || !borderGlow) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Move the radial glow to follow cursor
    glow.style.background = `radial-gradient(
      600px circle at ${x}px ${y}px,
      ${color.replace('0.8', '0.25')},
      transparent 40%
    )`;

    // Move the border spotlight
    borderGlow.style.background = `radial-gradient(
      300px circle at ${x}px ${y}px,
      ${color.replace('0.8', '0.9')},
      transparent 50%
    )`;
  }, [color]);

  const handleMouseLeave = useCallback(() => {
    const glow = glowRef.current;
    const borderGlow = borderGlowRef.current;
    if (!glow || !borderGlow) return;

    // Fade out glow
    glow.style.background = 'transparent';
    borderGlow.style.background = 'transparent';
  }, []);

  const glowColor = getGlowColor();

  return (
    <div
      ref={containerRef}
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'sticky',
        top: 0,
        zIndex: index + 1,
      }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'relative',
          width: '80%',
          maxWidth: '960px',
          height: '420px',
          borderRadius: '24px',
          isolation: 'isolate',
          top: `calc(-5vh + ${index * 25}px)`,
          transformOrigin: 'top',
          cursor: 'default',
        }}
      >
        {/* Animated conic border */}
        <div
          style={{
            position: 'absolute',
            inset: '-2px',
            borderRadius: '26px',
            padding: '2px',
            background: `conic-gradient(
              from 0deg,
              transparent 0deg,
              ${color} 60deg,
              ${color.replace('0.8', '0.5')} 120deg,
              transparent 180deg,
              ${color.replace('0.8', '0.3')} 240deg,
              transparent 360deg
            )`,
            zIndex: -2,
            opacity: 0.85,
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            pointerEvents: 'none',
          }}
        />

        {/* Mouse-following border spotlight */}
        <div
          ref={borderGlowRef}
          style={{
            position: 'absolute',
            inset: '-3px',
            borderRadius: '27px',
            padding: '3px',
            background: 'transparent',
            zIndex: -1,
            transition: 'background 0.15s ease-out',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            pointerEvents: 'none',
          }}
        />

        {/* Glass card body */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            borderRadius: '24px',
            background:
              'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))',
            backdropFilter: 'blur(28px) saturate(160%)',
            WebkitBackdropFilter: 'blur(28px) saturate(160%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.4),
              0 2px 8px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.15),
              inset 0 -1px 0 rgba(255, 255, 255, 0.05)
            `,
            overflow: 'hidden',
            padding: '36px 40px',
          }}
        >
          {/* Mouse-following inner glow */}
          <div
            ref={glowRef}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '24px',
              background: 'transparent',
              transition: 'background 0.15s ease-out',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* Top reflection sheen */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '55%',
              background:
                'linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.06) 50%, transparent 100%)',
              pointerEvents: 'none',
              borderRadius: '24px 24px 0 0',
              zIndex: 2,
            }}
          />

          {/* Horizontal shine line */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              right: '12px',
              height: '1.5px',
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
              borderRadius: '1px',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />

          {/* Side reflection */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '2px',
              height: '100%',
              background:
                'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
              borderRadius: '24px 0 0 24px',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />

          {/* Frost texture */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08) 1px, transparent 2px),
                radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 1px, transparent 2px),
                radial-gradient(circle at 40% 80%, rgba(255,255,255,0.04) 1px, transparent 2px)
              `,
              backgroundSize: '30px 30px, 25px 25px, 35px 35px',
              pointerEvents: 'none',
              borderRadius: '24px',
              opacity: 0.5,
              zIndex: 2,
            }}
          />

          {/* Bottom readability gradient */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50%',
              background:
                'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 45%, transparent 100%)',
              pointerEvents: 'none',
              borderRadius: '0 0 24px 24px',
              zIndex: 2,
            }}
          />

          {/* Text content at bottom */}
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h3
              style={{
                fontSize: 'clamp(1.5rem, 2.8vw, 2.2rem)',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '8px',
                textShadow: '0 2px 10px rgba(0,0,0,0.6)',
                letterSpacing: '0.02em',
                lineHeight: 1.2,
              }}
            >
              {title}
            </h3>
            <p
              style={{
                fontSize: 'clamp(0.85rem, 1.2vw, 1rem)',
                color: 'rgba(255, 255, 255, 0.82)',
                lineHeight: 1.5,
                maxWidth: '560px',
                textShadow: '0 1px 6px rgba(0,0,0,0.5)',
              }}
            >
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SpotlightCardsProps {
  cards: SpotlightCardData[];
}

export const SpotlightCards: React.FC<SpotlightCardsProps> = ({ cards }) => {
  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {cards.map((card, index) => (
        <Card
          key={card.id}
          title={card.title}
          description={card.description}
          index={index}
          totalCards={cards.length}
          color={card.color}
        />
      ))}
    </div>
  );
};

// Single GlowCard for direct use
interface GlowCardProps {
  title?: string;
  description?: string;
  color?: string;
  className?: string;
}

export const GlowCard: React.FC<GlowCardProps> = ({
  title = 'Card Title',
  description = 'Card description goes here',
  color = 'rgba(0, 229, 255, 0.8)',
  className,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const borderGlowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    const glow = glowRef.current;
    const borderGlow = borderGlowRef.current;
    if (!card || !glow || !borderGlow) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    glow.style.background = `radial-gradient(
      500px circle at ${x}px ${y}px,
      ${color.replace('0.8', '0.2')},
      transparent 40%
    )`;

    borderGlow.style.background = `radial-gradient(
      250px circle at ${x}px ${y}px,
      ${color.replace('0.8', '0.85')},
      transparent 50%
    )`;
  }, [color]);

  const handleMouseLeave = useCallback(() => {
    const glow = glowRef.current;
    const borderGlow = borderGlowRef.current;
    if (!glow || !borderGlow) return;
    glow.style.background = 'transparent';
    borderGlow.style.background = 'transparent';
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        position: 'relative',
        width: '320px',
        height: '400px',
        borderRadius: '24px',
        isolation: 'isolate',
        cursor: 'default',
      }}
    >
      {/* Base border */}
      <div
        style={{
          position: 'absolute',
          inset: '-2px',
          borderRadius: '26px',
          padding: '2px',
          background: `conic-gradient(
            from 0deg,
            transparent 0deg,
            ${color} 60deg,
            ${color.replace('0.8', '0.4')} 180deg,
            transparent 360deg
          )`,
          zIndex: -2,
          opacity: 0.7,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          pointerEvents: 'none',
        }}
      />

      {/* Mouse-following border spotlight */}
      <div
        ref={borderGlowRef}
        style={{
          position: 'absolute',
          inset: '-3px',
          borderRadius: '27px',
          padding: '3px',
          background: 'transparent',
          zIndex: -1,
          transition: 'background 0.15s ease-out',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          pointerEvents: 'none',
        }}
      />

      {/* Card body */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          borderRadius: '24px',
          background:
            'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))',
          backdropFilter: 'blur(28px) saturate(160%)',
          WebkitBackdropFilter: 'blur(28px) saturate(160%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.15)
          `,
          overflow: 'hidden',
          padding: '32px',
        }}
      >
        {/* Inner spotlight glow */}
        <div
          ref={glowRef}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '24px',
            background: 'transparent',
            transition: 'background 0.15s ease-out',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Top sheen */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 60%)',
            pointerEvents: 'none',
            borderRadius: '24px 24px 0 0',
            zIndex: 2,
          }}
        />

        {/* Bottom gradient for text */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '45%',
            background:
              'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
            pointerEvents: 'none',
            borderRadius: '0 0 24px 24px',
            zIndex: 2,
          }}
        />

        {/* Text */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <h3
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '6px',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.75)',
              lineHeight: 1.5,
              textShadow: '0 1px 4px rgba(0,0,0,0.4)',
            }}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};