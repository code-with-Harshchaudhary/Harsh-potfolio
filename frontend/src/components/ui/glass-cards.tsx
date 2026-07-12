import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface GlassCardData {
  id: number;
  title: string;
  description: string;
  color: string;
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
        style={{
          position: 'relative',
          width: '80%',
          maxWidth: '960px',
          height: '420px',
          borderRadius: '24px',
          isolation: 'isolate',
          top: `calc(-5vh + ${index * 25}px)`,
          transformOrigin: 'top',
        }}
      >
        {/* Animated border glow */}
        <div
          style={{
            position: 'absolute',
            inset: '-3px',
            borderRadius: '27px',
            padding: '3px',
            background: `conic-gradient(
              from 0deg,
              transparent 0deg,
              ${color} 60deg,
              ${color.replace('0.8', '0.5')} 120deg,
              transparent 180deg,
              ${color.replace('0.8', '0.3')} 240deg,
              transparent 360deg
            )`,
            zIndex: -1,
            opacity: 0.9,
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
              'linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
            backdropFilter: 'blur(28px) saturate(160%)',
            WebkitBackdropFilter: 'blur(28px) saturate(160%)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.4),
              0 2px 8px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.25),
              inset 0 -1px 0 rgba(255, 255, 255, 0.08)
            `,
            overflow: 'hidden',
            padding: '36px 40px',
          }}
        >
          {/* Top reflection sheen */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '55%',
              background:
                'linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.08) 50%, transparent 100%)',
              pointerEvents: 'none',
              borderRadius: '24px 24px 0 0',
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
                'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.5) 50%, transparent 100%)',
              borderRadius: '1px',
              pointerEvents: 'none',
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
                'linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, transparent 50%)',
              borderRadius: '24px 0 0 24px',
              pointerEvents: 'none',
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
                radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 1px, transparent 2px),
                radial-gradient(circle at 80% 70%, rgba(255,255,255,0.07) 1px, transparent 2px),
                radial-gradient(circle at 40% 80%, rgba(255,255,255,0.05) 1px, transparent 2px)
              `,
              backgroundSize: '30px 30px, 25px 25px, 35px 35px',
              pointerEvents: 'none',
              borderRadius: '24px',
              opacity: 0.6,
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
                'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 45%, transparent 100%)',
              pointerEvents: 'none',
              borderRadius: '0 0 24px 24px',
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

interface StackedCardsProps {
  cards: GlassCardData[];
}

export const StackedCards: React.FC<StackedCardsProps> = ({ cards }) => {
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