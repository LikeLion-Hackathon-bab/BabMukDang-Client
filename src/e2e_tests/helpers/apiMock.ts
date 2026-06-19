import type { Page, Route } from '@playwright/test'
import type {
    ApiFailure,
    ApiSuccess
} from '@kimdaegyu/babmukdang-shared/domain'

export const apiSuccess = <T>(data: T, code = 200): ApiSuccess<T> =>
    ({
        success: true,
        code,
        message: code === 201 ? 'Created' : code === 204 ? 'No Content' : 'OK',
        data
    }) as unknown as ApiSuccess<T>

export const apiError = (
    code: string,
    message: string,
    status = 400
): ApiFailure =>
    ({
        success: false,
        status,
        code,
        message
    }) as ApiFailure

export async function fulfillJson(route: Route, data: unknown, status = 200) {
    await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(data)
    })
}

export async function fulfillNoContent(route: Route) {
    await route.fulfill({ status: 204, body: '' })
}

export async function installEventSourceNoop(page: Page) {
    await page.addInitScript(() => {
        class NoopEventSource extends EventTarget {
            static readonly CONNECTING = 0
            static readonly OPEN = 1
            static readonly CLOSED = 2

            readonly CONNECTING = 0
            readonly OPEN = 1
            readonly CLOSED = 2
            readonly readyState = 1
            readonly url: string
            readonly withCredentials: boolean
            onopen: ((event: Event) => void) | null = null
            onmessage: ((event: MessageEvent) => void) | null = null
            onerror: ((event: Event) => void) | null = null

            constructor(url: string, init?: EventSourceInit) {
                super()
                this.url = url
                this.withCredentials = Boolean(init?.withCredentials)
                window.setTimeout(() => {
                    const event = new Event('open')
                    this.onopen?.(event)
                    this.dispatchEvent(event)
                }, 0)
            }

            close() {
                return undefined
            }
        }

        Object.defineProperty(window, 'EventSource', {
            configurable: true,
            writable: true,
            value: NoopEventSource
        })
    })
}

export async function installCommonIdleApiMocks(page: Page) {
    await page.route('**/api/v1/notifications', async route => {
        await fulfillJson(route, apiSuccess([]))
    })

    await page.route('**/api/v1/articles/home**', async route => {
        await fulfillJson(
            route,
            apiSuccess({
                items: [],
                meta: {
                    page: 0,
                    size: 20,
                    totalItems: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrevious: false
                }
            })
        )
    })

    await page.route('**/api/v1/meal-plans/home-dashboard', async route => {
        await fulfillJson(
            route,
            apiSuccess({
                generatedAt: '2026-06-18T00:00:00.000Z',
                inProgress: [],
                today: [],
                recordNeeded: [],
                pendingJoinRequests: [],
                unreadNotifications: [],
                nextActions: []
            })
        )
    })
}
