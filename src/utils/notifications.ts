export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

export function sendNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === 'granted') {
    new Notification(title, options);
  }
}

export async function subscribeToNotifications(): Promise<void> {
  await requestNotificationPermission();
  localStorage.setItem('notifications_subscribed', 'true');
}

export async function unsubscribeFromNotifications(): Promise<void> {
  localStorage.setItem('notifications_subscribed', 'false');
}

export function isSubscribed(): boolean {
  return localStorage.getItem('notifications_subscribed') === 'true';
}
