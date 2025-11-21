import { CardChoice, NextButton, SearchInput } from '@/components'
import { useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Menu } from '@kimdaegyu/babmukdang-shared'
export function AllergicMenuPage() {
    const navigate = useNavigate()
    const options: Menu[] = useMemo(
        () => [
            { code: 'korean', label: '한식' },
            { code: 'chinese', label: '중식' },
            { code: 'japanese', label: '일식' },
            { code: 'western', label: '양식' },
            { code: 'snack', label: '분식' },
            { code: 'chicken', label: '치킨' },
            { code: 'pizza', label: '피자' },
            { code: 'burger', label: '버거' },
            { code: 'dessert', label: '디저트' }
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
                    알레르기나 못먹는 음식이 있다면 <br />
                    골라주세요.
                </h1>
                <p className="text-caption-medium text-gray-5">
                    개수 상관 없이 눌러주세요. <br />더 추가하고 싶은 메뉴가
                    있다면 텍스트로 입력해주세요.
                </p>
            </div>

            <div className="grid grid-cols-3 justify-items-center gap-12">
                {options.map(option => (
                    <CardChoice
                        key={option.code}
                        label={option.label}
                        selected={selectedKeys.has(option.code)}
                        onToggle={() => toggle(option.code)}
                    />
                ))}
            </div>
            {/* <div className="mb-30">
                <SearchInput
                    handleSearch={() => {}}
                    placeholder="직접 입력하기"
                />
            </div> */}
            <NextButton onClick={() => navigate('/finish-register')} />
        </div>
    )
}
