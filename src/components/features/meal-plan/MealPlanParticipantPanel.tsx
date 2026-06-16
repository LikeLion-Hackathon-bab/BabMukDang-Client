import type {
    MealPlanInviteSummary,
    MealPlanParticipantResponse
} from '@kimdaegyu/babmukdang-shared/domain'
import { useRemoveMealPlanParticipant } from '@/apis'

const participantName = (participant: MealPlanParticipantResponse) =>
    participant.member?.username ?? participant.guest?.nickname ?? '게스트'

export function MealPlanParticipantPanel({
    mealPlanId,
    participants,
    pendingInvites = [],
    canManageParticipants = false
}: {
    mealPlanId?: string
    participants: MealPlanParticipantResponse[]
    pendingInvites?: MealPlanInviteSummary[]
    canManageParticipants?: boolean
}) {
    const { mutate: removeParticipant, isPending: isRemoving } =
        useRemoveMealPlanParticipant()
    const activeParticipants = participants.filter(participant =>
        ['JOINED', 'READY'].includes(participant.status)
    )
    const invitedParticipants = participants.filter(
        participant => participant.status === 'INVITED'
    )

    return (
        <section className="flex flex-col gap-12">
            <h2 className="text-body1-semibold text-gray-8">
                참여자 {activeParticipants.length}명
            </h2>
            <div className="rounded-20 flex flex-col gap-10 bg-white p-16">
                {activeParticipants.length === 0 ? (
                    <span className="text-caption-regular text-gray-5">
                        아직 참여자가 없습니다.
                    </span>
                ) : (
                    activeParticipants.map(participant => (
                        <div
                            key={participant.participantId}
                            className="flex items-center justify-between gap-10">
                            <div className="flex min-w-0 items-center gap-10">
                                <div className="size-36 shrink-0 rounded-full bg-gray-2" />
                                <div className="flex min-w-0 flex-col">
                                    <span className="truncate text-body2-medium text-gray-8">
                                        {participantName(participant)}
                                    </span>
                                    <span className="text-caption-regular text-gray-5">
                                        {participant.role}
                                    </span>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-6">
                                <span className="rounded-20 bg-gray-1 px-10 py-5 text-caption-medium text-gray-6">
                                    {participant.status === 'READY' ? 'Ready' : '참여 중'}
                                </span>
                                {canManageParticipants &&
                                    mealPlanId &&
                                    participant.role !== 'OWNER' && (
                                        <button
                                            type="button"
                                            disabled={isRemoving}
                                            onClick={() =>
                                                removeParticipant({
                                                    mealPlanId,
                                                    participantId: participant.participantId
                                                })
                                            }
                                            className="rounded-20 bg-red-50 px-10 py-5 text-caption-medium text-red-600 disabled:opacity-40">
                                            제거
                                        </button>
                                    )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            {(invitedParticipants.length > 0 || pendingInvites.length > 0) && (
                <div className="rounded-20 flex flex-col gap-8 bg-white p-16">
                    <h3 className="text-body2-semibold text-gray-8">초대 대기</h3>
                    {invitedParticipants.map(participant => (
                        <div
                            key={participant.participantId}
                            className="flex items-center justify-between gap-10">
                            <span className="text-body2-medium text-gray-7">
                                {participantName(participant)}
                            </span>
                            <span className="rounded-20 bg-primary-100 px-10 py-5 text-caption-medium text-primary-600">
                                초대됨
                            </span>
                        </div>
                    ))}
                    {pendingInvites
                        .filter(
                            invite =>
                                !invitedParticipants.some(
                                    participant =>
                                        participant.member?.memberId === invite.invitee.memberId
                                )
                        )
                        .map(invite => (
                            <div
                                key={invite.inviteId}
                                className="flex items-center justify-between gap-10">
                                <span className="text-body2-medium text-gray-7">
                                    {invite.invitee.username}
                                </span>
                                <span className="rounded-20 bg-primary-100 px-10 py-5 text-caption-medium text-primary-600">
                                    초대됨
                                </span>
                            </div>
                        ))}
                </div>
            )}
        </section>
    )
}
