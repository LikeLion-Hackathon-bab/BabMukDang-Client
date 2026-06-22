/**
 * Confirmed-flow top nav. Free movement between stages — tapping a chip routes
 * to that stage's vote screen. Locked stages are non-navigable.
 */
import { useTabNavigation } from '@/navigation/useTabNavigation'
import { CheckGlyph, LockGlyph } from './glyphs'
import { STAGE_DEFS, type BoardState, type StageKey } from './useDecisionStages'

const DOT: Record<BoardState, string> = {
    decided: '#1f8a5b',
    live: 'var(--color-primary-main)',
    open: 'var(--color-gray-3)',
    locked: 'var(--color-gray-3)'
}

export function StageSwitcher({
    mealPlanId,
    active,
    states
}: {
    mealPlanId: string
    active: StageKey
    states: Record<StageKey, BoardState>
}) {
    const navigateTab = useTabNavigation()
    return (
        <div
            style={{
                flex: 'none',
                background: 'var(--color-white)',
                padding: '2px 0 11px',
                borderBottom: '1px solid var(--color-gray-1)'
            }}>
            <div
                className="flex"
                style={{ gap: 7, padding: '0 16px', overflowX: 'auto' }}>
                {STAGE_DEFS.map(def => {
                    const st = states[def.key]
                    const on = def.key === active
                    const locked = st === 'locked'
                    const decided = st === 'decided'
                    return (
                        <button
                            key={def.key}
                            type="button"
                            disabled={locked}
                            onClick={() =>
                                navigateTab(
                                    `/meal-plans/${mealPlanId}/decision/${def.key}`
                                )
                            }
                            className="inline-flex items-center"
                            style={{
                                gap: 6,
                                padding: '7px 12px',
                                borderRadius: 9999,
                                whiteSpace: 'nowrap',
                                flex: 'none',
                                background: on
                                    ? 'var(--color-primary-main)'
                                    : 'var(--color-white)',
                                border: on
                                    ? 'none'
                                    : '1px solid var(--color-gray-2)',
                                boxShadow: on
                                    ? 'none'
                                    : '0 2px 10px rgba(153,153,153,0.1)',
                                opacity: locked ? 0.5 : 1
                            }}>
                            {locked ? (
                                <LockGlyph
                                    size={12}
                                    color="var(--color-gray-3)"
                                />
                            ) : decided ? (
                                <CheckGlyph
                                    size={13}
                                    color={on ? '#fff' : '#1f8a5b'}
                                />
                            ) : (
                                <span
                                    style={{
                                        width: 7,
                                        height: 7,
                                        borderRadius: 9999,
                                        background: on ? '#fff' : DOT[st]
                                    }}
                                />
                            )}
                            <span
                                style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: on ? '#fff' : 'var(--color-gray-7)'
                                }}>
                                {def.label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
