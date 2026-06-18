import type { Food } from '@kimdaegyu/babmukdang-shared/domain'

type OnboardingMenuOption = Food & {
    key: string
}

const toFood = (code: string, label: string): OnboardingMenuOption =>
    ({ key: code, code, label }) as OnboardingMenuOption

export const ONBOARDING_MENU_OPTIONS: OnboardingMenuOption[] = [
    toFood('korean', '한식'),
    toFood('chinese', '중식'),
    toFood('japanese', '일식'),
    toFood('western', '양식'),
    toFood('snack', '분식'),
    toFood('chicken', '치킨'),
    toFood('pizza', '피자'),
    toFood('burger', '버거'),
    toFood('dessert', '디저트')
]

export const findOnboardingMenuOptions = (keys: Iterable<string>): Food[] => {
    const keySet = new Set(keys)
    return ONBOARDING_MENU_OPTIONS.filter(option => keySet.has(option.key)).map(
        ({ code, label }) => ({ code, label }) as Food
    )
}
