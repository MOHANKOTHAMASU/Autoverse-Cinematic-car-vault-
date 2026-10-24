// AutoVerse Stage 15: Context-Aware Floating AI Assistant Widget
// Provides quick conversational access from vehicle detail pages, comparisons, and discovery tools.

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  X,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { VEHICLES } from '../data/vehicles';

export const FloatingAssistantWidget: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentCarName, setCurrentCarName] = useState<string | null>(null);

  // Detect context: If on /cars/:slug
  useEffect(() => {
    const match = location.pathname.match(/\/cars\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      const slug = match[1];
      const found = VEHICLES.find((v) => v.slug === slug || v.id === slug);
      if (found) {
        setCurrentCarName(`${found.brand} ${found.model}`);
      } else {
        setCurrentCarName(null);
      }
    } else {
      setCurrentCarName(null);
    }
  }, [location.pathname]);

  // Don't show floating widget on the full /assistant page itself or admin
  if (location.pathname === '/assistant' || location.pathname.startsWith('/admin')) {
    return null;
  }

  const handleLaunchQuery = (query: string) => {
    setIsOpen(false);
    navigate(`/assistant?q=${encodeURIComponent(query)}`);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 900,
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Expanded Quick Drawer */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '4rem',
            right: 0,
            width: '360px',
            backgroundColor: 'rgba(9, 13, 20, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--accent-cyan)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 240, 255, 0.15)',
            borderRadius: '16px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            animation: 'fadeInUp 0.25s ease forwards',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(0, 240, 255, 0.15)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={14} color="var(--accent-cyan)" />
              </div>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
                AutoVerse Copilot
              </span>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <X size={16} />
            </button>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            {currentCarName
              ? `Ask anything about the ${currentCarName}, calculate 5-year running costs, or compare it with competitors.`
              : 'Ask automotive engineering questions, compare vehicles, or estimate total cost of ownership.'}
          </p>

          {/* Contextual Action Chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {currentCarName ? (
              <>
                <button
                  onClick={() => handleLaunchQuery(`What are the key strengths and verified specs of the ${currentCarName}?`)}
                  style={chipStyle}
                  onMouseEnter={chipHover}
                  onMouseLeave={chipUnhover}
                >
                  <span>Verified specs for {currentCarName}</span>
                  <ArrowRight size={13} color="var(--accent-cyan)" />
                </button>
                <button
                  onClick={() => handleLaunchQuery(`Estimate the five-year ownership cost of the ${currentCarName}.`)}
                  style={chipStyle}
                  onMouseEnter={chipHover}
                  onMouseLeave={chipUnhover}
                >
                  <span>Estimate 5-Year Running Cost</span>
                  <ArrowRight size={13} color="var(--accent-cyan)" />
                </button>
                <button
                  onClick={() => handleLaunchQuery(`Compare the ${currentCarName} with its primary segment rival.`)}
                  style={chipStyle}
                  onMouseEnter={chipHover}
                  onMouseLeave={chipUnhover}
                >
                  <span>Compare with closest rival</span>
                  <ArrowRight size={13} color="var(--accent-cyan)" />
                </button>
                <button
                  onClick={() => handleLaunchQuery(`What are the crash test safety ratings for the ${currentCarName}?`)}
                  style={chipStyle}
                  onMouseEnter={chipHover}
                  onMouseLeave={chipUnhover}
                >
                  <span>Official crash safety score</span>
                  <ArrowRight size={13} color="var(--accent-cyan)" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleLaunchQuery('Find the best electric car for my budget.')}
                  style={chipStyle}
                  onMouseEnter={chipHover}
                  onMouseLeave={chipUnhover}
                >
                  <span>Best electric car for my budget</span>
                  <ArrowRight size={13} color="var(--accent-cyan)" />
                </button>
                <button
                  onClick={() => handleLaunchQuery('Compare the Porsche Taycan Turbo S with another EV.')}
                  style={chipStyle}
                  onMouseEnter={chipHover}
                  onMouseLeave={chipUnhover}
                >
                  <span>Compare flagship EVs</span>
                  <ArrowRight size={13} color="var(--accent-cyan)" />
                </button>
                <button
                  onClick={() => handleLaunchQuery('Explain the difference between horsepower and torque.')}
                  style={chipStyle}
                  onMouseEnter={chipHover}
                  onMouseLeave={chipUnhover}
                >
                  <span>Horsepower vs Torque explained</span>
                  <ArrowRight size={13} color="var(--accent-cyan)" />
                </button>
              </>
            )}
          </div>

          {/* Full Assistant Page Link */}
          <button
            onClick={() => handleLaunchQuery('')}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.65rem',
              fontSize: '0.8rem',
              backgroundColor: 'var(--accent-cyan)',
              color: '#07090d',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
            }}
          >
            <MessageSquare size={14} />
            <span>Open Full AI Assistant</span>
          </button>
        </div>
      )}

      {/* Floating Pill Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.75rem 1.15rem',
          borderRadius: '999px',
          backgroundColor: '#0a0f18',
          border: '1px solid rgba(0, 240, 255, 0.45)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 240, 255, 0.25)',
          color: '#ffffff',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.86rem',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = 'var(--accent-cyan)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 240, 255, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.45)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 240, 255, 0.25)';
        }}
      >
        <Sparkles size={16} color="var(--accent-cyan)" />
        <span>Ask AutoVerse AI</span>
        {currentCarName && (
          <span
            style={{
              fontSize: '0.68rem',
              padding: '0.15rem 0.45rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(0, 240, 255, 0.15)',
              color: 'var(--accent-cyan)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
            }}
          >
            {currentCarName.split(' ')[0]}
          </span>
        )}
      </button>
    </div>
  );
};

const chipStyle: React.CSSProperties = {
  padding: '0.6rem 0.85rem',
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid var(--border-medium)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '0.8rem',
  textAlign: 'left',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.5rem',
  transition: 'all 0.15s ease',
};

const chipHover = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.08)';
  e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.35)';
};

const chipUnhover = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
  e.currentTarget.style.borderColor = 'var(--border-medium)';
};
