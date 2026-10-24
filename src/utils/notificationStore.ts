// AutoVerse In-App Automotive Notification Dispatcher
// Manages verified system notifications, test-drive status changes, and vehicle alerts.

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: 'test_drive' | 'safety' | 'order' | 'system';
  referenceId?: string; // e.g. bookingReference
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

const STORAGE_KEY = 'autoverse_notifications_v20';

export function getNotifications(userId: string): InAppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const all: InAppNotification[] = JSON.parse(raw);
    return all
      .filter((n) => n.userId === userId || n.userId === 'all')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export function createNotification(notification: Omit<InAppNotification, 'id' | 'createdAt' | 'read'>): InAppNotification {
  const newNotif: InAppNotification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    read: false,
    createdAt: new Date().toISOString(),
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: InAppNotification[] = raw ? JSON.parse(raw) : [];
    all.unshift(newNotif);
    // Keep max 100 notifications
    if (all.length > 100) all.length = 100;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('autoverse_notifications_updated', { detail: newNotif }));
  } catch (err) {
    console.error('Failed to save in-app notification', err);
  }

  return newNotif;
}

export function markNotificationAsRead(id: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const all: InAppNotification[] = JSON.parse(raw);
    const updated = all.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('autoverse_notifications_updated'));
  } catch (err) {
    console.error('Failed to mark notification read', err);
  }
}

export function markAllNotificationsAsRead(userId: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const all: InAppNotification[] = JSON.parse(raw);
    const updated = all.map((n) => (n.userId === userId || n.userId === 'all' ? { ...n, read: true } : n));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('autoverse_notifications_updated'));
  } catch (err) {
    console.error('Failed to mark all notifications read', err);
  }
}
