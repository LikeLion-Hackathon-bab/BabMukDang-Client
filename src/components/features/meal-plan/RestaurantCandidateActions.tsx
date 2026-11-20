import { Link } from '@/navigation'
import {
    useCompleteMealPlanStage,
    type MealMapMarker
} from '@/apis'
import { useMealPlanDecisionVote } from '@/socket/useMealPlanDecisionVote'
import type { MealPlanDecisionCandidate } from '@kimdaegyu/babmukdang-shared/domain'

type RestaurantCandidateMarker = Extract<
    MealMapMarker,
    { layer: 'RESTAURANT_CANDIDATE' }
>

const blockedReasonMessage: Record<string, string> = {
    OWNER_ONLY: '밥약 소유자만 식당 후보를 최종 선택할 수 있습니다.',
    STAGE_ALREADY_COMPLETED: '이미 완료된 식당 결정 단계입니다.',
    MEAL_PLAN_NOT_MUTABLE: '현재 상태에서는 식당 결정을 변경할 수 없습니다.'
}

const toRestaurantCandidate = (
    marker: RestaurantCandidateMarker
): MealPlanDecisionCandidate | null => {
    if (!marker.restaurant) return null
    return {
        stageType: 'RESTAURANT',
        value: {
            ...marker.restaurant,
            source: marker.metadata.source,
            createdAt: new Date().toISOString() as never
        }
    }
}

export function RestaurantCandidateActions({
    marker
}: {
    marker: MealMapMarker
}) {
    const { mutate: vote, isPending: isVotePending } = useMealPlanDecisionVote()
    const { mutate: completeStage, isPending: isCompletePending } =
        useCompleteMealPlanStage()

    if (marker.layer !== 'RESTAURANT_CANDIDATE') return null

    const candidate = toRestaurantCandidate(marker)
    const stageId = marker.metadata.stageId
    const canVote = Boolean(
        marker.mealPlanId &&
            stageId &&
            candidate &&
            marker.metadata.canVote
    )
    const canComplete = Boolean(
        marker.mealPlanId &&
            stageId &&
            candidate &&
            marker.metadata.canCompleteStage
    )
    const blockedReason = marker.metadata.completionBlockedReason
    const blockedMessage = blockedReason
        ? blockedReasonMessage[blockedReason] ??
          '현재 조건에서는 식당 후보를 최종 선택할 수 없습니다.'
        : null

    return (
        <div className="mt-4 flex flex-col gap-8">
            <div className="flex flex-wrap gap-8">
                <button
                    type="button"
                    disabled={!canVote || isVotePending}
                    onClick={event => {
                        event.preventDefault()
                        event.stopPropagation()
                        if (!marker.mealPlanId || !stageId || !candidate) return
                        vote({
                            mealPlanId: marker.mealPlanId,
                            stageId,
                            body: {
                                voteType: 'PICK',
                                candidate
                            }
                        })
                    }}
                    className="rounded-20 bg-gray-8 px-12 py-7 text-caption-medium text-white disabled:bg-gray-3 disabled:text-gray-5">
                    식당 후보 투표
                </button>
                <button
                    type="button"
                    disabled={!canComplete || isCompletePending}
                    onClick={event => {
                        event.preventDefault()
                        event.stopPropagation()
                        if (!marker.mealPlanId || !stageId || !candidate) return
                        completeStage({
                            mealPlanId: marker.mealPlanId,
                            stageId,
                            body: {
                                selectedCandidate: candidate
                            }
                        })
                    }}
                    className="rounded-20 bg-primary-main px-12 py-7 text-caption-medium text-white disabled:bg-gray-3 disabled:text-gray-5">
                    선택 완료
                </button>
                {marker.href && (
                    <Link
                        to={marker.href}
                        className="rounded-20 border border-gray-3 px-12 py-7 text-caption-medium text-gray-7">
                        결정 화면에서 보기
                    </Link>
                )}
            </div>
            {blockedMessage && (
                <p className="text-caption-regular text-gray-5">
                    {blockedMessage}
                </p>
            )}
        </div>
    )
}
