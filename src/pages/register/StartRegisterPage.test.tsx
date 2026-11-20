import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
    search: '',
    navigate: vi.fn(),
    kakaoLogin: vi.fn()
}))

vi.mock('@/navigation', () => ({
    useNavigate: () => mocks.navigate,
    useSearchParams: () => [new URLSearchParams(mocks.search)],
    resolvePathToActivity: (path: string) =>
        path.startsWith('/meal-plan-links/') ? {} : null
}))
vi.mock('@/apis/auth.api', () => ({
    useKakaoLogin: () => ({ mutate: mocks.kakaoLogin, isPending: false }),
    useEmailLogin: () => ({ mutate: vi.fn(), isPending: false }),
    useEmailSignup: () => ({ mutate: vi.fn(), isPending: false })
}))

import { StartRegisterPage } from './StartRegisterPage'
;(
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: Root

const renderPage = () => {
    act(() => {
        root.render(<StartRegisterPage />)
    })
}

const clickKakaoLogin = () => {
    const button = Array.from(container.querySelectorAll('button')).find(
        element => element.textContent?.includes('카카오톡으로 시작하기')
    )
    act(() => {
        button?.click()
    })
}

describe('StartRegisterPage kakao login', () => {
    beforeEach(() => {
        mocks.search = ''
        mocks.kakaoLogin.mockClear()
        container = document.createElement('div')
        document.body.appendChild(container)
        root = createRoot(container)
    })

    afterEach(() => {
        act(() => root.unmount())
        container.remove()
    })

    it.each([
        ['kakao_denied', '카카오 로그인 동의가 취소되었어요'],
        ['invalid_state', '로그인 요청이 만료되었거나'],
        ['kakao_failed', '카카오 로그인 중 문제가 생겼어요']
    ])('shows a message for ?error=%s', (code, message) => {
        mocks.search = `error=${code}`
        renderPage()
        expect(container.textContent).toContain(message)
    })

    it('shows nothing for unknown error codes', () => {
        mocks.search = 'error=boom'
        renderPage()
        expect(container.querySelector('p.text-red-500')).toBeNull()
    })

    it('passes a safe relative redirect to kakao login', () => {
        mocks.search = 'redirect=%2Fmeal-plan-links%2Ftoken%2Fjoin'
        renderPage()
        clickKakaoLogin()
        expect(mocks.kakaoLogin).toHaveBeenCalledWith(
            '/meal-plan-links/token/join'
        )
    })

    it.each([
        '%2F%2Fevil.com%2Fmeal-plan-links%2Ftoken%2Fjoin',
        'https%3A%2F%2Fevil.com%2Fmeal-plan-links%2Ftoken%2Fjoin'
    ])('falls back to / for unsafe redirect %s', redirect => {
        mocks.search = `redirect=${redirect}`
        renderPage()
        clickKakaoLogin()
        expect(mocks.kakaoLogin).toHaveBeenCalledWith('/')
    })
})
