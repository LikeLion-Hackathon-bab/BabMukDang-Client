/**
 * Chat header — collaboration at a glance: ready meter + per-participant status
 * pills (준비됨 / 참여 중 / 미참여).
 */
import { Card, Pill, ReadyMeter, type Tone } from './atoms'
import { useDecisionStages } from './useDecisionStages'
import { useMealPlanStore } from '@/store'

const STATUS_PILL: Record<string, { tone: Tone; label: string }> = {
    READY: { tone: 'green', label: '준비됨' },
    JOINED: { tone: 'yellow', label: '참여 중' },
    INVITED: { tone: 'gray', label: '미참여' },
    REQUESTED: { tone: 'gray', label: '대기' }
}

export function ParticipantStatusCard() {
    const participants = useMealPlanStore(state => state.participants)
    const { readyCount, participantCount, participants: people } =
        useDecisionStages()
    const shown = participants.filter(
        p => !['LEFT', 'REMOVED', 'DECLINED'].includes(p.status)
    )

    return (
        <Card tint pad={12} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ReadyMeter
                ready={readyCount}
                total={participantCount}
                people={people}
            />
            <div className="flex flex-wrap" style={{ gap: 6 }}>
                {shown.map(p => {
                    const meta = STATUS_PILL[p.status] ?? STATUS_PILL.JOINED
                    const name =
                        p.member?.username ?? p.guest?.nickname ?? '게스트'
                    return (
                        <Pill
                            key={p.participantId}
                            tone={meta.tone}
                            dot={meta.tone !== 'gray'}>
                            {name} {meta.label}
                        </Pill>
                    )
                })}
            </div>
        </Card>
    )
}
