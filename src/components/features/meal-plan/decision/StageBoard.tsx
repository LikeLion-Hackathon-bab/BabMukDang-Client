/**
 * Decision entry — status board. Shows all five stages at once as a 2-column
 * grid; stages progress independently. Tapping a tile routes into that stage.
 */
import { useNavigate } from 'react-router-dom'
import { Card, ReadyMeter, type AvatarPerson } from './atoms'
import { CheckGlyph, Glyph, LockGlyph, type GlyphName } from './glyphs'
import {
    type BoardState,
    type StageKey,
    type StageView
} from './useDecisionStages'

const STAGE_ICON: Record<StageKey, GlyphName> = {
    date: 'calendar',
    time: 'time',
    area: 'location',
    menu: 'dish',
    restaurant: 'meeting'
}

function StageTile({
    stage,
    mealPlanId
}: {
    stage: StageView
    mealPlanId: string
}) {
    const navigate = useNavigate()
    const s: BoardState = stage.boardState
    const live = s === 'live'
    const decided = s === 'decided'
    const locked = s === 'locked'
    const pickers: AvatarPerson[] = stage.candidates.flatMap(c => c.pickers)

    return (
        <button
            type="button"
            disabled={locked}
            onClick={() =>
                navigate(`/meal-plans/${mealPlanId}/decision/${stage.key}`)
            }
            style={{
                width: 'calc(50% - 5px)',
                textAlign: 'left',
                background: live
                    ? 'var(--color-primary-100)'
                    : 'var(--color-white)',
                border: live
                    ? '1px solid var(--color-primary-300)'
                    : '1px solid transparent',
                borderRadius: 'var(--radius-lg)',
                boxShadow: live ? 'none' : '0 2px 10px rgba(153,153,153,0.1)',
                padding: 13,
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                gap: 9,
                opacity: locked ? 0.7 : 1,
                minHeight: 112
            }}>
            <div className="flex items-center justify-between">
                <div className="flex items-center" style={{ gap: 6 }}>
                    <Glyph
                        name={STAGE_ICON[stage.key]}
                        size={17}
                        color={
                            live
                                ? 'var(--color-primary-main)'
                                : 'var(--color-gray-5)'
                        }
                    />
                    <span
                        style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: 'var(--color-gray-8)'
                        }}>
                        {stage.label}
                    </span>
                </div>
                {locked ? (
                    <LockGlyph size={13} color="var(--color-gray-3)" />
                ) : (
                    <span
                        style={{
                            width: 7,
                            height: 7,
                            borderRadius: 9999,
                            background: decided
                                ? '#1f8a5b'
                                : live
                                  ? 'var(--color-primary-main)'
                                  : 'var(--color-gray-3)'
                        }}
                    />
                )}
            </div>
            <div style={{ flex: 1 }}>
                {decided && (
                    <div className="flex items-center" style={{ gap: 5 }}>
                        <CheckGlyph size={14} color="#1f8a5b" />
                        <span
                            style={{
                                fontSize: 13.5,
                                fontWeight: 700,
                                color: 'var(--color-gray-8)'
                            }}>
                            {stage.selectedLabel ?? '정해짐'}
                        </span>
                    </div>
                )}
                {live && (
                    <div className="flex flex-col" style={{ gap: 7 }}>
                        <span
                            style={{
                                fontSize: 12.5,
                                fontWeight: 700,
                                color: stage.tie
                                    ? 'var(--color-primary-main)'
                                    : 'var(--color-gray-6)'
                            }}>
                            {stage.tie
                                ? '동률'
                                : `${stage.candidates.length}개 후보`}
                        </span>
                        <AvatarRow people={pickers} />
                    </div>
                )}
                {s === 'open' && (
                    <span
                        style={{
                            fontSize: 12,
                            color: 'var(--color-gray-5)',
                            lineHeight: 1.45
                        }}>
                        아무때나 같이 골라요
                    </span>
                )}
                {locked && (
                    <span
                        style={{
                            fontSize: 12,
                            color: 'var(--color-gray-4)',
                            lineHeight: 1.45
                        }}>
                        지역이 정해지면 열려요
                    </span>
                )}
            </div>
            <span
                style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: decided
                        ? '#1f8a5b'
                        : live
                          ? 'var(--color-primary-main)'
                          : locked
                            ? 'var(--color-gray-3)'
                            : 'var(--color-gray-5)'
                }}>
                {decided
                    ? '바꾸기'
                    : live
                      ? '투표하기 ▸'
                      : locked
                        ? '대기 중'
                        : '시작하기 ▸'}
            </span>
        </button>
    )
}

function AvatarRow({ people }: { people: AvatarPerson[] }) {
    const unique = people.slice(0, 4)
    if (unique.length === 0)
        return (
            <span style={{ fontSize: 11.5, color: 'var(--color-gray-4)' }}>
                아직 표가 없어요
            </span>
        )
    return (
        <div className="flex items-center">
            {unique.map((p, i) => (
                <div
                    key={i}
                    style={{
                        marginLeft: i ? -6 : 0,
                        width: 20,
                        height: 20,
                        borderRadius: 9999,
                        display: 'grid',
                        placeItems: 'center',
                        background: 'var(--color-gray-2)',
                        color: 'var(--color-gray-6)',
                        fontSize: 9,
                        fontWeight: 700,
                        boxShadow: '0 0 0 2px var(--color-white)'
                    }}>
                    {(p.name ?? '?')[0]}
                </div>
            ))}
        </div>
    )
}

export function StageBoard({
    mealPlanId,
    stages,
    readyCount,
    participantCount,
    participants
}: {
    mealPlanId: string
    stages: StageView[]
    readyCount: number
    participantCount: number
    participants: AvatarPerson[]
}) {
    const navigate = useNavigate()
    const liveStages = stages.filter(s => s.boardState === 'live')
    const allDecided = stages
        .filter(s => s.key !== 'restaurant' || s.boardState !== 'locked')
        .every(s => s.boardState === 'decided')

    return (
        <div className="flex flex-col" style={{ padding: 16, gap: 13 }}>
            <div>
                <div
                    style={{
                        fontSize: 19,
                        fontWeight: 700,
                        color: 'var(--color-gray-8)'
                    }}>
                    {liveStages.length > 0
                        ? `지금 ${liveStages.length}가지를 함께 정하는 중`
                        : '밥약 단계를 정해볼까요'}
                </div>
                <div
                    style={{
                        fontSize: 13,
                        color: 'var(--color-gray-5)',
                        marginTop: 4,
                        lineHeight: 1.5
                    }}>
                    단계는 순서 없이 동시에 진행돼요. 아무거나 먼저 정해도
                    괜찮아요.
                </div>
            </div>
            <Card tint pad={12}>
                <ReadyMeter
                    ready={readyCount}
                    total={participantCount}
                    people={participants}
                />
            </Card>
            <div className="flex flex-wrap" style={{ gap: 10 }}>
                {stages.map(stage => (
                    <StageTile
                        key={stage.key}
                        stage={stage}
                        mealPlanId={mealPlanId}
                    />
                ))}
            </div>
            {allDecided && (
                <button
                    type="button"
                    onClick={() =>
                        navigate(`/meal-plans/${mealPlanId}/decision/final`)
                    }
                    style={{
                        height: 48,
                        borderRadius: 9999,
                        border: 'none',
                        background: 'var(--color-primary-main)',
                        color: '#fff',
                        fontSize: 15,
                        fontWeight: 700
                    }}>
                    최종 확정으로 →
                </button>
            )}
        </div>
    )
}
