import { CardBobGraphic } from '@/assets/graphics'
import { KakaoIcon, LogoTextIcon } from '@/assets/icons'
import SplashImg from '@/assets/images/SplashImg.png'
import { login, useEmailLogin, useEmailSignup } from '@/apis'
import { useAuthStore } from '@/store'
import { useNavigate } from 'react-router-dom'
import { mockTokenResponse } from '@/mocks/fixtures'
import { useState } from 'react'

/**
 * 개발 환경에서 Mock 로그인 수행
 * fixture 데이터를 사용하여 즉시 로그인 처리
 */
function useMockLogin() {
    const { setTokens } = useAuthStore()

    const mockLogin = () => {
        console.log('[Mock] 개발 환경 로그인 - fixture 데이터 사용')
        setTokens({
            accessToken: mockTokenResponse.accessToken
        })
    }

    return mockLogin
}

export function StartRegisterPage() {
    const isDev = false
    const mockLogin = useMockLogin()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [authError, setAuthError] = useState<string | null>(null)

    const { mutate: emailLogin, isPending: isEmailLoginPending } =
        useEmailLogin({
            onSuccess: () => {
                setAuthError(null)
                navigate('/', { replace: true })
            },
            onError: error => {
                setAuthError(error.message)
            }
        })

    const { mutate: emailSignup, isPending: isEmailSignupPending } =
        useEmailSignup({
            onSuccess: () => {
                setAuthError(null)
                navigate('/', { replace: true })
            },
            onError: error => {
                setAuthError(error.message)
            }
        })

    const handleLogin = () => {
        if (isDev) {
            mockLogin()
        } else {
            login()
        }
    }

    const handleEmailLogin = () => {
        setAuthError(null)
        emailLogin({ email, password })
    }

    const handleEmailSignup = () => {
        setAuthError(null)
        emailSignup({ email, password })
    }

    const isEmailAuthPending = isEmailLoginPending || isEmailSignupPending

    return (
        <div className="fixed inset-0 z-2000 flex h-screen w-screen flex-col items-center justify-center">
            {/* 딤드 배경 */}
            <div className="absolute inset-0 bg-[#1F1F1F]/40 backdrop-blur-[2px]" />
            <img
                src={SplashImg}
                alt="start-register"
                className="h-full w-full object-cover"
            />
            <div className="absolute flex h-full w-full flex-col items-center justify-between px-20 pb-123">
                <div></div>
                <div className="flex flex-col items-center gap-12">
                    <div className="rounded-8 bg-primary-500 flex h-100 w-100 items-center justify-center">
                        <CardBobGraphic />
                    </div>
                    <LogoTextIcon fillcolor="#fff" />
                </div>
                <div className="flex w-full flex-col items-center gap-20">
                    <div className="flex w-full flex-col gap-10 rounded-24 bg-white/90 p-16 backdrop-blur-sm">
                        <input
                            type="email"
                            value={email}
                            onChange={event => setEmail(event.target.value)}
                            placeholder="이메일"
                            autoComplete="email"
                            className="text-body2-medium text-gray-8 placeholder:text-gray-4 rounded-12 border border-gray-2 bg-white px-14 py-12 outline-none focus:border-primary-500"
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={event => setPassword(event.target.value)}
                            placeholder="비밀번호"
                            autoComplete="current-password"
                            className="text-body2-medium text-gray-8 placeholder:text-gray-4 rounded-12 border border-gray-2 bg-white px-14 py-12 outline-none focus:border-primary-500"
                        />
                        {authError && (
                            <p className="text-caption-medium text-red-500">
                                {authError}
                            </p>
                        )}
                        <div className="grid grid-cols-2 gap-8">
                            <button
                                type="button"
                                disabled={isEmailAuthPending}
                                onClick={handleEmailLogin}
                                className="bg-primary-500 text-body2-semibold rounded-full py-12 text-white disabled:opacity-50">
                                이메일 로그인
                            </button>
                            <button
                                type="button"
                                disabled={isEmailAuthPending}
                                onClick={handleEmailSignup}
                                className="text-primary-500 border-primary-500 text-body2-semibold rounded-full border py-12 disabled:opacity-50">
                                회원가입
                            </button>
                        </div>
                    </div>
                    <KakaoLoginButton handleLogin={handleLogin} />
                    <span className="text-caption-medium text-primary-100">
                        {isDev
                            ? '🧪 개발 모드 - Mock 로그인'
                            : '로그인 후 식사 취향 테스트를 완료해주세요'}
                    </span>
                </div>
            </div>
        </div>
    )
}

function KakaoLoginButton({
    className,
    handleLogin
}: {
    className?: string
    handleLogin: () => void
}) {
    return (
        <button
            type="button"
            onClick={handleLogin}
            className={`flex w-full cursor-pointer items-center justify-center gap-12 rounded-full bg-[#FEDC2C] py-14 pr-16 pl-17 ${className ?? ''}`}>
            <KakaoIcon />
            <span className="text-body1-semibold text-gray-8">
                카카오톡으로 시작하기
            </span>
        </button>
    )
}
