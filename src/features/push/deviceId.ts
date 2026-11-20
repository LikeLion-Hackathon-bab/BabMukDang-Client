const DEVICE_ID_KEY = 'babmukdang-device-id'

export const getOrCreateDeviceId = () => {
    const existing = window.localStorage.getItem(DEVICE_ID_KEY)
    if (existing) return existing

    const id =
        globalThis.crypto?.randomUUID?.() ??
        `web-${Date.now()}-${Math.random().toString(16).slice(2)}`
    window.localStorage.setItem(DEVICE_ID_KEY, id)
    return id
}
