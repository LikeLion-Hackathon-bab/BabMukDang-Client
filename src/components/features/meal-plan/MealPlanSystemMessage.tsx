import type { MealPlanChatMessageResponse } from '@kimdaegyu/babmukdang-shared/domain'

const systemMessageLabel = (message: MealPlanChatMessageResponse) => {
    const kind = message.systemPayload?.kind
    switch (kind) {
        case 'PARTICIPANT_JOINED':
            return '참여'
        case 'PARTICIPANT_READY':
            return 'Ready'
        case 'PARTICIPANT_REMOVED':
            return '제거'
        case 'STATUS_CHANGED':
            return '상태'
        case 'DECISION_UPDATED':
            return '결정'
        case 'CONFIRMED':
            return '확정'
        case 'RECORD_NEEDED':
            return '기록'
        default:
            return '시스템'
    }
}

export function MealPlanSystemMessage({
    message
}: {
    message: MealPlanChatMessageResponse
}) {
    return (
        <div className="flex justify-center">
            <span className="rounded-20 bg-gray-2 text-caption-regular text-gray-6 px-12 py-6">
                <span className="text-caption-medium text-gray-7">
                    {systemMessageLabel(message)}
                </span>
                <span className="mx-4">·</span>
                {message.message}
            </span>
        </div>
    )
}
