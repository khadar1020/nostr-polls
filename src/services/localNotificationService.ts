import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const IS_ANDROID = Capacitor.getPlatform() === 'android';

export async function initLocalNotifications(): Promise<boolean> {
  if (!IS_ANDROID) return false;
  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (e) { console.warn('[LocalNotif] requestPermissions error:', e); return false; }
}

export type NotifExtra =
  | { target: 'notifications' }
  | { target: 'messages'; npub?: string }
  | { target: 'respond'; nevent: string }
  | { target: 'note'; nevent: string };

// Debounce bursts into one notification per ID
const timers: Record<number, ReturnType<typeof setTimeout>> = {};

export function fireNotification(id: number, title: string, body: string, extra?: NotifExtra): void {
  if (!IS_ANDROID) return;
  if (timers[id]) clearTimeout(timers[id]);
  timers[id] = setTimeout(async () => {
    try {
      await LocalNotifications.schedule({
        notifications: [{ id, title, body, smallIcon: 'ic_notification', extra }],
      });
    } catch (e) { console.warn('[LocalNotif] schedule error:', e); }
  }, 2000);
}
