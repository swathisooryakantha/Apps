export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission(): NotificationPermission | null {
  return notificationsSupported() ? Notification.permission : null
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied'
  return Notification.requestPermission()
}

function notifiedKey(tag: string): string {
  return `notified:${tag}`
}

export function hasNotified(tag: string): boolean {
  return localStorage.getItem(notifiedKey(tag)) === '1'
}

export function markNotified(tag: string): void {
  localStorage.setItem(notifiedKey(tag), '1')
}

export function sendNotification(title: string, body: string, tag: string): void {
  if (!notificationsSupported() || Notification.permission !== 'granted') return
  new Notification(title, { body, tag, icon: '/icon-192.png' })
}
