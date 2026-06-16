import type { MealPlanDecisionStageResponse } from '@kimdaegyu/babmukdang-shared/domain'

export function MealPlanVotePanel({
    stages,
    onOpenDecision
}: {
    stages: MealPlanDecisionStageResponse[]
    onOpenDecision: () => void
}) {
    const openStageCount = stages.filter(stage => stage.status !== 'COMPLETED').length

    return (
        <section className="rounded-20 flex flex-col gap-12 bg-white p-16">
            <div>
                <h2 className="text-body1-semibold text-gray-8">의사결정</h2>
                <p className="text-caption-regular text-gray-5">
                    열린 단계 {openStageCount}개 · 후보 선택과 Ready는 결정 화면에서 진행합니다.
                </p>
            </div>
            <button
                type="button"
                onClick={onOpenDecision}
                className="rounded-30 bg-gray-8 text-body1-semibold py-12 text-white">
                결정하러 가기
            </button>
        </section>
    )
}
