// AutoVerse Stage 23: PWA App Installation Detection & Workflow Hook
// Detects native beforeinstallprompt, standalone display-mode, and iOS Add-to-Home-Screen guidance.

import { useState, useEffect, useCallback } from 'react';

const DISMISSAL_KEY = 'autoverse_install_dismissed_until';
const DISMISSAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days quiet period

export interface PWAInstallState {
  isInstallable: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  isDismissed: boolean;
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unsupported'>;
  dismissPrompt: () => void;
}

export function usePWAInstall(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check if running in standalone PWA window
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener?.('change', checkStandalone);

    // 2. Check if iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isAppleDevice);

    // 3. Check dismissal memory
    const dismissedUntil = localStorage.getItem(DISMISSAL_KEY);
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      setIsDismissed(true);
    }

    // 4. Capture native beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      mediaQuery.removeEventListener?.('change', checkStandalone);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unsupported'> => {
    if (!deferredPrompt) {
      return 'unsupported';
    }

    try {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (choiceResult.outcome === 'accepted') {
        return 'accepted';
      }
      return 'dismissed';
    } catch (err) {
      console.warn('[AutoVerse PWA] Install prompt error:', err);
      return 'unsupported';
    }
  }, [deferredPrompt]);

  const dismissPrompt = useCallback(() => {
    setIsDismissed(true);
    localStorage.setItem(DISMISSAL_KEY, (Date.now() + DISMISSAL_DURATION_MS).toString());
  }, []);

  const isInstallable = !isStandalone && !isDismissed && (deferredPrompt !== null || isIOS);

  return {
    isInstallable,
    isStandalone,
    isIOS,
    isDismissed,
    promptInstall,
    dismissPrompt,
  };
}
