// AutoVerse Stage 23: PWA Service Worker Update Notification
// Prompts users when a new production release is cached and waiting.

import React, { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { EVENT_PWA_UPDATE_AVAILABLE, activateWaitingWorker } from '../../utils/pwaRegister';

export const PWAUpdateNotification: React.FC = () => {
  const [waitingRegistration, setWaitingRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const handleUpdateAvailable = (e: any) => {
      if (e.detail && e.detail.registration) {
        setWaitingRegistration(e.detail.registration);
      }
    };

    window.addEventListener(EVENT_PWA_UPDATE_AVAILABLE, handleUpdateAvailable);
    return () => {
      window.removeEventListener(EVENT_PWA_UPDATE_AVAILABLE, handleUpdateAvailable);
    };
  }, []);

  if (!waitingRegistration) {
    return null;
  }

  const handleUpdate = () => {
    setIsUpdating(true);
    activateWaitingWorker(waitingRegistration);
  };

  return (
    <aside
      aria-label="New Version Notification"
      role="status"
      style={{
        position: 'fixed',
        top: '4.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        backgroundColor: '#0f172a',
        border: '1px solid rgba(59, 130, 246, 0.4)',
        borderRadius: '12px',
        padding: '0.65rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
        color: '#f8fafc',
        fontSize: '0.85rem',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#60a5fa', fontWeight: 600 }}>
        <RefreshCw size={15} className={isUpdating ? 'spin' : ''} />
        <span>New AutoVerse Version Available</span>
      </div>

      <button
        onClick={handleUpdate}
        disabled={isUpdating}
        style={{
          backgroundColor: '#2563eb',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          padding: '0.35rem 0.75rem',
          fontSize: '0.78rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {isUpdating ? 'Updating...' : 'Refresh to Update'}
      </button>

      <button
        onClick={() => setWaitingRegistration(null)}
        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.2rem' }}
        aria-label="Dismiss update banner"
      >
        <X size={14} />
      </button>
    </aside>
  );
};
