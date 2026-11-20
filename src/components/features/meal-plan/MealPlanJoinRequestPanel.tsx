import type { MealPlanJoinRequestSummary } from '@/apis/types'
import {
    useAcceptMealPlanJoinRequest,
    useRejectMealPlanJoinRequest
} from '@/apis'
import { JoinRequestCard } from './JoinRequestCard'

type Props = {
    requests: MealPlanJoinRequestSummary[]
    canManageParticipants?: boolean
}

export function MealPlanJoinRequestPanel({
    requests,
    canManageParticipants
}: Props) {
    const { mutate: accept, isPending: isAccepting } =
        useAcceptMealPlanJoinRequest()
    const { mutate: reject, isPending: isRejecting } =
        useRejectMealPlanJoinRequest()

    if (!canManageParticipants || requests.length === 0) return null

    return (
        <section className="rounded-20 flex flex-col gap-12 bg-white p-16">
            <div>
                <h2 className="text-body1-semibold text-gray-8">
                    근처 친구 참여 요청
                </h2>
                <p className="text-caption-regular text-gray-5">
                    근처 친구 노출을 보고 들어온 요청입니다. 수락하면 같은 밥약 참여자로 추가됩니다.
                </p>
            </div>
            <div className="flex flex-col gap-10">
                {requests.map(request => (
                    <JoinRequestCard
                        key={request.joinRequestId}
                        request={request}
                        disabled={isAccepting || isRejecting}
                        onAccept={accept}
                        onReject={reject}
                    />
                ))}
            </div>
        </section>
    )
}
