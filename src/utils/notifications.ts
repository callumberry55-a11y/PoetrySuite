import { supabase } from '../lib/supabase';

interface NotificationOptions {
  userId?: string;
  title: string;
  body: string;
  data?: {
    url?: string;
    [key: string]: any;
  };
  tag?: string;
  requireInteraction?: boolean;
}

export async function sendPushNotification(options: NotificationOptions) {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      console.error('No active session for sending push notification');
      return { success: false, error: 'Not authenticated' };
    }

    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-push-notification`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send notification');
    }

    const result = await response.json();
    return { success: true, ...result };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function notifyPoemComment(poemAuthorId: string, commenterName: string, poemTitle: string) {
  return sendPushNotification({
    userId: poemAuthorId,
    title: 'New Comment',
    body: `${commenterName} commented on your poem "${poemTitle}"`,
    data: {
      url: '/library',
      type: 'comment',
    },
    tag: 'comment',
  });
}

export async function notifyPoemReaction(poemAuthorId: string, reactorName: string, poemTitle: string) {
  return sendPushNotification({
    userId: poemAuthorId,
    title: 'New Reaction',
    body: `${reactorName} liked your poem "${poemTitle}"`,
    data: {
      url: '/library',
      type: 'reaction',
    },
    tag: 'reaction',
  });
}

export async function notifySubmissionUpdate(userId: string, status: string, poemTitle: string) {
  return sendPushNotification({
    userId,
    title: 'Submission Update',
    body: `Your poem "${poemTitle}" has been ${status}`,
    data: {
      url: '/submissions',
      type: 'submission',
    },
    tag: 'submission',
    requireInteraction: true,
  });
}
