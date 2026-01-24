export async function subscribeToNotifications() {
  console.log('subscribeToNotifications called');
  // In a real app, you'd have service worker and push API logic here
  return Promise.resolve();
}

export async function unsubscribeFromNotifications() {
  console.log('unsubscribeFromNotifications called');
  // In a real app, you'd have service worker and push API logic here
  return Promise.resolve();
}

export async function isSubscribed() {
  console.log('isSubscribed called');
  // In a real app, you'd have service worker and push API logic here
  return Promise.resolve(false);
}
