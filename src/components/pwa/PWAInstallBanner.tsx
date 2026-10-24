// AutoVerse Stage 23: PWA Install App Experience Banner
// Native prompt detection, iOS Add-to-Home-Screen guide, and dismissal quiet period.

import React, { useState } from 'react';
import { Download, X, Share, PlusSquare, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isStandalone, isIOS, isDismissed, promptInstall, dismissPrompt } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (!isInstallable || isStandalone || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    setInstalling(true);
    const result = await promptInstall();
    setInstalling(false);
    if (result === 'accepted') {
      dismissPrompt();
    }
  };

  return (
    <>
      <aside
        id="autoverse-pwa-install-banner"
        aria-label="Install AutoVerse Web App"
        style={{
          position: 'fixed',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9990,
          width: 'calc(100% - 2rem)',
          maxWidth: '560px',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          borderRadius: '16px',
          padding: '0.85rem 1.15rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 240, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#05070a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <img src="/icons/icon.svg" alt="AutoVerse Icon" style={{ width: '28px', height: '28px' }} />
          </div>

          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.01em' }}>
              Install AutoVerse App
            </div>
            <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
              Instant home-screen access & smooth offline catalog browsing
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <button
            onClick={handleInstallClick}
            disabled={installing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.55rem 0.95rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <Download size={14} />
            <span>{installing ? 'Opening...' : 'Install'}</span>
          </button>

          <button
            onClick={dismissPrompt}
            aria-label="Dismiss app install banner"
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              padding: '0.4rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
            }}
          >
            <X size={16} />
          </button>
        </div>
      </aside>

      {/* iOS Step-by-Step Installation Modal */}
      {showIOSModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setShowIOSModal(false)}
        >
          <div
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              maxWidth: '420px',
              width: '100%',
              padding: '1.75rem',
              color: '#f8fafc',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Smartphone size={20} color="#38bdf8" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Install on iOS Safari</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Apple iOS requires adding Progressive Web Apps manually via the Safari Share menu:
            </p>

            <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.8, marginBottom: '1.5rem' }}>
              <li>
                Tap the <strong style={{ color: '#38bdf8' }}>Share</strong> button <Share size={14} style={{ verticalAlign: 'middle', margin: '0 2px' }} /> in Safari's toolbar.
              </li>
              <li>Scroll down the actions list and tap <strong style={{ color: '#ffffff' }}>Add to Home Screen</strong> <PlusSquare size={14} style={{ verticalAlign: 'middle', margin: '0 2px' }} />.</li>
              <li>Confirm by tapping <strong style={{ color: '#34d399' }}>Add</strong> in the top-right corner.</li>
            </ol>

            <button
              onClick={() => {
                setShowIOSModal(false);
                dismissPrompt();
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
