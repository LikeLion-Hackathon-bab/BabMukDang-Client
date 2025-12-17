import { CardBobGraphic } from '@/assets/graphics'
import { KakaoIcon, LogoTextIcon } from '@/assets/icons'
import SplashImg from '@/assets/images/SplashImg.png'
import { login } from '@/apis'

export function StartRegisterPage() {
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
                    <KakaoLoginButton />
                    <span className="text-caption-medium text-primary-100">
                        로그인 후 식사 취향 테스트를 완료해주세요
                    </span>
                </div>
            </div>
        </div>
    )
}

function KakaoLoginButton({ className }: { className?: string }) {
    const handleLogin = () => {
        login()
    }

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
