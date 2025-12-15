import Intro_1 from '@/assets/images/Intro-1.png'
import Intro_2 from '@/assets/images/Intro-2.png'
import Intro_3 from '@/assets/images/Intro-3.png'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const tutorialData = [
    {
        id: 1,
        image: Intro_1,
        title: '밥은 먹고 다니니?',
        description: '오늘 밥은 챙겨 먹었는지, 가볍게 안부를 나눠요'
    },
    {
        id: 2,
        image: Intro_2,
        title: '공개 모집 밥 초대',
        description: '함께 밥 한 끼 할 친구를 찾아요'
    },
    {
        id: 3,
        image: Intro_3,
        title: '편리한 약속 잡기 AI',
        description: '의사결정에 도움을 주고 약속 전의 피로도를 줄여줘요'
    }
]

export const IntroTutorial = () => {
    const [step, setStep] = useState(0)
    const navigate = useNavigate()

    const handleNext = () => {
        if (step < tutorialData.length - 1) {
            setStep(prev => prev + 1)
        } else {
            navigate('/')
        }
    }

    const current = tutorialData[step]
    return (
        <div className="relative flex h-screen flex-col items-center justify-center bg-[linear-gradient(180deg,rgba(255,109,59,0)_0%,rgba(255,109,59,0.7)_100%)]">
            <img
                src={current.image}
                alt={current.title}
                className="w-[80%] max-w-[320px] object-contain object-center"
            />
            <div className="absolute bottom-0 flex h-[260px] w-full flex-col items-center bg-white px-[20px] pt-[19px] text-center">
                <div className="mb-[35px] flex gap-[13px]">
                    {tutorialData.map((item, index) => (
                        <p
                            key={item.id}
                            className={`h-[9px] w-[9px] rounded-full ${
                                index === step ? 'bg-[#FF6D3B]' : 'bg-[#D9D9D9]'
                            }`}
                        />
                    ))}
                </div>
                <div>
                    <p className="text-[16px] text-[#5B5B5B]">
                        {current.description}
                    </p>
                    <h4 className="text-[32px] font-bold">{current.title}</h4>
                </div>
                <button
                    className="mt-[36px] w-full rounded-[30.5px] bg-[#FF6D3B] py-[14px] text-[20px] font-semibold text-[#FFFFFF]"
                    onClick={handleNext}>
                    다음
                </button>
            </div>
        </div>
    )
}
