const API = process.env.NEXT_PUBLIC_API_URL ?? ""

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i)
  return output
}

export function pushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window
}

/** Huỷ subscription trên trình duyệt (không gọi API). Dùng trước logout. */
export async function unsubscribeLocalPush(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker.getRegistration()
    const sub = await reg?.pushManager.getSubscription()
    await sub?.unsubscribe()
  } catch {
    /* ignore */
  }
}

export async function hasBrowserPushSubscription(): Promise<boolean> {
  if (!pushSupported()) return false
  try {
    const reg = await navigator.serviceWorker.ready
    return (await reg.pushManager.getSubscription()) != null
  } catch {
    return false
  }
}

export async function subscribeWebPush(accessToken: string): Promise<{ ok: boolean; message?: string }> {
  if (!pushSupported()) return { ok: false, message: "Trình duyệt không hỗ trợ Web Push." }

  const vRes = await fetch(`${API}/api/social/push/vapid-public-key`)
  if (!vRes.ok) return { ok: false, message: "Không lấy được cấu hình push từ server." }
  const v = (await vRes.json()) as { configured?: boolean; publicKey?: string }
  if (!v.configured || !v.publicKey) {
    return { ok: false, message: "Server chưa bật Web Push (VAPID). Liên hệ quản trị." }
  }

  const perm = await Notification.requestPermission()
  if (perm !== "granted") {
    return { ok: false, message: "Bạn đã từ chối quyền thông báo. Hãy bật lại trong cài đặt trình duyệt." }
  }

  const reg = await navigator.serviceWorker.register("/push-sw.js")
  await navigator.serviceWorker.ready

  const existing = await reg.pushManager.getSubscription()
  if (existing) {
    const synced = await syncSubscriptionToServer(accessToken, existing)
    return synced ? { ok: true } : { ok: false, message: "Không lưu subscription lên server." }
  }

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(v.publicKey),
  })

  const synced = await syncSubscriptionToServer(accessToken, sub)
  return synced ? { ok: true } : { ok: false, message: "Không lưu subscription lên server." }
}

async function syncSubscriptionToServer(accessToken: string, sub: PushSubscription): Promise<boolean> {
  const j = sub.toJSON()
  if (!j.endpoint || !j.keys?.p256dh || !j.keys?.auth) return false
  const r = await fetch(`${API}/api/social/push/subscribe`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      endpoint: j.endpoint,
      keys: { p256dh: j.keys.p256dh, auth: j.keys.auth },
    }),
  })
  return r.ok
}

export async function unsubscribeWebPush(accessToken: string): Promise<void> {
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  const endpoint = sub?.endpoint
  await sub?.unsubscribe()
  if (!endpoint) return
  await fetch(`${API}/api/social/push/unsubscribe`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ endpoint }),
  })
}
