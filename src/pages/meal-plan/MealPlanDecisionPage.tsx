import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
    MealPlanDecisionStageCard,
    MealPlanDecisionWorkflowPanel,
    MealPlanReadyBar
} from '@/components/features/meal-plan'
import { useCreateMealPlanVote, useMealPlanDetail } from '@/apis'
import { SocketProvider } from '@/contexts/SocketContext'
import { useMealPlanStore, useHeaderStore } from '@/store'
import { FoodSearchField, PlaceSearchField } from '@/components/features/search'
import type { FoodSearchResult, PlaceSearchResult } from '@/services/search'
import type {
    MealPlanDecisionCandidate,
    MealPlanDecisionStageResponse
} from '@kimdaegyu/babmukdang-shared/domain'

const findStage = (
    stages: MealPlanDecisionStageResponse[],
    stageType: MealPlanDecisionStageResponse['stageType']
) => stages.find(stage => stage.stageType === stageType)

const toMenuCandidate = (
    food: FoodSearchResult
): MealPlanDecisionCandidate => ({
    stageType: 'MENU',
    value: {
        menuCandidateId: `manual:${food.id}` as never,
        menu: {
            code: food.id as never,
            label: food.name as never
        },
        source: 'manual-search',
        score: food.popularity ?? 0,
        createdAt: new Date().toISOString() as never
    }
})

const toAreaCandidate = (
    place: PlaceSearchResult
): MealPlanDecisionCandidate => ({
    stageType: 'AREA',
    value: {
        locationId: `search:${place.placeId}` as never,
        placeName: place.placeName,
        lat: place.latitude as never,
        lng: place.longitude as never,
        address: place.roadAddressName || place.addressName || '',
        source: 'search',
        createdAt: new Date().toISOString() as never
    }
})

const toRestaurantCandidate = (
    place: PlaceSearchResult
): MealPlanDecisionCandidate => ({
    stageType: 'RESTAURANT',
    value: {
        restaurantId: place.placeId as never,
        placeName: place.placeName,
        categoryName: place.categoryName ?? '',
        categoryGroupName: place.categoryGroupName ?? '',
        distance: place.distance == null ? undefined : String(place.distance),
        roadAddressName: place.roadAddressName ?? '',
        addressName: place.addressName ?? '',
        phone: place.phoneNumber ?? null,
        placeUrl: place.placeUrl ?? null,
        lat: place.latitude,
        lng: place.longitude,
        source: 'search',
        createdAt: new Date().toISOString() as never
    }
})

export function MealPlanDecisionPage() {
    return (
        <SocketProvider>
            <MealPlanDecisionContent />
        </SocketProvider>
    )
}

function MealPlanDecisionContent() {
    const { mealPlanId = '' } = useParams<{ mealPlanId: string }>()
    const { setTitle, resetHeader } = useHeaderStore()
    const { data } = useMealPlanDetail(mealPlanId, {
        enabled: Boolean(mealPlanId)
    })
    const setCurrentMealPlan = useMealPlanStore(
        state => state.setCurrentMealPlan
    )
    const storeCurrent = useMealPlanStore(state => state.current)
    const stages = useMealPlanStore(state => state.decisionStages)
    const decisionProgress = useMealPlanStore(state => state.decisionProgress)
    const readyCount = useMealPlanStore(state => state.readyCount)
    const participantCount = useMealPlanStore(state => state.participantCount)
    const isSelfReady = useMealPlanStore(state => state.isSelfReady)
    const currentMealPlan = storeCurrent ?? data ?? null
    const permissions = currentMealPlan?.viewerPermissions
    const { mutate: createVote, isPending: isVotePending } =
        useCreateMealPlanVote()
    const isOwner = currentMealPlan?.viewerRole === 'OWNER'

    useEffect(() => {
        setTitle('밥약 결정')
        return () => resetHeader()
    }, [setTitle, resetHeader])

    useEffect(() => {
        if (data) setCurrentMealPlan(data)
    }, [data, setCurrentMealPlan])

    const voteCandidate = (
        stageType: MealPlanDecisionStageResponse['stageType'],
        candidate: MealPlanDecisionCandidate,
        voteType: 'PICK' | 'PREFER' = 'PICK'
    ) => {
        const stage = findStage(
            stages.length > 0 ? stages : (data?.decisionStages ?? []),
            stageType
        )
        if (!stage || !permissions?.canVote || isVotePending) return
        createVote({
            mealPlanId,
            stageId: stage.stageId,
            body: { voteType, candidate }
        })
    }

    const addWantedMenu = (food: FoodSearchResult) => {
        voteCandidate('MENU', toMenuCandidate(food), 'PREFER')
    }

    const addMeetingPlace = (place: PlaceSearchResult) => {
        voteCandidate('AREA', toAreaCandidate(place), 'PICK')
    }

    const addRestaurant = (place: PlaceSearchResult) => {
        voteCandidate('RESTAURANT', toRestaurantCandidate(place), 'PICK')
    }

    return (
        <div className="flex flex-col gap-20 py-20">
            <section className="rounded-20 bg-white p-16">
                <h1 className="text-title2-semibold text-gray-8">
                    시간, 장소, 메뉴를 MealPlan 안에서 정해요.
                </h1>
                <p className="text-body2-medium text-gray-5">
                    기존 단계형 온보딩의 task graph와 선택 정책을
                    MealPlanDecisionWorkflow로 통합했습니다.
                </p>
            </section>
            <MealPlanDecisionWorkflowPanel
                mealPlanId={mealPlanId}
                progress={decisionProgress ?? data?.decisionProgress ?? null}
                isOwner={isOwner}
                permissions={permissions}
                viewerTaskReadyMap={currentMealPlan?.viewerTaskReadyMap}
            />
            <section className="rounded-20 flex flex-col gap-14 bg-white p-16">
                <div>
                    <h2 className="text-body1-semibold text-gray-8">
                        검색으로 후보 추가
                    </h2>
                    <p className="text-caption-regular text-gray-5">
                        음식, 만날 장소, 식당 후보를 같은 검색 구조로
                        추가합니다. 각 검색 결과는 도메인 타입을 유지한 채 해당
                        stage 후보로 변환됩니다.
                    </p>
                </div>
                <FoodSearchField
                    label="오늘 먹고 싶은 메뉴 추가"
                    placeholder="메뉴 검색"
                    helperText="선택한 메뉴는 MENU 단계에 선호 투표로 추가됩니다."
                    onSelect={addWantedMenu}
                />
                <PlaceSearchField
                    label="만날 장소 추가 검색"
                    placeholder="역, 동네, 만날 지점 검색"
                    helperText="선택한 장소는 AREA 단계 후보로 추가됩니다."
                    selectedName={
                        currentMealPlan?.selectedArea?.placeName ?? null
                    }
                    onSelect={addMeetingPlace}
                />
                <PlaceSearchField
                    label="식당 검색"
                    placeholder="식당 이름 검색"
                    helperText="선택한 식당은 RESTAURANT 단계 후보로 추가됩니다."
                    context={
                        currentMealPlan?.selectedArea
                            ? {
                                  latitude: currentMealPlan.selectedArea
                                      .lat as number,
                                  longitude: currentMealPlan.selectedArea
                                      .lng as number,
                                  radius: 1000,
                                  sort: 'distance'
                              }
                            : undefined
                    }
                    selectedName={
                        currentMealPlan?.selectedRestaurant?.placeName ?? null
                    }
                    onSelect={addRestaurant}
                />
            </section>
            {stages.length === 0 ? (
                <div className="rounded-20 text-caption-regular text-gray-5 bg-white p-18">
                    아직 열린 결정 단계가 없습니다.
                </div>
            ) : (
                stages.map(stage => (
                    <MealPlanDecisionStageCard
                        key={stage.stageId}
                        mealPlanId={mealPlanId}
                        stage={stage}
                        canVote={permissions?.canVote}
                        canComplete={permissions?.canConfirmDecisionSnapshot}
                    />
                ))
            )}
            <MealPlanReadyBar
                mealPlanId={mealPlanId}
                readyCount={readyCount}
                participantCount={participantCount}
                isSelfReady={isSelfReady}
                status={storeCurrent?.status ?? data?.status}
                canReady={permissions?.canReadyMealPlan}
                canConfirm={permissions?.canConfirmMealPlan}
            />
        </div>
    )
}
