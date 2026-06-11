const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '')

const appendApiPrefix = (origin: string): string => {
    const normalized = trimTrailingSlash(origin)
    return normalized.endsWith('/api/v1') ? normalized : `${normalized}/api/v1`
}

export const BACKEND_ORIGIN = trimTrailingSlash(import.meta.env.VITE_SERVER_URL)
export const API_BASE_URL = appendApiPrefix(BACKEND_ORIGIN)
