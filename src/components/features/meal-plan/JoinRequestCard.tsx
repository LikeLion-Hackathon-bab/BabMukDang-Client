import type { MealPlanJoinRequestSummary } from '@/apis/types'

type Props = {
    request: MealPlanJoinRequestSummary
    disabled?: boolean
    onAccept: (requestId: string) => void
    onReject: (requestId: string) => void
}

export function JoinRequestCard({
    request,
    disabled,
    onAccept,
    onReject
}: Props) {
    return (
        <article className="rounded-16 border border-gray-2 p-12">
            <div className="flex items-start justify-between gap-12">
                <div>
                    <p className="text-body2-semibold text-gray-8">
                        {request.requester.username}
                    </p>
                    <p className="text-caption-regular text-gray-5">
                        {request.message || '메시지 없이 참여를 요청했어요.'}
                    </p>
                </div>
                <span className="rounded-20 bg-primary-100 px-10 py-4 text-caption-medium text-primary-600">
                    요청 중
                </span>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8">
                <button
                    type="button"
                    data-testid={`meal-plan-join-request-accept-${request.joinRequestId}`}
                    disabled={disabled}
                    onClick={() => onAccept(request.joinRequestId)}
                    className="rounded-24 bg-gray-8 py-9 text-caption-medium text-white disabled:opacity-40">
                    수락
                </button>
                <button
                    type="button"
                    data-testid={`meal-plan-join-request-reject-${request.joinRequestId}`}
                    disabled={disabled}
                    onClick={() => onReject(request.joinRequestId)}
                    className="rounded-24 bg-gray-2 py-9 text-caption-medium text-gray-7 disabled:opacity-40">
                    거절
                </button>
            </div>
        </article>
    )
}
