import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMealPlanDetail } from '@/apis'

import { useArticleStore, useBottomNavStore, useHeaderStore } from '@/store'
import { FoodSearchField, FriendSearchField } from '@/components/features/search'
import type { FoodSearchResult, FriendSearchResult } from '@/services/search'
import { MutalButton } from '@/components'
import { mealTimeMap, mealTimeTextArr } from '@/constants/post'
import { useFoodAnalysis } from '@/features/food-ai'

export function UploadPage() {
    const [searchParams] = useSearchParams()
    const mealPlanId = searchParams.get('mealPlanId')
    const { data: mealPlan } = useMealPlanDetail(mealPlanId ?? '', { enabled: Boolean(mealPlanId) })
    const {
        image: imageFile,
        mealDate,
        mealTime,
        setMealTime,
        setMealPlanId,
        setTaggedMemberIds,
        setFoodAnalysis,
        foodAnalysis: selectedFoodAnalysis
    } = useArticleStore()
    const [image, setImage] = useState<string | null>(null)
    const [selectedTaggedFriends, setSelectedTaggedFriends] = useState<FriendSearchResult[]>([])
    const { showBottomNav, hideBottomNav } = useBottomNavStore()
    const { setTitle, resetHeader } = useHeaderStore()
    const foodAnalysis = useFoodAnalysis(imageFile)

    useEffect(() => {
        if (!imageFile) return
        const reader = new FileReader()
        reader.onload = e => setImage(e.target?.result as string)
        reader.readAsDataURL(imageFile)
    }, [imageFile])

    type MealTime = keyof typeof mealTimeMap

    const [mealTimeNumber, setMealTimeNumber] = useState<number>(0)

    const handleMealTimeText = () => {
        setMealTimeNumber(prev => (prev + 1) % mealTimeTextArr.length)
    }

    useEffect(() => {
        setMealTime(mealTimeMap[mealTimeTextArr[mealTimeNumber] as MealTime])
    }, [mealTimeNumber, setMealTime])

    useEffect(() => {
        hideBottomNav()
        setTitle(mealPlanId ? '밥약 기록 업로드' : '사진 업로드')
        setMealPlanId(mealPlanId)
        if (!mealPlanId) setTaggedMemberIds([])
        return () => {
            showBottomNav()
            resetHeader()
            setMealPlanId(null)
        }
    }, [hideBottomNav, showBottomNav, setTitle, resetHeader, setTaggedMemberIds, setMealPlanId, mealPlanId])

    useEffect(() => {
        if (!mealPlanId || !mealPlan) return
        const friends = mealPlan.participants
            .filter(participant => ['JOINED', 'READY'].includes(participant.status))
            .map(participant => participant.member)
            .filter((member): member is NonNullable<typeof member> => member != null)
            .map(member => ({
                memberId: member.memberId,
                nickname: member.username,
                profileImageUrl: member.profileImageUrl,
                handle: null,
                friendStatus: 'JOINED',
                raw: member
            }))
        setSelectedTaggedFriends(friends)
        setTaggedMemberIds(
            Array.from(
                new Set(
                    friends
                        .map(friend => Number(friend.memberId))
                        .filter(memberId => Number.isFinite(memberId))
                )
            )
        )
    }, [mealPlanId, mealPlan, setTaggedMemberIds])

    const selectTaggedFriend = (friend: FriendSearchResult) => {
        setSelectedTaggedFriends(current => {
            if (current.some(item => String(item.memberId) === String(friend.memberId))) {
                return current
            }
            const next = [...current, friend]
            setTaggedMemberIds(
                next
                    .map(item => Number(item.memberId))
                    .filter(memberId => Number.isFinite(memberId))
            )
            return next
        })
    }

    const removeTaggedFriend = (friend: FriendSearchResult) => {
        setSelectedTaggedFriends(current => {
            const next = current.filter(item => String(item.memberId) !== String(friend.memberId))
            setTaggedMemberIds(
                next
                    .map(item => Number(item.memberId))
                    .filter(memberId => Number.isFinite(memberId))
            )
            return next
        })
    }

    const selectFood = (food: FoodSearchResult) => {
        setFoodAnalysis({
            code: food.id as never,
            label: food.name as never,
            confidence: 1,
            tsUtc: new Date().toISOString() as never
        })
    }

    return (
        <div className="absolute top-0 left-0 flex h-full w-screen flex-col items-start justify-between pt-55 pb-40">
            <div className="flex w-full flex-col gap-20">
                {mealPlanId && (
                    <div className="mx-20 rounded-20 bg-primary-100 border-primary-300 border p-14">
                        <span className="text-caption-medium text-primary-main">
                            MealPlan 기록 연결
                        </span>
                        <p className="text-body2-medium text-gray-7">
                            이 기록은 {mealPlan?.title ?? '이 밥약'}에 연결됩니다. 기록 완료 후 밥약 상태가 RECORDED로 전환됩니다.
                        </p>
                    </div>
                )}
                {image && (
                    <img
                        className="aspect-square w-full overflow-hidden object-cover"
                        src={image}
                        alt="uploaded image"
                    />
                )}
                <div className="mx-20 rounded-20 bg-white p-16">
                    <FriendSearchField
                        label="친구 태그 추가"
                        helperText="서버 검색 결과를 신뢰해서 태그할 친구를 선택합니다. 게스트 참여자는 Article 태그에서 제외됩니다."
                        selected={selectedTaggedFriends}
                        excludedMemberIds={selectedTaggedFriends.map(friend => friend.memberId)}
                        onSelect={selectTaggedFriend}
                        onRemove={removeTaggedFriend}
                    />
                </div>
                <div className="mx-20 rounded-20 bg-white p-16">
                    <FoodAnalysisStatus state={foodAnalysis} />
                    {selectedFoodAnalysis && (
                        <div className="mb-10 rounded-16 bg-primary-100 p-10 text-body2-medium text-primary-main">
                            현재 음식 메뉴: {selectedFoodAnalysis.label}
                        </div>
                    )}
                    <FoodSearchField
                        label="인식된 음식 메뉴 수정·추가"
                        helperText="사진 인식 결과가 틀렸다면 manifest 기반 음식 검색으로 메뉴를 바꿀 수 있습니다."
                        selected={selectedFoodAnalysis ? [selectedFoodAnalysis.label] : []}
                        onSelect={selectFood}
                        onRemove={() => setFoodAnalysis(null)}
                    />
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
                <UploadButton
                    disabled={false}
                    mealPlanId={mealPlanId}
                />
            </div>
        </div>
    )
}

function UploadButton({
    disabled,
    mealPlanId
}: {
    disabled?: boolean
    mealPlanId: string | null
}) {
    const nextHref = mealPlanId
        ? `/search-restaurant?mealPlanId=${mealPlanId}`
        : '/search-restaurant'

    return (
        <Link
            replace
            to={nextHref}
            className="w-full">
            <MutalButton
                text={mealPlanId ? 'MealPlan 기록 이어가기' : '다음 단계로 넘어가기'}
                onClick={() => undefined}
                disabled={disabled}
                hasArrow={true}
            />
        </Link>
    )
}

function FoodAnalysisStatus({
    state
}: {
    state: ReturnType<typeof useFoodAnalysis>
}) {
    if (state.status === 'idle') return null

    if (state.status === 'analyzing') {
        return (
            <div className="px-20">
                <span className="text-caption1-medium text-gray-6">
                    음식 사진을 분석하고 있어요.
                </span>
            </div>
        )
    }

    if (state.status === 'ready' && state.result?.ok) {
        const { label, confidence } = state.result.foodAnalysis
        const percent = Math.round(confidence * 100)

        return (
            <div className="px-20">
                <span className="text-caption1-medium text-gray-6">
                    인식된 음식: {label} · 신뢰도 {percent}%
                </span>
            </div>
        )
    }

    if (state.status === 'failed') {
        return (
            <div className="px-20">
                <span className="text-caption1-medium text-gray-6">
                    음식 분석을 완료하지 못했어요. 사진은 그대로 업로드할 수 있어요.
                </span>
            </div>
        )
    }

    return null
}
