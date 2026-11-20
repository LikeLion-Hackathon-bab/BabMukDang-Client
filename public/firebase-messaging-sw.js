/* eslint-disable no-restricted-globals */
const PUSH_SCHEMA_VERSION = '2026-06-17'

const extractPayload = event => {
  try {
    const json = event.data ? event.data.json() : {}
    return json.data || json
  } catch {
    return {}
  }
}

self.addEventListener('push', event => {
  const data = extractPayload(event)
  if (data.schemaVersion !== PUSH_SCHEMA_VERSION) return

  event.waitUntil(
    self.registration.showNotification(data.title || '밥먹당 알림', {
      body: data.body || '',
      tag: data.notificationId,
      data,
      badge: '/favicon.ico',
      icon: '/favicon.ico'
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const deepLink = event.notification.data?.deepLink || '/home'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        client.postMessage({ type: 'BABMUKDANG_PUSH_CLICK', deepLink })
        if ('focus' in client) return client.focus()
      }
      return self.clients.openWindow(deepLink)
    })
  )
})
