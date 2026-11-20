import { useNavigate } from '@/navigation'
import { useMemo, useState } from 'react'
import { CardChoice, NextButton } from '@/components'
import {
    findOnboardingMenuOptions,
    ONBOARDING_MENU_OPTIONS
} from '@/constants/onboardingMenuOptions'
import { useOnboardingStore } from '@/store'
import { onboardingFlowController } from '@/features/onboarding'

export function PreferMenuPage() {
    const navigate = useNavigate()
    const { liked, setLikedFoods } = useOnboardingStore()
    const initialSelectedKeys = useMemo(
        () => new Set(liked.map(item => String(item.code))),
        [liked]
    )
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
        initialSelectedKeys
    )

    const toggle = (key: string) => {
        setSelectedKeys(prev => {
            const next = new Set(prev)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
    }

    const goNext = () => {
        setLikedFoods(findOnboardingMenuOptions(selectedKeys))
        navigate(onboardingFlowController.nextPathFrom('PREFER_MENU'))
    }

    return (
        <div className="flex h-full w-full flex-col justify-between">
            <div className="flex flex-col gap-12 pt-24">
                <h1 className="text-title2-semibold text-gray-8">
                    좋아하는 메뉴와 테마를 골라주세요.
                </h1>
                <p className="text-caption-medium text-gray-5">
                    중복 선택 가능해요.
                    <br />더 추가하고 싶은 메뉴가 있다면 텍스트로 입력해주세요.
                </p>
            </div>

            <div className="grid grid-cols-3 justify-items-center gap-12">
                {ONBOARDING_MENU_OPTIONS.map(option => (
                    <CardChoice
                        key={option.key}
                        label={option.label}
                        selected={selectedKeys.has(option.key)}
                        onToggle={() => toggle(option.key)}
                    />
                ))}
            </div>

            <NextButton onClick={goNext} />
        </div>
    )
}
