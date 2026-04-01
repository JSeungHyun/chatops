export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

export function requestNotificationPermission(): void {
  if (!isNotificationSupported()) return;
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export function showNotification(
  title: string,
  options?: NotificationOptions & { roomId?: string },
): void {
  if (!isNotificationSupported()) return;
  if (Notification.permission !== 'granted') return;

  const { roomId, ...notifOptions } = options ?? {};

  const notification = new Notification(title, {
    icon: '/favicon.ico',
    ...notifOptions,
  });

  notification.onclick = () => {
    window.focus();
    if (roomId) {
      // Dispatch a custom event so the React app can navigate without full reload
      window.dispatchEvent(
        new CustomEvent('navigate-to-room', { detail: { roomId } }),
      );
    }
    notification.close();
  };
}
