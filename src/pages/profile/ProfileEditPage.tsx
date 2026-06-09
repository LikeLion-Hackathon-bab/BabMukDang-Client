import { ModifyIcon } from '@/assets/icons'
import { GoodBadChip } from '@/components'
import { useHeaderStore } from '@/store'
import { useEffect, useMemo, useState } from 'react'

type ChipVariant = 'good' | 'bad'

function TagInput({
    id,
    value,
    onChange,
    variant
}: {
    id: string
    value: string
    onChange: (val: string) => void
    variant: ChipVariant
}) {
    const splitBySpace = useMemo(
        () => (str: string) =>
            str
                .split(' ')
                .map(s => s.trim())
                .filter(s => s.length > 0),
        []
    )

    const chips = splitBySpace(value)

    return (
        <div
            className="rounded-12 border-gray-2 flex min-h-80 flex-col gap-10 border bg-white p-12"
            onClick={() => {
                const input = document.getElementById(id)
                if (input) (input as HTMLInputElement).focus()
            }}>
            <div className="flex flex-wrap items-center gap-10">
                {chips.map((item, idx) => (
                    <GoodBadChip
                        key={`${item}-${idx}`}
                        text={item}
                        isGood={variant === 'good'}
                    />
                ))}
            </div>
            <input
                id={id}
                type="text"
                value={value.endsWith(' ') ? '' : value.split(' ').pop() || ''}
                onChange={e => {
                    const inputValue = e.target.value
                    if (value.endsWith(' ')) {
                        onChange(value + inputValue)
                    } else {
                        const arr = value.split(' ')
                        arr[arr.length - 1] = inputValue
                        onChange(arr.join(' '))
                    }
                }}
                onKeyDown={e => {
                    if (e.key === ' ') {
                        if (!value.endsWith(' ')) {
                            onChange(value + ' ')
                            e.preventDefault()
                        }
                    } else if (e.key === 'Backspace') {
                        if (
                            (value.endsWith(' ') || value === '') &&
                            chips.length > 0
                        ) {
                            const next = [...chips]
                            next.pop()
                            onChange(
                                next.join(' ') + (next.length > 0 ? ' ' : '')
                            )
                            e.preventDefault()
                        }
                    }
                }}
                className="text-body2-medium min-w-60 flex-1 border-none bg-transparent p-0 outline-none"
                placeholder="띄워쓰기로 구분"
            />
        </div>
    )
}

export function ProfileEditPage() {
    const [name, setName] = useState('')
    const [bio, setBio] = useState('')
    const [favoriteFoods, setFavoriteFoods] = useState('')
    const [dislikedFoods, setDislikedFoods] = useState('')
    const [allergies, setAllergies] = useState('')
    const { setTitle, resetHeader, setRightElement } = useHeaderStore()

    useEffect(() => {
        setTitle('내 정보 수정')
        setRightElement(
            <button className="text-body1-semibold text-gray-8">저장</button>
        )
        return () => {
            resetHeader()
        }
    }, [])

    return (
        <div className="flex w-346 flex-col gap-30 pt-20">
            {/* 프로필 이미지 + 수정 아이콘 */}
            <div className="flex items-end justify-center">
                <div className="relative size-86">
                    <div className="bg-gray-2 size-86 overflow-hidden rounded-full shadow-[-2px_-2px_10px_rgba(153,153,153,0.1),_2px_2px_10px_rgba(153,153,153,0.1)]" />
                    <div
                        className="rounded-15 bg-gray-2 absolute top-66 left-66 flex size-20 items-center justify-center"
                        aria-label="프로필 사진 수정">
                        {/* 간단한 펜 아이콘 형태 */}
                        <div className="relative size-10">
                            <ModifyIcon className="size-10" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 입력 영역 */}
            <div className="flex flex-col gap-20">
                {/* 이름 */}
                <div className="flex items-center gap-30">
                    <div className="text-body1-semibold text-nowrap text-black">
                        이름
                    </div>
                    <div className="rounded-12 border-gray-2 flex w-full items-center gap-10 border bg-white p-12">
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="서은우"
                            className="text-body2-medium flex-1 border-none bg-transparent outline-none"
                        />
                    </div>
                </div>

                {/* 소개글 */}
                <div className="flex items-center gap-16">
                    <div className="text-body1-semibold text-nowrap text-black">
                        소개글
                    </div>
                    <div className="rounded-12 border-gray-2 flex w-full items-center gap-10 border bg-white p-12">
                        <input
                            type="text"
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            placeholder="기억이 아닌 추억으로"
                            className="text-body2-medium flex-1 border-none bg-transparent outline-none"
                        />
                    </div>
                </div>

                {/* 좋아하는 음식 */}
                <div className="flex flex-col gap-12">
                    <div className="text-body1-semibold text-black">
                        좋아하는 음식
                    </div>
                    <TagInput
                        id="favoriteFoodsInput"
                        value={favoriteFoods}
                        onChange={setFavoriteFoods}
                        variant="good"
                    />
                </div>

                {/* 못먹는 음식 */}
                <div className="flex flex-col gap-12">
                    <div className="text-body1-semibold text-black">
                        못먹는 음식
                    </div>
                    <TagInput
                        id="dislikedFoodsInput"
                        value={dislikedFoods}
                        onChange={setDislikedFoods}
                        variant="bad"
                    />
                </div>

                {/* 알러지 */}
                <div className="flex flex-col gap-12">
                    <div className="text-body1-semibold text-black">알러지</div>
                    <TagInput
                        id="allergiesInput"
                        value={allergies}
                        onChange={setAllergies}
                        variant="bad"
                    />
                </div>
            </div>
        </div>
    )
}
