import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCreateMealPlan, useSendMealPlanInvite } from '@/apis'
import { FoodSearchField, PlaceSearchField } from '@/components/features/search'
import type { FoodSearchResult, PlaceSearchResult } from '@/services/search'
import {
    toMemberId,
    type MealPlanChannel,
    type MealPlanLocationCandidate
} from '@kimdaegyu/babmukdang-shared/domain'

const channelOptions: Array<{
    value: MealPlanChannel
    label: string
    description: string
}> = [
    {
        value: 'OWNER_ONLY',
        label: '오늘 뭐 먹지 시작',
        description: '혼자 추천 후보를 받고 바로 밥약을 확정합니다.'
    },
    {
        value: 'FRIEND_INVITE',
        label: '친구와 먹기 시작',
        description: '앱 친구를 같은 MealPlan에 초대합니다.'
    },
    {
        value: 'LINK_GUEST',
        label: '링크로 같이 정하기 시작',
        description: '카카오톡 등 외부 채널로 게스트를 받습니다.'
    },
    {
        value: 'NEARBY_FRIENDS',
        label: '근처 친구 찾기 시작',
        description: '동의와 조건을 만족한 근처 친구에게만 노출합니다.'
    }
]

const splitCsv = (value: string) =>
    value
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)

const toNumberOrNull = (value: string) => {
    if (!value.trim()) return null
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

export function MealPlanStartPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const initialInviteeId = searchParams.get('inviteeId')
    const initialMealGroupId = searchParams.get('mealGroupId')
    const [title, setTitleValue] = useState('오늘 뭐 먹지?')
    const [selectedChannels, setSelectedChannels] = useState<MealPlanChannel[]>(
        [initialInviteeId ? 'FRIEND_INVITE' : 'OWNER_ONLY']
    )
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
    const createMealPlan = useCreateMealPlan()
    const sendMealPlanInvite = useSendMealPlanInvite()
    const isPending = createMealPlan.isPending || sendMealPlanInvite.isPending

    const initialMemo = useMemo(() => {
        const parts = []
        if (initialInviteeId) parts.push(`초대 대상: ${initialInviteeId}`)
        if (initialMealGroupId) parts.push(`MealGroup: ${initialMealGroupId}`)
        return parts.join(' · ')
    }, [initialInviteeId, initialMealGroupId])

    const toggleChannel = (channel: MealPlanChannel) => {
        setSelectedChannels(current => {
            const next = current.includes(channel)
                ? current.filter(item => item !== channel)
                : [...current, channel]
            return next.length === 0 ? ['OWNER_ONLY'] : next
        })
    }

    const appendCsvValue = (current: string, value: string): string => {
        const items = splitCsv(current)
        if (items.includes(value)) return current
        return [...items, value].join(', ')
    }

    const removeCsvValue = (current: string, value: string): string =>
        splitCsv(current)
            .filter(item => item !== value)
            .join(', ')

    const addPreferredMenu = (food: FoodSearchResult) => {
        setPreferredMenus(current => appendCsvValue(current, food.label))
    }

    const addExcludedMenu = (food: FoodSearchResult) => {
        setExcludedMenus(current => appendCsvValue(current, food.label))
    }

    const addCandidateMenu = (food: FoodSearchResult) => {
        setCandidateMenus(current => appendCsvValue(current, food.label))
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

    const submit = () => {
        const min = toNumberOrNull(budgetMin)
        const max = toNumberOrNull(budgetMax)
        const combinedMemo = [initialMemo, memo.trim()]
            .filter(Boolean)
            .join('\n')
        const inviteeId = initialInviteeId ? Number(initialInviteeId) : null

        createMealPlan.mutate(
            {
                title: title.trim() || '오늘 뭐 먹지?',
                channels: selectedChannels,
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
            },
            {
                onSuccess: data => {
                    if (
                        inviteeId &&
                        Number.isFinite(inviteeId) &&
                        inviteeId > 0
                    ) {
                        sendMealPlanInvite.mutate(
                            {
                                mealPlanId: data.mealPlanId,
                                body: {
                                    inviteeId: toMemberId(inviteeId),
                                    message: '같이 밥 먹자!'
                                }
                            },
                            {
                                onSettled: () =>
                                    navigate(
                                        `/meal-plans/${data.mealPlanId}/decision`
                                    )
                            }
                        )
                        return
                    }
                    navigate(`/meal-plans/${data.mealPlanId}/decision`)
                }
            }
        )
    }

    return (
        <div className="flex flex-col gap-24 py-20">
            <section className="flex flex-col gap-10">
                <h1 className="text-title2-semibold text-gray-8">
                    어떤 방식으로 밥약을 시작할까요?
                </h1>
                <p className="text-body2-medium text-gray-5">
                    추천 조건을 먼저 저장하면 MealPlan 상세에 메뉴 후보가
                    만들어지고, 이후 같은 MealPlan에 친구와 게스트를 추가할 수
                    있습니다.
                    {initialInviteeId
                        ? ` 선택한 친구(${initialInviteeId})에게는 생성 직후 초대를 보냅니다.`
                        : ''}
                </p>
            </section>

            <label className="flex flex-col gap-8 text-caption-medium text-gray-7">
                밥약 이름
                <input
                    value={title}
                    onChange={event => setTitleValue(event.target.value)}
                    className="rounded-16 bg-white px-14 py-12 text-body1-semibold text-gray-8 outline-none"
                    placeholder="예: 오늘 뭐 먹지?"
                />
            </label>

            <section className="grid grid-cols-1 gap-12">
                {channelOptions.map(option => {
                    const active = selectedChannels.includes(option.value)
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => toggleChannel(option.value)}
                            className={`rounded-20 border p-16 text-left ${
                                active
                                    ? 'border-primary-main bg-primary-100'
                                    : 'border-transparent bg-white'
                            }`}>
                            <span className="text-body1-semibold text-gray-8">
                                {option.label}
                            </span>
                            <p className="text-caption-regular text-gray-5">
                                {option.description}
                            </p>
                        </button>
                    )
                })}
            </section>

            <section className="rounded-24 flex flex-col gap-14 bg-white p-18">
                <div>
                    <h2 className="text-body1-semibold text-gray-8">
                        추천 조건
                    </h2>
                    <p className="text-caption-regular text-gray-5">
                        쉼표로 메뉴 후보와 제외 메뉴를 입력하면 서버가 MealPlan
                        메뉴 후보를 저장합니다.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-10">
                    <label className="flex flex-col gap-6 text-caption-medium text-gray-7">
                        날짜
                        <input
                            type="date"
                            value={mealDate}
                            onChange={event => setMealDate(event.target.value)}
                            className="rounded-14 bg-gray-1 px-12 py-10 outline-none"
                        />
                    </label>
                    <label className="flex flex-col gap-6 text-caption-medium text-gray-7">
                        시간
                        <input
                            type="time"
                            value={mealTime}
                            onChange={event => setMealTime(event.target.value)}
                            className="rounded-14 bg-gray-1 px-12 py-10 outline-none"
                        />
                    </label>
                </div>
                <FoodSearchField
                    label="선호 메뉴"
                    placeholder="좋아하는 메뉴 검색"
                    helperText="검색 결과를 선택하면 선호 메뉴 목록에 추가됩니다."
                    selected={splitCsv(preferredMenus)}
                    onSelect={addPreferredMenu}
                    onRemove={name =>
                        setPreferredMenus(current =>
                            removeCsvValue(current, name)
                        )
                    }
                />
                <FoodSearchField
                    label="제외 메뉴"
                    placeholder="피하고 싶은 메뉴 검색"
                    helperText="검색 결과를 선택하면 제외 메뉴 목록에 추가됩니다."
                    selected={splitCsv(excludedMenus)}
                    onSelect={addExcludedMenu}
                    onRemove={name =>
                        setExcludedMenus(current =>
                            removeCsvValue(current, name)
                        )
                    }
                />
                <FoodSearchField
                    label="추천 후보 풀"
                    placeholder="후보로 보고 싶은 메뉴 검색"
                    helperText="검색 결과를 선택하면 추천 후보 풀에 추가됩니다."
                    selected={splitCsv(candidateMenus)}
                    onSelect={addCandidateMenu}
                    onRemove={name =>
                        setCandidateMenus(current =>
                            removeCsvValue(current, name)
                        )
                    }
                />
                <div className="grid grid-cols-2 gap-10">
                    <label className="flex flex-col gap-6 text-caption-medium text-gray-7">
                        최소 예산
                        <input
                            inputMode="numeric"
                            value={budgetMin}
                            onChange={event => setBudgetMin(event.target.value)}
                            className="rounded-14 bg-gray-1 px-12 py-10 outline-none"
                            placeholder="예: 8000"
                        />
                    </label>
                    <label className="flex flex-col gap-6 text-caption-medium text-gray-7">
                        최대 예산
                        <input
                            inputMode="numeric"
                            value={budgetMax}
                            onChange={event => setBudgetMax(event.target.value)}
                            className="rounded-14 bg-gray-1 px-12 py-10 outline-none"
                            placeholder="예: 15000"
                        />
                    </label>
                </div>
                <div className="grid grid-cols-1 gap-10">
                    <PlaceSearchField
                        label="지역 이름·주소 검색"
                        placeholder="예: 강남역, 판교역, 성수동"
                        helperText="카카오 지도 검색 결과를 선택하면 지역 이름, 주소, 좌표가 자동으로 채워집니다."
                        selectedName={areaName || null}
                        onSelect={selectArea}
                    />
                    <div className="grid grid-cols-1 gap-8 rounded-16 bg-gray-1 p-12">
                        <span className="text-caption-medium text-gray-6">
                            선택된 지역 정보
                        </span>
                        <input
                            value={areaName}
                            onChange={event => setAreaName(event.target.value)}
                            className="rounded-14 bg-white px-12 py-10 outline-none"
                            placeholder="지역 이름"
                        />
                        <input
                            value={areaAddress}
                            onChange={event =>
                                setAreaAddress(event.target.value)
                            }
                            className="rounded-14 bg-white px-12 py-10 outline-none"
                            placeholder="주소"
                        />
                        <div className="grid grid-cols-2 gap-10">
                            <input
                                value={areaLat}
                                onChange={event =>
                                    setAreaLat(event.target.value)
                                }
                                className="rounded-14 bg-white px-12 py-10 outline-none"
                                placeholder="위도"
                            />
                            <input
                                value={areaLng}
                                onChange={event =>
                                    setAreaLng(event.target.value)
                                }
                                className="rounded-14 bg-white px-12 py-10 outline-none"
                                placeholder="경도"
                            />
                        </div>
                    </div>
                </div>
                <label className="flex flex-col gap-6 text-caption-medium text-gray-7">
                    메모
                    <textarea
                        value={memo}
                        onChange={event => setMemo(event.target.value)}
                        className="min-h-80 rounded-14 bg-gray-1 px-12 py-10 outline-none"
                        placeholder="양, 가격, 분위기 같은 조건을 적어주세요."
                    />
                </label>
            </section>

            <button
                type="button"
                disabled={isPending}
                onClick={submit}
                className="rounded-30 bg-gray-8 text-body1-semibold py-14 text-white disabled:opacity-40">
                MealPlan 만들고 추천 받기
            </button>
        </div>
    )
}
