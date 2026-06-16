import { useConfirmMealPlan, useReadyMealPlan, useUnreadyMealPlan } from '@/apis'
import type { MealPlanStatus } from '@kimdaegyu/babmukdang-shared/domain'

const lockedStatuses: MealPlanStatus[] = [
    'CONFIRMED',
    'LOCKED',
    'COMPLETED',
    'RECORDED',
    'CANCELLED'
]

export function MealPlanReadyBar({
    mealPlanId,
    readyCount,
    participantCount,
    isSelfReady,
    status,
    canReady = true,
    canConfirm = true
}: {
    mealPlanId: string
    readyCount: number
    participantCount: number
    isSelfReady: boolean
    status?: MealPlanStatus
    canReady?: boolean
    canConfirm?: boolean
}) {
    const { mutate: ready, isPending: isReadyPending } = useReadyMealPlan()
    const { mutate: unready, isPending: isUnreadyPending } = useUnreadyMealPlan()
    const { mutate: confirm, isPending: isConfirmPending } = useConfirmMealPlan()
    const disabled = isReadyPending || isUnreadyPending || isConfirmPending
    const isReadyStatus = status === 'READY'
    const isLocked = status ? lockedStatuses.includes(status) : false

    return (
        <section className="rounded-20 bg-white p-16">
            <div className="mb-12 flex items-center justify-between gap-12">
                <div>
                    <h2 className="text-body1-semibold text-gray-8">Ready</h2>
                    <p className="text-caption-regular text-gray-5">
                        {readyCount}/{participantCount}명이 준비 완료했습니다.
                    </p>
                </div>
                <div className="flex shrink-0 gap-8">
                    {isReadyStatus && canConfirm && (
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => confirm(mealPlanId)}
                            className="rounded-30 bg-gray-8 text-caption-medium px-16 py-9 text-white disabled:opacity-40">
                            확정하기
                        </button>
                    )}
                    {!isLocked && canReady && (
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() =>
                                isSelfReady
                                    ? unready(mealPlanId)
                                    : ready(mealPlanId)
                            }
                            className="rounded-30 bg-primary-main text-caption-medium px-16 py-9 text-white disabled:opacity-40">
                            {isSelfReady ? 'Ready 취소' : 'Ready'}
                        </button>
                    )}
                </div>
            </div>
            <div className="bg-gray-2 h-8 overflow-hidden rounded-full">
                <div
                    className="bg-primary-main h-full rounded-full"
                    style={{
                        width: `${participantCount ? Math.round((readyCount / participantCount) * 100) : 0}%`
                    }}
                />
            </div>
        </section>
    )
}
