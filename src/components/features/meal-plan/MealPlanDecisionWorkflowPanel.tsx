import type {
    MealPlanDecisionProgress,
    MealPlanDecisionTaskProgress,
    MealPlanViewerPermissions
} from '@kimdaegyu/babmukdang-shared/domain'
import {
    useConfirmMealPlanDecisionSnapshot,
    useReopenMealPlanDecisionTask
} from '@/apis'
import {
    mealPlanDecisionTaskDescriptionMap,
    mealPlanDecisionTaskOrder,
    mealPlanDecisionTaskTitleMap,
    mealPlanDecisionTaskVoteLimitMap
} from '@/constants/onboardingRoute'

const statusLabels: Record<MealPlanDecisionTaskProgress['status'], string> = {
    LOCKED: '잠김',
    OPEN: '진행 중',
    RESOLVED: '확정됨',
    STALE: '다시 확인 필요'
}

function formatValue(value: unknown): string {
    if (value == null) return '-'
    if (typeof value === 'string' || typeof value === 'number')
        return String(value)
    if (typeof value === 'object') {
        const candidate = value as Record<string, unknown>
        const nested = candidate.value as Record<string, unknown> | undefined
        const menu = nested?.menu as Record<string, unknown> | undefined
        if (menu?.label) return String(menu.label)
        if (nested?.placeName) return String(nested.placeName)
        if (candidate.stageType && nested)
            return `${candidate.stageType}: ${formatValue(nested)}`
    }
    return JSON.stringify(value)
}

type Props = {
    mealPlanId: string
    progress: MealPlanDecisionProgress | null
    isOwner?: boolean
    permissions?: MealPlanViewerPermissions
}

export function MealPlanDecisionWorkflowPanel({
    mealPlanId,
    progress,
    isOwner = false,
    permissions
}: Props) {
    const { mutate: reopenTask, isPending: isReopenPending } =
        useReopenMealPlanDecisionTask()
    const { mutate: confirmSnapshot, isPending: isConfirmPending } =
        useConfirmMealPlanDecisionSnapshot()

    if (!progress) {
        return (
            <section className="rounded-20 text-caption-regular text-gray-5 bg-white p-16">
                아직 계산된 의사결정 workflow가 없습니다. 후보에 투표하면 진행
                상태가 갱신됩니다.
            </section>
        )
    }

    const latestProvisionalSnapshots = progress.snapshots.filter(
        snapshot => snapshot.status === 'PROVISIONAL'
    )

    return (
        <section className="rounded-20 flex flex-col gap-16 bg-white p-16">
            <div>
                <h2 className="text-body1-semibold text-gray-8">
                    결정 진행 상황
                </h2>
                <p className="text-caption-regular text-gray-5">
                    task별 Ready 없이 후보와 임시 결정안을 읽기 전용으로
                    보여줍니다.
                </p>
            </div>
            <div className="grid gap-10">
                {[...progress.tasks]
                    .sort(
                        (a, b) =>
                            mealPlanDecisionTaskOrder[a.taskKey] -
                            mealPlanDecisionTaskOrder[b.taskKey]
                    )
                    .map(task => {
                        const canReopenTask =
                            isOwner &&
                            (permissions?.canReopenDecisionTask ?? true)
                        return (
                            <div
                                key={task.taskKey}
                                className="rounded-16 border-gray-2 border p-12">
                                <div className="flex items-start justify-between gap-10">
                                    <div>
                                        <p className="text-body2-semibold text-gray-8">
                                            {
                                                mealPlanDecisionTaskTitleMap[
                                                    task.taskKey
                                                ]
                                            }
                                        </p>
                                        <p className="text-caption-regular text-gray-5">
                                            {statusLabels[task.status]}
                                        </p>
                                        {mealPlanDecisionTaskDescriptionMap[
                                            task.taskKey
                                        ] && (
                                            <p className="text-caption-regular text-gray-5 mt-4">
                                                {
                                                    mealPlanDecisionTaskDescriptionMap[
                                                        task.taskKey
                                                    ]
                                                }
                                            </p>
                                        )}
                                        {mealPlanDecisionTaskVoteLimitMap[
                                            task.taskKey
                                        ] && (
                                            <p className="text-caption-regular text-gray-4 mt-2">
                                                선택 정책:{' '}
                                                {
                                                    mealPlanDecisionTaskVoteLimitMap[
                                                        task.taskKey
                                                    ]
                                                }
                                            </p>
                                        )}
                                        {task.blockers.length > 0 && (
                                            <p className="text-caption-regular text-red mt-4">
                                                막힌 이유:{' '}
                                                {task.blockers.join(', ')}
                                            </p>
                                        )}
                                    </div>
                                    {canReopenTask && (
                                        <button
                                            type="button"
                                            disabled={isReopenPending}
                                            onClick={() =>
                                                reopenTask({
                                                    mealPlanId,
                                                    taskKey: task.taskKey,
                                                    body: {
                                                        reason: '사용자 재검토'
                                                    }
                                                })
                                            }
                                            className="rounded-30 bg-gray-2 text-caption-medium text-gray-7 px-12 py-8 disabled:opacity-40">
                                            다시 열기
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
            </div>
            <SnapshotSection
                title="임시 결정안"
                values={progress.provisional}
            />
            <SnapshotSection
                title="최종 결정안"
                values={progress.final}
            />
            {isOwner &&
                (permissions?.canConfirmDecisionSnapshot ?? true) &&
                latestProvisionalSnapshots.length > 0 && (
                    <div className="rounded-16 border-gray-2 border p-12">
                        <h3 className="text-caption-semibold text-gray-8">
                            소유자 확정 후보
                        </h3>
                        <div className="mt-8 grid gap-8">
                            {latestProvisionalSnapshots.map(snapshot => (
                                <div
                                    key={snapshot.snapshotId}
                                    className="text-caption-regular text-gray-6 flex items-center justify-between gap-8">
                                    <span>
                                        {snapshot.field}:{' '}
                                        {formatValue(snapshot.value)}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={isConfirmPending}
                                        onClick={() =>
                                            confirmSnapshot({
                                                mealPlanId,
                                                snapshotId: snapshot.snapshotId,
                                                body: {
                                                    snapshotId:
                                                        snapshot.snapshotId
                                                }
                                            })
                                        }
                                        className="rounded-30 bg-gray-8 px-12 py-7 text-white disabled:opacity-40">
                                        이 값 확정
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
        </section>
    )
}

function SnapshotSection({
    title,
    values
}: {
    title: string
    values: Record<string, unknown>
}) {
    return (
        <div className="rounded-16 bg-gray-1 p-12">
            <h3 className="text-caption-semibold text-gray-8">{title}</h3>
            <div className="text-caption-regular text-gray-6 mt-8 grid gap-6">
                {Object.entries(values).length === 0 ? (
                    <p>아직 결정안이 없습니다.</p>
                ) : (
                    Object.entries(values).map(([field, value]) => (
                        <p key={field}>
                            {field}: {formatValue(value)}
                        </p>
                    ))
                )}
            </div>
        </div>
    )
}
