/**
 * Per-stage voting bodies. Each consumes a derived StageView and casts real
 * votes via useMealPlanDecisionVote. Data-shape-specific UI per the redesign:
 * date = calendar heatmap, time = slot poll, area = map + tie, menu = food cards
 * with exclude tray, restaurant = area-dependent recommendations.
 */
import type { MealPlanDecisionCandidate } from '@kimdaegyu/babmukdang-shared/domain'
import { useMealPlanDecisionVote } from '@/socket/useMealPlanDecisionVote'
import {
    AvatarStack,
    Card,
    DependencyHint,
    InlineBanner,
    Pill,
    SectionLabel,
    SourceLabel,
    FoodTile,
    VoteControls
} from './atoms'
import { CheckGlyph, Glyph } from './glyphs'
import type { CandidateView, StageView } from './useDecisionStages'

type VoteFn = (candidate: MealPlanDecisionCandidate, type: 'PICK' | 'PREFER' | 'EXCLUDE') => void

function useStageVote(mealPlanId: string, stage: StageView, canVote: boolean) {
    const { mutate, isPending } = useMealPlanDecisionVote()
    const cast: VoteFn = (candidate, voteType) => {
        if (!stage.stageId || !canVote || isPending) return
        mutate({ mealPlanId, stageId: stage.stageId, body: { voteType, candidate } })
    }
    return { cast, isPending }
}

function EmptyHint({ children }: { children: React.ReactNode }) {
    return (
        <Card pad={18}>
            <p
                style={{
                    fontSize: 12.5,
                    color: 'var(--color-gray-5)',
                    lineHeight: 1.5,
                    textAlign: 'center'
                }}>
                {children}
            </p>
        </Card>
    )
}

type PanelProps = {
    mealPlanId: string
    stage: StageView
    canVote: boolean
}

/* ---------- title ---------- */
export function StageTitle({ stage, desc }: { stage: string; desc: string }) {
    return (
        <div>
            <div
                style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: 'var(--color-gray-8)'
                }}>
                <span style={{ color: 'var(--color-primary-main)' }}>
                    {stage}
                </span>{' '}
                정하는 중
            </div>
            <div
                style={{
                    fontSize: 13,
                    color: 'var(--color-gray-5)',
                    marginTop: 3,
                    lineHeight: 1.5
                }}>
                {desc}
            </div>
        </div>
    )
}

/* ====================================================================== */
/*  DATE — calendar heatmap + ranked candidate days                        */
/* ====================================================================== */
export function DateVotePanel({ mealPlanId, stage, canVote }: PanelProps) {
    const { cast } = useStageVote(mealPlanId, stage, canVote)
    const dated = stage.candidates
        .map(c => ({
            cand: c,
            iso: c.candidate.stageType === 'DATE' ? c.candidate.value : ''
        }))
        .filter(d => d.iso)
    const ranked = [...stage.candidates].sort((a, b) => b.voteCount - a.voteCount)
    const maxVotes = Math.max(0, ...stage.candidates.map(c => c.voteCount))

    const base = dated[0] ? new Date(`${dated[0].iso}T00:00:00`) : new Date()
    const year = base.getFullYear()
    const month = base.getMonth()
    const firstDow = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const voteByDay = new Map<number, number>()
    for (const d of dated) {
        const day = new Date(`${d.iso}T00:00:00`).getDate()
        voteByDay.set(day, d.cand.voteCount)
    }

    return (
        <>
            <StageTitle
                stage="날짜"
                desc="다 같이 되는 날에 표를 모아요. 색이 진할수록 가능한 사람이 많아요."
            />
            <Card pad={14}>
                <div
                    className="flex items-center justify-between"
                    style={{ marginBottom: 12 }}>
                    <span
                        style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: 'var(--color-gray-8)'
                        }}>
                        {month + 1}월
                    </span>
                    <span
                        style={{
                            fontSize: 11.5,
                            color: 'var(--color-gray-4)',
                            fontWeight: 600
                        }}>
                        색이 진할수록 가능한 사람이 많아요
                    </span>
                </div>
                <div
                    className="grid"
                    style={{
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: 5,
                        textAlign: 'center'
                    }}>
                    {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                        <span
                            key={d}
                            style={{
                                fontSize: 10.5,
                                fontWeight: 700,
                                color: 'var(--color-gray-4)',
                                paddingBottom: 4
                            }}>
                            {d}
                        </span>
                    ))}
                    {Array.from({ length: firstDow }).map((_, i) => (
                        <span key={`e${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, idx) => {
                        const day = idx + 1
                        const v = voteByDay.get(day) ?? 0
                        const isLead = v > 0 && v === maxVotes
                        const bg =
                            v === 0
                                ? 'transparent'
                                : `color-mix(in srgb, var(--color-primary-main) ${20 + v * 18}%, white)`
                        const fg =
                            v >= 3
                                ? '#fff'
                                : v > 0
                                  ? 'var(--color-primary-main)'
                                  : 'var(--color-gray-6)'
                        return (
                            <div
                                key={day}
                                style={{
                                    aspectRatio: '1',
                                    borderRadius: 9999,
                                    display: 'grid',
                                    placeItems: 'center',
                                    background: bg,
                                    border: isLead
                                        ? '2px solid var(--color-primary-main)'
                                        : 'none'
                                }}>
                                <span
                                    style={{
                                        fontSize: 12.5,
                                        fontWeight: v ? 700 : 500,
                                        color: fg
                                    }}>
                                    {day}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </Card>
            <SectionLabel
                right={
                    <span
                        style={{
                            fontSize: 10.5,
                            color: 'var(--color-gray-4)',
                            fontWeight: 600
                        }}>
                        표 많은 순
                    </span>
                }>
                후보 날짜
            </SectionLabel>
            {ranked.length === 0 && (
                <EmptyHint>아직 후보 날짜가 없어요. 가능한 날을 제안해 주세요.</EmptyHint>
            )}
            {ranked.map(c => (
                <CandidatePickRow
                    key={c.key}
                    cand={c}
                    lead={c.voteCount > 0 && c.voteCount === maxVotes}
                    metaSuffix={`${c.voteCount}표`}
                    onPick={() => cast(c.candidate, 'PICK')}
                />
            ))}
        </>
    )
}

/* shared pick-only row used by date / area */
function CandidatePickRow({
    cand,
    lead,
    metaSuffix,
    leftIcon,
    onPick
}: {
    cand: CandidateView
    lead?: boolean
    metaSuffix?: string
    leftIcon?: React.ReactNode
    onPick: () => void
}) {
    return (
        <Card
            selected={cand.myState === 'pick'}
            pad={12}
            style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            {leftIcon}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-center" style={{ gap: 6 }}>
                    <span
                        style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: 'var(--color-gray-8)'
                        }}>
                        {cand.label}
                    </span>
                    {lead && <Pill tone="orange">최다</Pill>}
                    {cand.source && <SourceLabel source={cand.source} />}
                </div>
                <div
                    className="flex items-center"
                    style={{ gap: 7, marginTop: 4 }}>
                    <AvatarStack people={cand.pickers} size={18} max={4} />
                    <span
                        style={{
                            fontSize: 11.5,
                            color: 'var(--color-gray-5)',
                            fontWeight: 600
                        }}>
                        {metaSuffix ?? `${cand.voteCount}표`}
                    </span>
                </div>
            </div>
            <VoteControls
                state={cand.myState}
                pickOnly
                onPick={onPick}
            />
        </Card>
    )
}

/* ====================================================================== */
/*  TIME — slot poll                                                        */
/* ====================================================================== */
export function TimeVotePanel({ mealPlanId, stage, canVote }: PanelProps) {
    const { cast } = useStageVote(mealPlanId, stage, canVote)
    const ranked = [...stage.candidates].sort((a, b) => b.voteCount - a.voteCount)
    const max = Math.max(1, ...stage.candidates.map(c => c.voteCount))

    return (
        <>
            <StageTitle
                stage="시간"
                desc="편한 시간대를 골라요. 표가 가장 많은 시간으로 정해져요."
            />
            {ranked.length === 0 && (
                <EmptyHint>아직 시간 후보가 없어요. 가능한 시간대를 추가해 주세요.</EmptyHint>
            )}
            <Card pad={12} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ranked.map(c => {
                    const sel = c.myState === 'pick'
                    const pct = Math.round((c.voteCount / max) * 100)
                    return (
                        <button
                            key={c.key}
                            type="button"
                            onClick={() => cast(c.candidate, 'PICK')}
                            style={{
                                position: 'relative',
                                borderRadius: 'var(--radius-md)',
                                overflow: 'hidden',
                                border: sel
                                    ? '1px solid var(--color-primary-main)'
                                    : '1px solid var(--color-gray-2)',
                                background: 'transparent',
                                padding: 0,
                                textAlign: 'left'
                            }}>
                            <div
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: `${pct}%`,
                                    background: sel
                                        ? 'var(--color-primary-100)'
                                        : 'var(--color-gray-1)'
                                }}
                            />
                            <div
                                className="flex items-center"
                                style={{
                                    position: 'relative',
                                    padding: '11px 13px',
                                    gap: 9
                                }}>
                                <span
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 700,
                                        color: 'var(--color-gray-8)',
                                        flex: 1
                                    }}>
                                    {c.label}
                                </span>
                                <AvatarStack
                                    people={c.pickers}
                                    size={17}
                                    max={4}
                                />
                                <span
                                    style={{
                                        fontSize: 11.5,
                                        fontWeight: 700,
                                        color: sel
                                            ? 'var(--color-primary-main)'
                                            : 'var(--color-gray-5)'
                                    }}>
                                    {c.voteCount}
                                </span>
                                {sel && (
                                    <CheckGlyph
                                        size={15}
                                        color="var(--color-primary-main)"
                                    />
                                )}
                            </div>
                        </button>
                    )
                })}
            </Card>
        </>
    )
}

/* ====================================================================== */
/*  AREA — map preview + neighborhood list + tie banner                    */
/* ====================================================================== */
export function AreaVotePanel({
    mealPlanId,
    stage,
    canVote,
    mapSlot
}: PanelProps & { mapSlot?: React.ReactNode }) {
    const { cast } = useStageVote(mealPlanId, stage, canVote)
    const ranked = [...stage.candidates].sort((a, b) => b.voteCount - a.voteCount)
    const max = Math.max(0, ...stage.candidates.map(c => c.voteCount))

    return (
        <>
            <StageTitle
                stage="지역"
                desc="만나기 좋은 동네에 표를 모아요. 표가 모이면 그 지역으로 정해져요."
            />
            {mapSlot}
            {stage.tie && (
                <InlineBanner
                    tone="orange"
                    icon="people"
                    title="동률이에요"
                    body="한 표가 더 모이거나 소유자가 정하면 넘어가요."
                />
            )}
            {ranked.length === 0 && (
                <EmptyHint>아직 지역 후보가 없어요. 검색해서 후보로 올려보세요.</EmptyHint>
            )}
            {ranked.map(c => (
                <CandidatePickRow
                    key={c.key}
                    cand={c}
                    lead={!stage.tie && c.voteCount > 0 && c.voteCount === max}
                    leftIcon={
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 10,
                                flex: 'none',
                                background: 'var(--color-primary-100)',
                                display: 'grid',
                                placeItems: 'center'
                            }}>
                            <Glyph
                                name="location"
                                size={18}
                                color="var(--color-primary-main)"
                            />
                        </div>
                    }
                    onPick={() => cast(c.candidate, 'PICK')}
                />
            ))}
        </>
    )
}

/* ====================================================================== */
/*  MENU — food cards (taste-aware) + exclude tray                         */
/* ====================================================================== */
export function MenuVotePanel({ mealPlanId, stage, canVote }: PanelProps) {
    const { cast } = useStageVote(mealPlanId, stage, canVote)
    // taste-aware ordering: my-preference candidates first, then by votes
    const visible = stage.candidates
        .filter(c => c.myState !== 'excluded' && c.excludeCount === 0)
        .sort((a, b) => {
            if (a.isMine !== b.isMine) return a.isMine ? -1 : 1
            return b.voteCount - a.voteCount
        })
    const excluded = stage.candidates.filter(
        c => c.myState === 'excluded' || c.excludeCount > 0
    )

    return (
        <>
            <StageTitle
                stage="메뉴"
                desc="참여자 취향(좋아요·못먹어요)을 반영해 정렬했어요."
            />
            {visible.length === 0 && (
                <EmptyHint>아직 메뉴 후보가 없어요. AI 추천·검색으로 후보를 올려보세요.</EmptyHint>
            )}
            {visible.map(c => (
                <Card
                    key={c.key}
                    selected={c.myState === 'pick'}
                    pad={11}
                    style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
                    <FoodTile
                        category={c.category ?? 'default'}
                        label={c.label}
                        size={48}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex items-center" style={{ gap: 6 }}>
                            <span
                                style={{
                                    fontSize: 15,
                                    fontWeight: 700,
                                    color: 'var(--color-gray-8)'
                                }}>
                                {c.label}
                            </span>
                            {c.source && <SourceLabel source={c.source} />}
                        </div>
                        <div
                            className="flex items-center"
                            style={{ gap: 7, marginTop: 3 }}>
                            <AvatarStack people={c.pickers} size={18} max={3} />
                            <span
                                style={{
                                    fontSize: 11.5,
                                    color: 'var(--color-gray-5)',
                                    fontWeight: 600
                                }}>
                                {c.voteCount}명 선택
                            </span>
                            {c.isMine && (
                                <span
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: 'var(--color-primary-main)'
                                    }}>
                                    · 내 취향
                                </span>
                            )}
                        </div>
                    </div>
                    <VoteControls
                        state={c.myState}
                        onPrefer={() => cast(c.candidate, 'PREFER')}
                        onPick={() => cast(c.candidate, 'PICK')}
                        onExclude={() => cast(c.candidate, 'EXCLUDE')}
                    />
                </Card>
            ))}
            {excluded.length > 0 && (
                <div
                    style={{
                        background: 'var(--color-gray-1)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '11px 13px'
                    }}>
                    <div className="flex items-center justify-between">
                        <span
                            style={{
                                fontSize: 12.5,
                                fontWeight: 700,
                                color: 'var(--color-gray-5)'
                            }}>
                            못먹어요로 제외된 후보 {excluded.length}
                        </span>
                    </div>
                    <div
                        className="flex flex-wrap"
                        style={{ gap: 8, marginTop: 10 }}>
                        {excluded.map(c => (
                            <button
                                key={c.key}
                                type="button"
                                onClick={() => cast(c.candidate, 'EXCLUDE')}
                                className="flex items-center"
                                style={{
                                    gap: 6,
                                    opacity: 0.6,
                                    background: 'none',
                                    border: 'none'
                                }}>
                                <FoodTile
                                    category={c.category ?? 'default'}
                                    label={c.label}
                                    size={28}
                                    excluded
                                />
                                <span
                                    style={{
                                        fontSize: 12,
                                        color: 'var(--color-gray-5)',
                                        textDecoration: 'line-through'
                                    }}>
                                    {c.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}

/* ====================================================================== */
/*  RESTAURANT — area-dependent recommendations                            */
/* ====================================================================== */
export function RestaurantVotePanel({
    mealPlanId,
    stage,
    canVote,
    areaName,
    menuName,
    areaDecided
}: PanelProps & {
    areaName?: string
    menuName?: string
    areaDecided: boolean
}) {
    const { cast } = useStageVote(mealPlanId, stage, canVote)
    const ranked = [...stage.candidates].sort((a, b) => b.voteCount - a.voteCount)

    if (!areaDecided) {
        return (
            <>
                <div
                    style={{
                        fontSize: 21,
                        fontWeight: 700,
                        color: 'var(--color-gray-8)',
                        lineHeight: 1.32
                    }}>
                    식당은{' '}
                    <span style={{ color: 'var(--color-gray-3)' }}>
                        아직 닫혀 있어요
                    </span>
                </div>
                <InlineBanner
                    tone="blue"
                    icon="location"
                    title="지역이 정해지면 식당 추천이 열려요"
                    body="지금 정하는 ‘지역’ 근처 식당만 추천하기 때문이에요. 지역부터 함께 정해볼까요?"
                />
                <DependencyHint>
                    식당은 지역이 정해지면 자동으로 열려요.
                </DependencyHint>
            </>
        )
    }

    return (
        <>
            <StageTitle
                stage="식당"
                desc="정해진 지역·메뉴를 바탕으로 추천했어요."
            />
            <div className="flex flex-wrap items-center" style={{ gap: 6 }}>
                {areaName && (
                    <Pill tone="green" dot>
                        {areaName}
                    </Pill>
                )}
                {menuName && (
                    <Pill tone="green" dot>
                        {menuName}
                    </Pill>
                )}
                <span
                    style={{
                        fontSize: 11.5,
                        color: 'var(--color-gray-4)'
                    }}>
                    기준으로 추천 중
                </span>
            </div>
            {ranked.length === 0 && (
                <EmptyHint>아직 식당 후보가 없어요. 식당을 검색해 후보로 올려보세요.</EmptyHint>
            )}
            {ranked.map(c => (
                <Card
                    key={c.key}
                    selected={c.myState === 'pick'}
                    pad={11}
                    style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div className="flex items-center" style={{ gap: 11 }}>
                        <FoodTile
                            category={c.category ?? 'default'}
                            label={c.label}
                            size={48}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                                className="flex items-center"
                                style={{ gap: 6 }}>
                                <span
                                    style={{
                                        fontSize: 15,
                                        fontWeight: 700,
                                        color: 'var(--color-gray-8)'
                                    }}>
                                    {c.label}
                                </span>
                                {c.category && (
                                    <span
                                        style={{
                                            fontSize: 11,
                                            color: 'var(--color-gray-3)',
                                            fontWeight: 600
                                        }}>
                                        {c.category}
                                    </span>
                                )}
                            </div>
                            {c.source && (
                                <div style={{ marginTop: 4 }}>
                                    <SourceLabel source={c.source} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div
                        className="flex items-center"
                        style={{
                            gap: 9,
                            paddingTop: 8,
                            borderTop: '1px solid var(--color-gray-1)'
                        }}>
                        <AvatarStack people={c.pickers} size={18} max={3} />
                        <span
                            style={{
                                fontSize: 11.5,
                                color: 'var(--color-gray-5)',
                                fontWeight: 600
                            }}>
                            {c.voteCount}명 선택
                        </span>
                        <div style={{ marginLeft: 'auto' }}>
                            <VoteControls
                                state={c.myState}
                                pickOnly
                                onPick={() => cast(c.candidate, 'PICK')}
                            />
                        </div>
                    </div>
                </Card>
            ))}
        </>
    )
}
