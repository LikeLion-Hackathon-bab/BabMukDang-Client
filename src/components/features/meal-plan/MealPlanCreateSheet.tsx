import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@/navigation'
import { useCreateMealPlan, useFriends, useSendMealPlanInvite } from '@/apis'
import { FoodSearchField, PlaceSearchField } from '@/components/features/search'
import { BottomSheetPortal } from '@/components/shared'
import type { FoodSearchResult, PlaceSearchResult } from '@/services/search'
import { useBottomSheet } from '@/hooks'
import { BOTTOM_NAVIGATION_HEIGHT } from '@/constants/bottomNav'
import {
    toMemberId,
    type FriendListItemResponse,
    type MealPlanChannel,
    type MealPlanLocationCandidate
} from '@kimdaegyu/babmukdang-shared/domain'

const splitCsv = (value: string) =>
    value
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)

const PERSISTENT_CLOSED_SNAP_POINT = 24
const PERSISTENT_BOTTOM_OFFSET = 60
const PERSISTENT_BOTTOM_SHEET_Z_INDEX = 400
const PERSISTENT_OPEN_BOTTOM_SHEET_Z_INDEX = 1000

const toNumberOrNull = (value: string) => {
    if (!value.trim()) return null
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

function appendCsvValue(current: string, value: string): string {
    const items = splitCsv(current)
    if (items.includes(value)) return current
    return [...items, value].join(', ')
}

function removeCsvValue(current: string, value: string): string {
    return splitCsv(current)
        .filter(item => item !== value)
        .join(', ')
}

export function MealPlanCreateSheet({
    open,
    onClose,
    initialInviteeId,
    initialMealGroupId,
    persistent = false
}: {
    open: boolean
    onClose: () => void
    initialInviteeId?: string | null
    initialMealGroupId?: string | null
    persistent?: boolean
}) {
    const navigate = useNavigate()
    const [step, setStep] = useState<1 | 2>(1)
    const [title, setTitle] = useState('오늘 뭐 먹지?')
    const [selectedFriends, setSelectedFriends] = useState<
        FriendListItemResponse[]
    >([])
    const [mealDate, setMealDate] = useState('')
    const [mealTime, setMealTime] = useState('')
    const [preferredMenus, setPreferredMenus] = useState('한식, 일식')
    const [excludedMenus, setExcludedMenus] = useState('')
    const [candidateMenus, setCandidateMenus] = useState(
        '한식, 분식, 일식, 중식, 양식, 돈까스, 국밥, 샐러드'
    )
    const [budgetMin, setBudgetMin] = useState('')
    const [budgetMax, setBudgetMax] = useState('')
    const [areaName, setAreaName] = useState('')
    const [areaAddress, setAreaAddress] = useState('')
    const [areaLat, setAreaLat] = useState('')
    const [areaLng, setAreaLng] = useState('')
    const [memo, setMemo] = useState('')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const { data: friends, isLoading: isFriendsLoading } = useFriends()
    const createMealPlan = useCreateMealPlan()
    const sendMealPlanInvite = useSendMealPlanInvite()
    const friendList = (friends ?? []) as FriendListItemResponse[]
    const {
        setSheetRef,
        derivedValue: { translatePercent, isDragging, isOpen },
        snapTo,
        close
    } = useBottomSheet({
        snapPoints: [persistent ? PERSISTENT_CLOSED_SNAP_POINT : 0, 100],
        initialSnapPoint: 0,
        initialExposure: 0,
        openingDragLimit: persistent
            ? {
                  bottomOffset: PERSISTENT_BOTTOM_OFFSET,
                  overflow: BOTTOM_NAVIGATION_HEIGHT
              }
            : undefined
    })

    const initialMemo = useMemo(() => {
        const parts = []
        if (initialInviteeId) parts.push(`초대 대상: ${initialInviteeId}`)
        if (initialMealGroupId) parts.push(`MealGroup: ${initialMealGroupId}`)
        return parts.join(' · ')
    }, [initialInviteeId, initialMealGroupId])

    useEffect(() => {
        if (open) snapTo(1)
    }, [open, snapTo])

    useEffect(() => {
        if (!persistent && open && !isOpen) onClose()
    }, [isOpen, onClose, open, persistent])

    const isPending = createMealPlan.isPending || sendMealPlanInvite.isPending
    const hasSelectedInvitees =
        selectedFriends.length > 0 || Boolean(initialInviteeId)

    const toggleFriend = (friend: FriendListItemResponse) => {
        setSelectedFriends(current => {
            if (
                current.some(
                    item => String(item.memberId) === String(friend.memberId)
                )
            ) {
                return current.filter(
                    item => String(item.memberId) !== String(friend.memberId)
                )
            }
            return [...current, friend]
        })
    }

    const selectArea = (place: PlaceSearchResult) => {
        setAreaName(place.placeName)
        setAreaAddress(place.roadAddressName || place.addressName || '')
        setAreaLat(String(place.latitude))
        setAreaLng(String(place.longitude))
    }

    const buildAreaCandidate = (): MealPlanLocationCandidate | undefined => {
        const lat = toNumberOrNull(areaLat)
        const lng = toNumberOrNull(areaLng)
        if (!areaName.trim() || lat === null || lng === null) return undefined
        return {
            locationId: `manual:${areaName.trim()}` as never,
            placeName: areaName.trim(),
            lat: lat as never,
            lng: lng as never,
            address: areaAddress.trim(),
            source: 'manual',
            createdAt: new Date().toISOString() as never
        }
    }

    const submit = async () => {
        setErrorMessage(null)
        const min = toNumberOrNull(budgetMin)
        const max = toNumberOrNull(budgetMax)
        const combinedMemo = [initialMemo, memo.trim()]
            .filter(Boolean)
            .join('\n')
        const inviteeIds = [
            ...selectedFriends
                .map(friend => Number(friend.memberId))
                .filter(id => Number.isFinite(id) && id > 0),
            initialInviteeId ? Number(initialInviteeId) : null
        ].filter((id): id is number => typeof id === 'number')
        const channels =
            inviteeIds.length > 0
                ? (['FRIEND_INVITE'] satisfies MealPlanChannel[])
                : (['OWNER_ONLY'] satisfies MealPlanChannel[])

        try {
            const data = await createMealPlan.mutateAsync({
                title: title.trim() || '오늘 뭐 먹지?',
                channels: channels.length > 0 ? channels : ['OWNER_ONLY'],
                recommendationContext: {
                    mealDate: mealDate || undefined,
                    mealTime: mealTime || undefined,
                    area: buildAreaCandidate(),
                    preferredMenuCategories: splitCsv(preferredMenus),
                    excludedMenuCategories: splitCsv(excludedMenus),
                    candidateMenuCategories: splitCsv(candidateMenus),
                    budgetMin: min ?? undefined,
                    budgetMax: max ?? undefined,
                    memo: combinedMemo || undefined
                }
            })

            await Promise.all(
                [...new Set(inviteeIds)].map(inviteeId =>
                    sendMealPlanInvite.mutateAsync({
                        mealPlanId: data.mealPlanId,
                        body: {
                            inviteeId: toMemberId(inviteeId),
                            message: '같이 밥 먹자!'
                        }
                    })
                )
            )
            navigate(`/meal-plans/${data.mealPlanId}/decision`)
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : '밥약을 만들지 못했습니다.'
            )
        }
    }

    const content = (
        <div className="flex max-h-[92vh] flex-col">
            <div className="flex flex-col gap-13 px-18 pt-10 pb-13">
                <div className="bg-gray-2 h-4 w-40 self-center rounded-full" />
                <div className="flex items-center gap-8">
                    {[1, 2].map(item => (
                        <span
                            key={item}
                            className={`text-caption-medium rounded-full px-10 py-4 ${
                                step === item
                                    ? 'bg-primary-main text-white'
                                    : 'bg-gray-1 text-gray-5'
                            }`}>
                            {item}
                        </span>
                    ))}
                    <span className="text-caption-medium text-gray-5">
                        {step === 1 ? '친구 초대' : '초기 조건'}
                    </span>
                </div>
                <div>
                    <h2 className="text-title2-semibold text-gray-8">
                        {step === 1 ? '누구랑 먹을까요?' : '밥약 조건을 정해요'}
                    </h2>
                    <p className="text-caption-regular text-gray-5 mt-4 leading-5">
                        {step === 1
                            ? '초대할 친구를 고르고 밥약 이름을 정해요. 친구 없이 혼자 시작할 수도 있어요.'
                            : '지금 정하면 메뉴·식당 후보가 자동으로 채워져요. 비워두면 다 같이 정할 수 있어요.'}
                    </p>
                </div>
            </div>

            <div className="no-drag min-h-0 flex-1 overflow-y-auto px-18 pb-14">
                {step === 1 ? (
                    <div className="flex flex-col gap-14">
                        <label className="text-caption-medium text-gray-7 flex flex-col gap-6">
                            밥약 이름
                            <input
                                value={title}
                                onChange={event => setTitle(event.target.value)}
                                className="rounded-14 bg-gray-1 text-body1-semibold text-gray-8 px-12 py-11 outline-none"
                                placeholder="예: 금요일 점심 모임"
                            />
                        </label>
                        <div className="flex flex-col gap-8">
                            <div className="flex items-center justify-between">
                                <span className="text-caption-medium text-gray-7">
                                    친구 목록
                                </span>
                                <span className="text-caption-regular text-gray-5">
                                    {selectedFriends.length}명 선택
                                </span>
                            </div>
                            {isFriendsLoading ? (
                                <div className="rounded-16 bg-gray-1 text-caption-regular text-gray-5 p-14">
                                    친구 목록을 불러오는 중입니다.
                                </div>
                            ) : friendList.length ? (
                                <div className="flex max-h-260 flex-col gap-8 overflow-y-auto pr-2">
                                    {friendList.map(friend => {
                                        const selected = selectedFriends.some(
                                            item =>
                                                String(item.memberId) ===
                                                String(friend.memberId)
                                        )
                                        return (
                                            <button
                                                key={friend.memberId}
                                                type="button"
                                                onClick={() =>
                                                    toggleFriend(friend)
                                                }
                                                className={`rounded-16 flex items-center gap-10 border p-12 text-left ${
                                                    selected
                                                        ? 'border-primary-300 bg-primary-100'
                                                        : 'bg-gray-1 border-transparent'
                                                }`}>
                                                <div className="bg-primary-100 text-primary-main text-body2-semibold grid h-38 w-38 shrink-0 place-items-center rounded-full">
                                                    {friend.username.slice(
                                                        0,
                                                        1
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <span className="text-body2-semibold text-gray-8 block truncate">
                                                        {friend.username}
                                                    </span>
                                                    <span className="text-caption-regular text-gray-5">
                                                        {friend.mealAvailability
                                                            ?.isHungry
                                                            ? '지금 밥약 가능'
                                                            : '친구'}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`h-20 w-20 rounded-full border ${
                                                        selected
                                                            ? 'border-primary-main bg-primary-main'
                                                            : 'border-gray-3 bg-white'
                                                    }`}
                                                />
                                            </button>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-16 bg-gray-1 text-caption-regular text-gray-5 p-14">
                                    아직 친구 목록이 없습니다.
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-14">
                        <div className="grid grid-cols-2 gap-10">
                            <label className="text-caption-medium text-gray-7 flex flex-col gap-6">
                                날짜
                                <input
                                    type="date"
                                    value={mealDate}
                                    onChange={event =>
                                        setMealDate(event.target.value)
                                    }
                                    className="rounded-14 bg-gray-1 px-12 py-10 outline-none"
                                />
                            </label>
                            <label className="text-caption-medium text-gray-7 flex flex-col gap-6">
                                시간
                                <input
                                    type="time"
                                    value={mealTime}
                                    onChange={event =>
                                        setMealTime(event.target.value)
                                    }
                                    className="rounded-14 bg-gray-1 px-12 py-10 outline-none"
                                />
                            </label>
                        </div>
                        <PlaceSearchField
                            label="지역"
                            placeholder="예: 강남역, 판교역, 성수동"
                            helperText="검색 결과를 선택하면 주소와 좌표가 자동으로 채워집니다."
                            selectedName={areaName || null}
                            onSelect={selectArea}
                        />
                        <FoodSearchField
                            label="선호 메뉴"
                            placeholder="좋아하는 메뉴 검색"
                            selected={splitCsv(preferredMenus)}
                            onSelect={(food: FoodSearchResult) =>
                                setPreferredMenus(current =>
                                    appendCsvValue(current, food.label)
                                )
                            }
                            onRemove={name =>
                                setPreferredMenus(current =>
                                    removeCsvValue(current, name)
                                )
                            }
                        />
                        <FoodSearchField
                            label="제외 메뉴"
                            placeholder="피하고 싶은 메뉴 검색"
                            selected={splitCsv(excludedMenus)}
                            onSelect={(food: FoodSearchResult) =>
                                setExcludedMenus(current =>
                                    appendCsvValue(current, food.label)
                                )
                            }
                            onRemove={name =>
                                setExcludedMenus(current =>
                                    removeCsvValue(current, name)
                                )
                            }
                        />
                        <FoodSearchField
                            label="추천 후보 풀"
                            placeholder="후보로 보고 싶은 메뉴 검색"
                            selected={splitCsv(candidateMenus)}
                            onSelect={(food: FoodSearchResult) =>
                                setCandidateMenus(current =>
                                    appendCsvValue(current, food.label)
                                )
                            }
                            onRemove={name =>
                                setCandidateMenus(current =>
                                    removeCsvValue(current, name)
                                )
                            }
                        />
                        <div className="grid grid-cols-2 gap-10">
                            <input
                                inputMode="numeric"
                                value={budgetMin}
                                onChange={event =>
                                    setBudgetMin(event.target.value)
                                }
                                className="rounded-14 bg-gray-1 px-12 py-10 outline-none"
                                placeholder="최소 예산"
                            />
                            <input
                                inputMode="numeric"
                                value={budgetMax}
                                onChange={event =>
                                    setBudgetMax(event.target.value)
                                }
                                className="rounded-14 bg-gray-1 px-12 py-10 outline-none"
                                placeholder="최대 예산"
                            />
                        </div>
                        <textarea
                            value={memo}
                            onChange={event => setMemo(event.target.value)}
                            className="rounded-14 bg-gray-1 min-h-76 px-12 py-10 outline-none"
                            placeholder="양, 가격, 분위기 같은 조건을 적어주세요."
                        />
                    </div>
                )}
            </div>

            {errorMessage && (
                <p className="text-caption-regular px-18 pb-8 text-red-500">
                    {errorMessage}
                </p>
            )}
            <div
                className="no-drag border-gray-1 flex gap-10 border-t px-18 pt-14"
                style={{
                    paddingBottom: 'calc(14px + env(safe-area-inset-bottom))'
                }}>
                {step === 2 && (
                    <button
                        type="button"
                        className="border-gray-2 text-body2-semibold text-gray-6 h-50 w-74 rounded-full border bg-white"
                        onClick={() => setStep(1)}>
                        이전
                    </button>
                )}
                <button
                    type="button"
                    disabled={isPending}
                    onClick={() => (step === 1 ? setStep(2) : void submit())}
                    className="bg-gray-8 text-body1-semibold h-50 flex-1 rounded-full text-white disabled:opacity-40">
                    {step === 1
                        ? hasSelectedInvitees
                            ? '다음'
                            : '혼밥하기'
                        : isPending
                          ? '만드는 중'
                          : '밥약 만들기'}
                </button>
            </div>
        </div>
    )

    if (persistent) {
        const currentBottomOffset = isOpen ? 0 : PERSISTENT_BOTTOM_OFFSET

        return (
            <div
                className="pointer-events-none fixed inset-0"
                style={{
                    zIndex: isOpen
                        ? PERSISTENT_OPEN_BOTTOM_SHEET_Z_INDEX
                        : PERSISTENT_BOTTOM_SHEET_Z_INDEX
                }}>
                {isOpen && (
                    <div
                        className="pointer-events-auto fixed inset-0 bg-black/40"
                        onClick={event => {
                            event.stopPropagation()
                            close()
                        }}
                    />
                )}
                <section
                    ref={setSheetRef}
                    className="pointer-events-auto fixed right-0 left-0 max-h-[92vh] w-full overflow-hidden rounded-t-[22px] bg-white shadow-2xl"
                    style={{
                        bottom: currentBottomOffset,
                        transform: `translateY(${translatePercent}%)`,
                        transition: isDragging
                            ? 'none'
                            : [
                                  'transform 280ms ease-out',
                                  'bottom 280ms ease-out'
                              ].join(', '),
                        touchAction: 'none'
                    }}>
                    {content}
                </section>
            </div>
        )
    }

    return (
        <BottomSheetPortal
            open={open}
            onClose={onClose}
            snapPoints={[0, 100]}
            className="max-h-[92vh] w-full overflow-hidden rounded-t-[22px] bg-white shadow-2xl">
            {content}
        </BottomSheetPortal>
    )
}
