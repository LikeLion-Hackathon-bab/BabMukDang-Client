import { cn } from '@/lib'
import { useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { CardChoice, NextButton, SearchInput } from '@/components'

type MenuOption = {
    key: string
    label: string
}
export function PreferMenuPage() {
    const navigate = useNavigate()
    const options: MenuOption[] = useMemo(
        () => [
            { key: 'korean', label: '한식' },
            { key: 'chinese', label: '중식' },
            { key: 'japanese', label: '일식' },
            { key: 'western', label: '양식' },
            { key: 'snack', label: '분식' },
            { key: 'chicken', label: '치킨' },
            { key: 'pizza', label: '피자' },
            { key: 'burger', label: '버거' },
            { key: 'dessert', label: '디저트' }
        ],
        []
    )
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())

    const toggle = (key: string) => {
        setSelectedKeys(prev => {
            const next = new Set(prev)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
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
                {options.map(option => (
                    <CardChoice
                        key={option.key}
                        label={option.label}
                        selected={selectedKeys.has(option.key)}
                        onToggle={() => toggle(option.key)}
                    />
                ))}
            </div>

            {/* <div className="mb-30">
                <SearchInput
                    handleSearch={() => {}}
                    placeholder="직접 입력하기"
                />
            </div> */}
            <NextButton onClick={() => navigate('/allergic-menu')} />
        </div>
    )
}
