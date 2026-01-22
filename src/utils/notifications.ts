import { supabase } from '../lib/supabase';

export async function subscribeToNotifications(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications are not supported');
  }

  const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error('Push notification configuration is missing');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission denied');
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const subscriptionJson = subscription.toJSON();
  await supabase.from('push_subscriptions').upsert({
    user_id: user.id,
    endpoint: subscription.endpoint,
    p256dh_key: subscriptionJson.keys?.p256dh || '',
    auth_key: subscriptionJson.keys?.auth || '',
  }, {
    onConflict: 'endpoint',
  });

  return subscription;
}

export async function unsubscribeFromNotifications(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    await subscription.unsubscribe();

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', subscription.endpoint);
    }
  }
}

export async function isSubscribed(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch {
    return false;
  }
}

export async function sendPushNotification(params: {
  userId?: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  tag?: string;
  requireInteraction?: boolean;
}): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  // Validate input to prevent injection attacks
  if (!params.title || typeof params.title !== 'string' || params.title.length > 255) {
    throw new Error('Invalid notification title');
  }
  if (!params.body || typeof params.body !== 'string' || params.body.length > 1000) {
    throw new Error('Invalid notification body');
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('Supabase URL not configured');
  }

  const apiUrl = `${supabaseUrl}/functions/v1/send-push-notification`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    try {
      await response.json();
      // Don't expose detailed error information
      throw new Error('Failed to send notification');
    } catch {
      throw new Error('Failed to send notification');
    }
  }
}

export async function notifyPoemComment(
  poemAuthorId: string,
  commenterName: string,
  poemTitle: string
): Promise<void> {
  await sendPushNotification({
    userId: poemAuthorId,
    title: 'New Comment',
    body: `${commenterName} commented on "${poemTitle}"`,
    data: {
      url: '/library',
      type: 'comment',
    },
    tag: 'comment',
  });
}

export async function notifyPoemReaction(
  poemAuthorId: string,
  reactorName: string,
  poemTitle: string
): Promise<void> {
  await sendPushNotification({
    userId: poemAuthorId,
    title: 'New Reaction',
    body: `${reactorName} reacted to "${poemTitle}"`,
    data: {
      url: '/library',
      type: 'reaction',
    },
    tag: 'reaction',
  });
}

export async function notifySubmissionUpdate(
  userId: string,
  venueName: string,
  status: string
): Promise<void> {
  await sendPushNotification({
    userId,
    title: 'Submission Update',
    body: `Your submission to ${venueName} is now ${status}`,
    data: {
      url: '/submissions',
      type: 'submission',
    },
    tag: 'submission',
    requireInteraction: true,
  });
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}
