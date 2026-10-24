// AutoVerse Stage 23: Offline Mode & Connection Status Banner
// Communicates offline limitations honestly without intrusive blocking.

import React, { useEffect } from 'react';
import { WifiOff, Wifi, X } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export const OfflineBanner: React.FC = () => {
  const { isOnline, wasOffline, clearWasOffline } = useNetworkStatus();

  useEffect(() => {
    if (wasOffline && isOnline) {
      const timer = setTimeout(() => {
        clearWasOffline();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [wasOffline, isOnline, clearWasOffline]);

  // Back online toast
  if (isOnline && wasOffline) {
    return (
      <aside
        aria-label="Connection Status"
        role="status"
        style={{
          position: 'fixed',
          top: '4.5rem',
          right: '1rem',
          zIndex: 9999,
          backgroundColor: 'rgba(16, 185, 129, 0.95)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '0.6rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem',
          fontWeight: 600,
          boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
          backdropFilter: 'blur(8px)',
          animation: 'slideIn 0.3s ease-out',
        }}
      >
        <Wifi size={16} />
        <span>Connection Restored — AutoVerse is back online</span>
        <button
          onClick={clearWasOffline}
          style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '0.2rem', marginLeft: '0.25rem' }}
          aria-label="Dismiss connection restored notification"
        >
          <X size={14} />
        </button>
      </aside>
    );
  }

  // Actively offline banner
  if (!isOnline) {
    return (
      <aside
        aria-label="Offline Mode"
        role="status"
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10000,
          backgroundColor: '#0f172a',
          borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f8fafc',
          padding: '0.65rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          fontSize: '0.82rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          <WifiOff size={13} />
          <span>Offline Mode</span>
        </div>

        <span style={{ color: '#cbd5e1' }}>
          Viewing cached resources. Live test-drive booking, marketplace enquiries, and financing tools require an active internet connection.
        </span>
      </aside>
    );
  }

  return null;
};
