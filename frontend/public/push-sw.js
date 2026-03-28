/* global self, clients */
// M9-T10: Web Push — tập tin tĩnh, không bundle qua Next.

self.addEventListener("push", (event) => {
  let data = {}
  try {
    if (event.data) data = JSON.parse(event.data.text())
  } catch {
    /* ignore */
  }
  const title = typeof data.title === "string" ? data.title : "Thông báo"
  const body = typeof data.body === "string" ? data.body : ""
  const url = typeof data.url === "string" ? data.url : "/user/notifications"
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      data: { url },
      icon: "/placeholder.svg",
      badge: "/placeholder.svg",
    }),
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url
  if (!url) return
  const href = new URL(url, self.location.origin).href
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const c of windowClients) {
        if (c.url.startsWith(self.location.origin) && "focus" in c) return c.focus()
      }
      if (clients.openWindow) return clients.openWindow(href)
    }),
  )
})
