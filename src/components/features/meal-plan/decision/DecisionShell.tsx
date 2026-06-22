/**
 * Per-stage screen scaffold: top AppBar + StageSwitcher + scrollable body, with
 * optional footer (ReadyFooter) and an absolutely-positioned bottom-sheet slot.
 */
import type { ReactNode } from 'react'
import { useNavigate } from '@/navigation'
import { useTabNavigation } from '@/navigation/useTabNavigation'
import { Glyph } from './glyphs'
import { StageSwitcher } from './StageSwitcher'
import type { BoardState, StageKey } from './useDecisionStages'
import { useMealPlanDecisionChrome } from './useMealPlanDecisionChrome'

export function DecisionAppBar({
    title,
    sub,
    mealPlanId,
    showChat = true,
    onBack
}: {
    title: string
    sub?: string
    mealPlanId?: string
    showChat?: boolean
    onBack?: () => void
}) {
    const navigate = useNavigate()
    const navigateTab = useTabNavigation()
    return (
        <div
            style={{
                background: 'var(--color-white)',
                flex: 'none',
                padding: '6px 16px 12px'
            }}>
            <div
                className="flex items-center justify-between"
                style={{ minHeight: 30 }}>
                <button
                    type="button"
                    onClick={() => (onBack ? onBack() : navigate(-1))}
                    style={{
                        width: 40,
                        display: 'flex',
                        background: 'none',
                        border: 'none'
                    }}>
                    <Glyph
                        name="back"
                        size={24}
                        color="var(--color-gray-8)"
                    />
                </button>
                <div
                    className="flex flex-col items-center"
                    style={{ flex: 1, gap: 1 }}>
                    <span
                        style={{
                            fontSize: 17,
                            fontWeight: 700,
                            color: 'var(--color-gray-8)'
                        }}>
                        {title}
                    </span>
                    {sub && (
                        <span
                            style={{
                                fontSize: 11,
                                color: 'var(--color-gray-4)',
                                fontWeight: 500
                            }}>
                            {sub}
                        </span>
                    )}
                </div>
                <div
                    className="flex items-center justify-end"
                    style={{ width: 40, gap: 10 }}>
                    {showChat && mealPlanId && (
                        <button
                            type="button"
                            onClick={() =>
                                navigateTab(
                                    `/meal-plans/${mealPlanId}/decision/chat`
                                )
                            }
                            style={{ background: 'none', border: 'none' }}>
                            <Glyph
                                name="comment"
                                size={22}
                                color="var(--color-gray-7)"
                            />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export function DecisionShell({
    mealPlanId,
    title,
    active,
    states,
    children,
    footer,
    sheet
}: {
    mealPlanId: string
    title: string
    sub?: string
    active: StageKey
    states: Record<StageKey, BoardState>
    children: ReactNode
    footer?: ReactNode
    sheet?: ReactNode
}) {
    useMealPlanDecisionChrome({ mealPlanId, title })

    return (
        <div
            className="flex flex-col"
            style={{ minHeight: '100%' }}>
            <StageSwitcher
                mealPlanId={mealPlanId}
                active={active}
                states={states}
            />
            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    position: 'relative'
                }}>
                <div
                    className="flex flex-col"
                    style={{ padding: 16, gap: 13 }}>
                    {children}
                </div>
                {sheet}
            </div>
            {footer}
        </div>
    )
}
