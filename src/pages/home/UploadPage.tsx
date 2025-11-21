import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useArticleStore } from '@/store'
import { useBottomNav, useHeader } from '@/hooks'
import { MutalButton } from '@/components'
import { mealTimeMap, mealTimeTextArr } from '@/constants/post'

export function UploadPage() {
    const {
        image: imageFile,
        mealDate,
        mealTime,
        setMealTime,
        setTaggedMemberIds
    } = useArticleStore()
    const [image, setImage] = useState<string | null>(null)
    const { showBottomNav, hideBottomNav } = useBottomNav()
    const { setTitle, resetHeader } = useHeader()
    const [tagPerson, setTagPerson] = useState<string[]>(['태그+', '태그+'])
    useEffect(() => {
        if (!imageFile) return
        const reader = new FileReader()
        reader.onload = e => {
            setImage(e.target?.result as string)
        }
        reader.readAsDataURL(imageFile)
    }, [imageFile])

    type MealTime = keyof typeof mealTimeMap

    const [mealTimeNumber, setMealTimeNumber] = useState<number>(0)

    const handleMealTimeText = () => {
        setMealTimeNumber(prev => (prev + 1) % mealTimeTextArr.length)
    }
    useEffect(() => {
        setMealTime(mealTimeMap[mealTimeTextArr[mealTimeNumber] as MealTime])
    }, [mealTimeNumber])

    useEffect(() => {
        hideBottomNav()
        setTitle('사진 업로드')
        return () => {
            showBottomNav()
            resetHeader()
        }
    }, [])
    return (
        <div className="absolute top-0 left-0 flex h-full w-screen flex-col items-start justify-between pt-55 pb-40">
            <div className="flex w-full flex-col gap-20">
                {image && (
                    <>
                        <img
                            className="aspect-square w-full overflow-hidden object-cover"
                            src={image}
                            alt="uploaded image"
                        />
                    </>
                )}
                <div className="flex w-full flex-wrap gap-10 px-20">
                    {tagPerson.map(person => (
                        <TagPerson name={person} />
                    ))}
                </div>
            </div>
            <div className="flex w-full flex-col items-start justify-center px-20">
                <div className="mb-15 flex w-full gap-16">
                    <div className="rounded-12 bg-gray-2 flex w-full items-center justify-center py-8">
                        <span className="text-body1-semibold text-gray-7">
                            {mealDate}
                        </span>
                    </div>
                    <div
                        className="rounded-12 bg-gray-2 flex w-full items-center justify-center py-8"
                        onClick={handleMealTimeText}>
                        <span className="text-body1-semibold text-gray-7">
                            {mealTimeTextArr[mealTimeNumber]}
                        </span>
                    </div>
                </div>
                <UploadButton disabled={false} />
            </div>
        </div>
    )
}

function UploadButton({ disabled }: { disabled?: boolean }) {
    const handleJoin = () => {
        if (disabled) return
    }

    return (
        <Link
            replace
            to="/search-restaurant"
            className="w-full">
            <MutalButton
                text="다음 단계로 넘어가기"
                onClick={handleJoin}
                hasArrow={true}
            />
        </Link>
    )
}

function TagPerson({ name }: { name: string }) {
    return (
        <div className="bg-gray-2 flex w-fit flex-col items-center justify-center rounded-full px-12 py-6">
            <span className="text-body1-semibold text-gray-7">{name}</span>
        </div>
    )
}
