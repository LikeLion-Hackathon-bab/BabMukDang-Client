import { CardBobGraphic } from '@/assets/graphics'
import { KakaoIcon, LogoTextIcon } from '@/assets/icons'
import SplashImg from '@/assets/images/SplashImg.png'
import { login } from '@/apis'
import { useAuthStore } from '@/store'
import { useNavigate } from 'react-router-dom'
import { mockTokenResponse } from '@/mocks/fixtures'

/**
 * 개발 환경에서 Mock 로그인 수행
 * fixture 데이터를 사용하여 즉시 로그인 처리
 */
function useMockLogin() {
    const navigate = useNavigate()
    const { setTokens } = useAuthStore()

    const mockLogin = () => {
        console.log('[Mock] 개발 환경 로그인 - fixture 데이터 사용')
        setTokens({
            accessToken: mockTokenResponse.accessToken,
            refreshToken: mockTokenResponse.refreshToken
        })
        navigate('/', { replace: true })
    }

    return mockLogin
}

export function StartRegisterPage() {
    const isDev = import.meta.env.MODE === 'development'
    const mockLogin = useMockLogin()

    const handleLogin = () => {
        if (isDev) {
            mockLogin()
        } else {
            login()
        }
    }

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
