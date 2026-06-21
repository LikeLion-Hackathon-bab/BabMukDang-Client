/**
 * Sticky decision footer: friend-votes button (opens the per-stage friend sheet)
 * + Ready toggle. Wires the real ready/unready mutations.
 */
import type { MealPlanStatus } from '@kimdaegyu/babmukdang-shared/domain'
import { useReadyMealPlan, useUnreadyMealPlan } from '@/apis'
import { Glyph } from './glyphs'

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
    label
}: {
    mealPlanId: string
    isSelfReady: boolean
    status?: MealPlanStatus
    canReady?: boolean
    onFriends?: () => void
    friendsActive?: boolean
    label?: string
}) {
    const { mutate: ready, isPending: readyPending } = useReadyMealPlan()
    const { mutate: unready, isPending: unreadyPending } = useUnreadyMealPlan()
    const isLocked = status ? lockedStatuses.includes(status) : false
    const disabled = readyPending || unreadyPending || isLocked || !canReady
    const text =
        label ?? (isSelfReady ? 'Ready 취소' : '내 표 다 했어요 (Ready)')

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
            {onFriends && (
            <button
                type="button"
                onClick={onFriends}
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
                    name="people"
                    size={22}
                    color={
                        friendsActive
                            ? 'var(--color-primary-main)'
                            : 'var(--color-gray-6)'
                    }
                />
            </button>
            )}
            <button
                type="button"
                disabled={disabled}
                onClick={() =>
                    isSelfReady ? unready(mealPlanId) : ready(mealPlanId)
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
        </div>
    )
}
