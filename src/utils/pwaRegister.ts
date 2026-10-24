// AutoVerse Stage 23: Service Worker Registration & Lifecycle Manager
// Handles safe registration, update detection, and user-prompted reload.

export const EVENT_PWA_UPDATE_AVAILABLE = 'autoverse:pwa-update-available';

export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // If an updated worker is already waiting, alert UI
        if (registration.waiting) {
          window.dispatchEvent(
            new CustomEvent(EVENT_PWA_UPDATE_AVAILABLE, {
              detail: { registration },
            })
          );
        }

        // Listen for new workers being installed
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (
                installingWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                // New content available, dispatch update event
                window.dispatchEvent(
                  new CustomEvent(EVENT_PWA_UPDATE_AVAILABLE, {
                    detail: { registration },
                  })
                );
              }
            });
          }
        });
      })
      .catch((error) => {
        console.warn('[AutoVerse SW] Registration skipped or failed:', error);
      });

    // Reload page once new service worker takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}

export function activateWaitingWorker(registration: ServiceWorkerRegistration): void {
  if (registration && registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}
