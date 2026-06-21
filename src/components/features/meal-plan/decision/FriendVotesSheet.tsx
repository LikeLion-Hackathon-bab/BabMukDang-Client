/**
 * Per-friend votes for the active stage — who picked what, at a glance. Opened
 * from the footer's friend button. Reads raw votes from the store and groups
 * them by participant.
 */
import type { MealPlanDecisionStageType } from '@kimdaegyu/babmukdang-shared/domain'
import { useMealPlanStore } from '@/store'
import { DecisionSheet } from './DecisionSheet'
import { Avatar, Card, Pill, RoleChip } from './atoms'
import { candidateLabel } from './useDecisionStages'

const STAGE_KO: Record<MealPlanDecisionStageType, string> = {
    DATE: '날짜',
    TIME: '시간',
    AREA: '지역',
    MENU: '메뉴',
    RESTAURANT: '식당',
    FINAL_CONFIRMATION: '확정'
}

export function FriendVotesSheet({
    stageType,
    onClose
}: {
    stageType: MealPlanDecisionStageType
    onClose: () => void
}) {
    const decisionStages = useMealPlanStore(state => state.decisionStages)
    const participants = useMealPlanStore(state => state.participants)
    const stage = decisionStages.find(s => s.stageType === stageType)
    const active = participants.filter(p =>
        ['JOINED', 'READY'].includes(p.status)
    )

    const picksFor = (memberId?: string, guestId?: string) => {
        if (!stage) return []
        return stage.votes
            .filter(v => v.voteType !== 'EXCLUDE')
            .filter(v =>
                memberId
                    ? v.voterId != null && String(v.voterId) === memberId
                    : guestId
                      ? v.guestId === guestId
                      : false
            )
            .map(v => candidateLabel(v.candidate))
    }

    return (
        <DecisionSheet
            title={`친구별 투표 · ${STAGE_KO[stageType]}`}
            hint="이 단계에서 누가 무엇을 골랐는지 한눈에 봐요."
            onClose={onClose}>
            <Card pad={4} style={{ padding: '2px 14px' }}>
                {active.map((p, idx) => {
                    const name =
                        p.member?.username ?? p.guest?.nickname ?? '게스트'
                    const picks = picksFor(
                        p.member ? String(p.member.memberId) : undefined,
                        p.guest?.guestId
                    )
                    const ready = p.status === 'READY'
                    return (
                        <div key={p.participantId}>
                            {idx > 0 && (
                                <div
                                    style={{
                                        height: 1,
                                        background: 'var(--color-gray-1)'
                                    }}
                                />
                            )}
                            <div
                                className="flex items-start"
                                style={{ gap: 11, padding: '11px 0' }}>
                                <Avatar
                                    person={{
                                        name,
                                        imageUrl: p.member?.profileImageUrl,
                                        ready
                                    }}
                                    size={36}
                                    ring={ready}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                        className="flex items-center"
                                        style={{ gap: 6 }}>
                                        <span
                                            style={{
                                                fontSize: 14,
                                                fontWeight: 700,
                                                color: 'var(--color-gray-8)'
                                            }}>
                                            {name}
                                        </span>
                                        <RoleChip role={p.role} />
                                        {ready && (
                                            <Pill tone="green" dot>
                                                준비됨
                                            </Pill>
                                        )}
                                    </div>
                                    <div
                                        className="flex flex-wrap"
                                        style={{ gap: 6, marginTop: 7 }}>
                                        {picks.length === 0 ? (
                                            <span
                                                style={{
                                                    fontSize: 12,
                                                    color: 'var(--color-gray-4)'
                                                }}>
                                                아직 투표 안 했어요
                                            </span>
                                        ) : (
                                            picks.map((label, i) => (
                                                <span
                                                    key={i}
                                                    style={{
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        color: 'var(--color-gray-7)',
                                                        background:
                                                            'var(--color-gray-1)',
                                                        borderRadius: 9999,
                                                        padding: '4px 10px'
                                                    }}>
                                                    {label}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </Card>
        </DecisionSheet>
    )
}
