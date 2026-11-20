import { describe, expect, it } from 'vitest'
import {
    buildKakaoWebLoginUrl,
    getKakaoLoginErrorMessage,
    sanitizeRedirectPath
} from './loginRedirect'

describe('sanitizeRedirectPath', () => {
    it.each([
        '/meal-plan-links/abc/join',
        '/meal-plans/1/decision?from=push',
        '/'
    ])('keeps same-origin relative path %s', path => {
        expect(sanitizeRedirectPath(path)).toBe(path)
    })

    it.each([
        null,
        undefined,
        '',
        '//evil.com',
        '//evil.com/meal-plan-links/abc/join',
        '/\\evil.com',
        'https://evil.com/home',
        'javascript:alert(1)',
        'home',
        '/\t/evil.com',
        '/\n/evil.com'
    ])('rejects %j', value => {
        expect(sanitizeRedirectPath(value)).toBeNull()
    })
})

describe('getKakaoLoginErrorMessage', () => {
    it.each(['kakao_denied', 'invalid_state', 'kakao_failed'])(
        'maps %s to a Korean message',
        code => {
            expect(getKakaoLoginErrorMessage(code)).toMatch(/[가-힣]/)
        }
    )

    it.each([null, '', 'unknown', 'toString', '__proto__'])(
        'ignores %j',
        code => {
            expect(getKakaoLoginErrorMessage(code)).toBeNull()
        }
    )
})

describe('buildKakaoWebLoginUrl', () => {
    const api = 'https://api.babmukdang.link/api/v1'

    it('passes a relative redirect as an encoded query', () => {
        expect(buildKakaoWebLoginUrl(api, '/meal-plan-links/a b/join')).toBe(
            `${api}/auth/kakao?redirect=%2Fmeal-plan-links%2Fa+b%2Fjoin`
        )
    })

    it('drops unsafe redirects', () => {
        expect(buildKakaoWebLoginUrl(api, '//evil.com')).toBe(
            `${api}/auth/kakao`
        )
        expect(buildKakaoWebLoginUrl(api, 'https://evil.com')).toBe(
            `${api}/auth/kakao`
        )
        expect(buildKakaoWebLoginUrl(api)).toBe(`${api}/auth/kakao`)
    })
})
