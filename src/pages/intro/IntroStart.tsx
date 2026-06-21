import Logo from '@/assets/icons/BMD-Logo.svg'
import intro_text from '@/assets/icons/intro_0.svg'
import { useEffect } from 'react'
import { useNavigate } from '@/navigation'

export const IntroStart = () => {
    const navigate = useNavigate()
    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/intro/tutorial')
        }, 2000)

        return () => clearTimeout(timer)
    }, [navigate])
    return (
        <div className="flex h-screen flex-col items-center justify-center bg-[linear-gradient(180deg,#FF480A_0%,#FFBDA7_100%)]">
            <img
                src={intro_text}
                alt="밥은 먹고 댕기나?"
            />
            <img
                src={Logo}
                alt="BMD Logo"
                className="my-[30px] h-[167px]"
            />

            <h1 className="mb-[16px] text-[49px] font-bold">밥먹댕</h1>
            <p className="text-[16px]">
                가벼운 식사 안부가 따뜻한 한 끼의 약속으로
            </p>
        </div>
    )
}
