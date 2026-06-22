/**
 * Sticky decision footer: friend-votes button (opens the per-stage friend sheet)
 * + Ready toggle. Wires the real ready/unready mutations.
 */
import type { MealPlanStatus } from '@kimdaegyu/babmukdang-shared/domain'
import { useReadyMealPlan, useUnreadyMealPlan } from '@/apis'
import { Glyph, type GlyphName } from './glyphs'

const lockedStatuses: MealPlanStatus[] = [
    'CONFIRMED',
    'LOCKED',
    'COMPLETED',
    'RECORDED',
    'CANCELLED'
]

export function ReadyFooter({
    mealPlanId,
    isSelfReady,
    status,
    canReady = true,
    onFriends,
    friendsActive = false,
    label,
    actionIcon = 'people',
    actionLabel = '함께 보기',
    actionPosition = 'left',
    onToggleReady,
    isTogglePending = false
}: {
    mealPlanId: string
    isSelfReady: boolean
    status?: MealPlanStatus
    canReady?: boolean
    onFriends?: () => void
    friendsActive?: boolean
    label?: string
    actionIcon?: GlyphName
    actionLabel?: string
    actionPosition?: 'left' | 'right'
    onToggleReady?: () => void
    isTogglePending?: boolean
}) {
    const { mutate: ready, isPending: readyPending } = useReadyMealPlan()
    const { mutate: unready, isPending: unreadyPending } = useUnreadyMealPlan()
    const isLocked = status ? lockedStatuses.includes(status) : false
    const disabled =
        readyPending ||
        unreadyPending ||
        isTogglePending ||
        isLocked ||
        !canReady
    const text =
        label ?? (isSelfReady ? 'Ready 취소' : '내 표 다 했어요 (Ready)')
    const actionButton = onFriends ? (
        <button
            type="button"
            onClick={onFriends}
            aria-label={actionLabel}
            style={{
                flex: 'none',
                width: 48,
                height: 48,
                borderRadius: 9999,
                display: 'grid',
                placeItems: 'center',
                border: 'none',
                background: friendsActive
                    ? 'var(--color-primary-100)'
                    : 'var(--color-gray-1)'
            }}>
            <Glyph
                name={actionIcon}
                size={22}
                color={
                    friendsActive
                        ? 'var(--color-primary-main)'
                        : 'var(--color-gray-6)'
                }
            />
        </button>
    ) : null

    return (
        <div
            className="flex items-center"
            style={{
                flex: 'none',
                padding: 16,
                background: 'var(--color-white)',
                borderTop: '1px solid var(--color-gray-2)',
                gap: 10,
                position: 'sticky',
                bottom: 0
            }}>
            {actionPosition === 'left' && actionButton}
            <button
                type="button"
                disabled={disabled}
                onClick={() =>
                    onToggleReady
                        ? onToggleReady()
                        : isSelfReady
                          ? unready(mealPlanId)
                          : ready(mealPlanId)
                }
                style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 9999,
                    border: 'none',
                    background: isSelfReady
                        ? 'var(--color-primary-main)'
                        : 'var(--color-gray-8)',
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 700,
                    opacity: disabled ? 0.55 : 1
                }}>
                {text}
            </button>
            {actionPosition === 'right' && actionButton}
        </div>
    )
}
