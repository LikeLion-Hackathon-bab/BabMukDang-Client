import {
    ChallengeDay0,
    ChallengeDay1,
    ChallengeDay2,
    ChallengeDay3,
    ChallengeDay4,
    ChallengeDay5,
    ChallengeDay6,
    ChallengeDay7,
    RandomCouponGraphic
} from '@/assets/graphics'
import { MutalButton } from '@/components'
import { useHeaderStore } from '@/store'
import { useEffect, useState } from 'react'

export function ChallengePage() {
    const { setTitle, resetHeader } = useHeaderStore()
    useEffect(() => {
        setTitle('챌린지')
        return () => {
            resetHeader()
        }
    }, [])
    const [currentDay, setCurrentDay] = useState(1)
    const challengDays: Record<number, React.ReactNode> = {
        0: <ChallengeDay0 className="h-full w-full max-w-800" />,
        1: <ChallengeDay1 className="h-full w-full max-w-800" />,
        2: <ChallengeDay2 className="h-full w-full max-w-800" />,
        3: <ChallengeDay3 className="h-full w-full max-w-800" />,
        4: <ChallengeDay4 className="h-full w-full max-w-800" />,
        5: <ChallengeDay5 className="h-full w-full max-w-800" />,
        6: <ChallengeDay6 className="h-full w-full max-w-800" />,
        7: <ChallengeDay7 className="h-full w-full max-w-800" />
    }
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentDay(prev => (prev + 1) % 8)
        }, 1000)
        return () => clearInterval(interval)
    }, [])
    return (
        <div className="flex h-full flex-col items-start justify-between pt-28 pb-24">
            <ChallengeHeader />
            <div className="flex w-full flex-col items-center justify-center">
                {challengDays[currentDay]}
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-20">
                <MutalButton
                    text="밥 인증하러 가기"
                    onClick={() => {}}
                    hasArrow={true}
                />
                {/* 챌린지 완료 박스 */}
                {currentDay === 7 && <ChallengeCompleteBox />}
            </div>
        </div>
    )
}
const ChallengeHeader = () => {
    return (
        <span className="text-title2-semibold">
            <span className="text-primary-main">밥 인증 챌린지</span>
            <span className="text-black">
                를 완료하고
                <br />
                쿠폰 받아가세요!
            </span>
        </span>
    )
}

const ChallengeCompleteBox = () => {
    return (
        <div className="rounded-12 shadow-drop-1 flex w-full items-center justify-between gap-20 bg-white px-18 py-23">
            <RandomCouponGraphic className="h-96 w-122" />
            <div className="flex flex-grow flex-col items-center justify-center gap-8">
                <span className="text-body2-medium text-gray-8 text-center">
                    이번주 챌린지 목표를
                    <br />
                    달성했어요!
                </span>
                <button className="bg-gray-1 flex w-full items-center justify-center py-5">
                    쿠폰 받기
                </button>
            </div>
        </div>
    )
}
