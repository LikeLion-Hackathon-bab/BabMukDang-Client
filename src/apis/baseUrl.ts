const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '')
const trimSlashes = (value: string): string => value.replace(/^\/+|\/+$/g, '')

const API_PREFIX = trimSlashes(import.meta.env.VITE_BASE_API_URL || '/api/v1')

const appendApiPrefix = (origin: string): string => {
    const normalized = trimTrailingSlash(origin)
    const prefix = `/${API_PREFIX}`

    if (!normalized) {
        return prefix
    }

    return normalized.endsWith(prefix) ? normalized : `${normalized}${prefix}`
}

export const BACKEND_ORIGIN = trimTrailingSlash(import.meta.env.VITE_SERVER_URL || '')
export const API_BASE_URL = appendApiPrefix(BACKEND_ORIGIN)
