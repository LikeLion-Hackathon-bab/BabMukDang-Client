import { useMemo, useState } from 'react'
import { toMemberId, type MealPlanInviteSummary, type MealPlanParticipantResponse } from '@kimdaegyu/babmukdang-shared/domain'
import { useSendMealPlanInvite } from '@/apis'
import { FriendSearchField } from '@/components/features/search'
import type { FriendSearchResult } from '@/services/search'

export function MealPlanInvitePanel({
    mealPlanId,
    participants = [],
    pendingInvites = []
}: {
    mealPlanId: string
    participants?: MealPlanParticipantResponse[]
    pendingInvites?: MealPlanInviteSummary[]
}) {
    const [message, setMessage] = useState('같이 밥 먹자!')
    const { mutate, isPending } = useSendMealPlanInvite({
        onSuccess: () => setMessage('같이 밥 먹자!')
    })

    const invitedOrJoinedMemberIds = useMemo(() => {
        const ids = new Set<number>()
        for (const participant of participants) {
            const memberId = Number(participant.member?.memberId)
            if (Number.isFinite(memberId)) ids.add(memberId)
        }
        for (const invite of pendingInvites) {
            const memberId = Number(invite.invitee.memberId)
            if (Number.isFinite(memberId)) ids.add(memberId)
        }
        return ids
    }, [participants, pendingInvites])

    const sendInvite = (friend: FriendSearchResult) => {
        const targetId = Number(friend.memberId)
        if (!Number.isFinite(targetId) || targetId <= 0) return
        if (invitedOrJoinedMemberIds.has(targetId) || isPending) return

        mutate({
            mealPlanId,
            body: {
                inviteeId: toMemberId(targetId),
                message
            }
        })
    }

    return (
        <section className="flex flex-col gap-12 rounded-20 bg-white p-16">
            <div>
                <h2 className="text-body1-semibold text-gray-8">친구 초대</h2>
                <p className="text-caption-regular text-gray-5">
                    친구 검색은 서버 결과를 신뢰합니다. 친구 관계, 차단 여부, 초대 가능 여부는 클라이언트에서 다시 판단하지 않습니다.
                </p>
            </div>
            <input
                className="rounded-12 bg-gray-1 px-12 py-10 text-body2-medium outline-none"
                data-testid="meal-plan-invite-message-input"
                value={message}
                onChange={event => setMessage(event.target.value)}
                placeholder="초대 메시지"
            />
            <FriendSearchField
                label="초대할 친구 검색"
                placeholder="닉네임이나 handle 검색"
                helperText="이미 참여했거나 초대된 친구는 선택할 수 없습니다."
                excludedMemberIds={[...invitedOrJoinedMemberIds]}
                onSelect={sendInvite}
            />
        </section>
    )
}
