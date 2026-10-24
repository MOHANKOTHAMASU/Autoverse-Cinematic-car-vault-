// AutoVerse Experience 1: Dramatic Cinematic Car Introduction
// Ambient lighting reveal, headlight ignition, typography reveal, and instant skip controls

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Film } from 'lucide-react';

interface CinematicIntroProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete, forceShow = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(0); // 0: Ambient, 1: Headlights, 2: Title, 3: Actions
  const navigate = useNavigate();

  useEffect(() => {
    // Only show once per session unless forced
    const hasSeen = sessionStorage.getItem('autoverse_intro_seen');
    if (!hasSeen || forceShow) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';

      // Cinematic sequence timeline
      const t1 = setTimeout(() => setStep(1), 700); // Headlights ignite
      const t2 = setTimeout(() => setStep(2), 2000); // Title reveal
      const t3 = setTimeout(() => setStep(3), 3200); // Tagline & Buttons reveal

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleDismiss();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [forceShow]);

  const handleDismiss = () => {
    sessionStorage.setItem('autoverse_intro_seen', 'true');
    setIsVisible(false);
    document.body.style.overflow = 'unset';
    if (onComplete) onComplete();
  };

  const handleExploreCars = () => {
    handleDismiss();
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/discover');
    }
  };

  const handleEnterCinema = () => {
    handleDismiss();
    navigate('/cinema');
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#030508',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: 'opacity 0.8s ease',
      }}
      role="dialog"
      aria-label="Cinematic Introduction"
    >
      {/* Skip Button */}
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2.5rem',
          zIndex: 20,
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#e2e8f0',
          padding: '0.45rem 1rem',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)';
          e.currentTarget.style.borderColor = 'var(--accent-cyan)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        <span>SKIP INTRO</span>
        <span style={{ opacity: 0.6, fontSize: '0.65rem' }}>[ESC]</span>
      </button>

      {/* Atmospheric Car Silhouette Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1920&q=85"
          alt="High-Performance Sports Car Silhouette"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: step >= 1 ? 0.38 : 0.08,
            filter: 'contrast(1.3) brightness(0.7)',
            transform: step >= 1 ? 'scale(1.03)' : 'scale(1.0)',
            transition: 'opacity 1.6s cubic-bezier(0.16, 1, 0.3, 1), transform 4s ease-out',
          }}
        />

        {/* Dynamic Headlight Light Beams */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              step >= 1
                ? 'radial-gradient(ellipse 60% 40% at 50% 65%, rgba(6, 182, 212, 0.25) 0%, rgba(3, 5, 8, 0) 70%)'
                : 'none',
            opacity: step >= 1 ? 1 : 0,
            transition: 'opacity 1.2s ease',
          }}
        />

        {/* Headlight Flare Glow Points */}
        {step >= 1 && (
          <>
            <div
              style={{
                position: 'absolute',
                top: '58%',
                left: '38%',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #ffffff 0%, rgba(6, 182, 212, 0.8) 40%, transparent 70%)',
                boxShadow: '0 0 60px 20px rgba(6, 182, 212, 0.6)',
                animation: 'pulseGlow 2.5s infinite alternate',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '58%',
                right: '38%',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #ffffff 0%, rgba(6, 182, 212, 0.8) 40%, transparent 70%)',
                boxShadow: '0 0 60px 20px rgba(6, 182, 212, 0.6)',
                animation: 'pulseGlow 2.5s infinite alternate',
              }}
            />
          </>
        )}
      </div>

      {/* Foreground Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          maxWidth: '800px',
          padding: '0 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Title: AUTOVERSE */}
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: 900,
            letterSpacing: '0.22em',
            margin: '0 0 1rem',
            background: 'linear-gradient(180deg, #ffffff 30%, rgba(255, 255, 255, 0.5) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            opacity: step >= 2 ? 1 : 0,
            transform: step >= 2 ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          AUTOVERSE
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.35rem)',
            fontWeight: 400,
            letterSpacing: '0.12em',
            color: 'var(--accent-cyan)',
            margin: '0 0 2.5rem',
            textTransform: 'uppercase',
            opacity: step >= 3 ? 1 : 0,
            transform: step >= 3 ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          Beyond the Machine. Into the Experience.
        </p>

        {/* Functional Actions */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            opacity: step >= 3 ? 1 : 0,
            transform: step >= 3 ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.2s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
          }}
        >
          <button
            onClick={handleExploreCars}
            className="btn btn-primary"
            style={{
              padding: '0.85rem 1.85rem',
              fontSize: '0.9rem',
              letterSpacing: '0.08em',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <span>EXPLORE CARS</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={handleEnterCinema}
            className="btn btn-secondary"
            style={{
              padding: '0.85rem 1.85rem',
              fontSize: '0.9rem',
              letterSpacing: '0.08em',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <Film size={16} color="var(--accent-cyan)" />
            <span>ENTER ROAD CINEMA</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulseGlow {
          from { opacity: 0.7; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};
