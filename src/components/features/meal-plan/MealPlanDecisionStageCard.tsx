import type { MealPlanDecisionStageResponse } from '@kimdaegyu/babmukdang-shared/domain'
import { useCompleteMealPlanStage, useCreateMealPlanVote } from '@/apis'

const stageTitle: Record<string, string> = {
    DATE: '날짜',
    TIME: '시간',
    AREA: '지역',
    MENU: '메뉴',
    RESTAURANT: '식당',
    FINAL_CONFIRMATION: '최종 확인'
}

const candidateText = (candidate: MealPlanDecisionStageResponse['candidates'][number]) => {
    if (candidate.stageType === 'DATE' || candidate.stageType === 'TIME') {
        return candidate.value
    }
    if (candidate.stageType === 'AREA') return candidate.value.placeName
    if (candidate.stageType === 'MENU') return candidate.value.menu.label
    if (candidate.stageType === 'RESTAURANT') return candidate.value.placeName
    return 'Ready'
}

export function MealPlanDecisionStageCard({
    mealPlanId,
    stage,
    canVote = true,
    canComplete = true
}: {
    mealPlanId: string
    stage: MealPlanDecisionStageResponse
    canVote?: boolean
    canComplete?: boolean
}) {
    const { mutate: vote, isPending: isVotePending } = useCreateMealPlanVote()
    const { mutate: completeStage, isPending: isCompletePending } =
        useCompleteMealPlanStage()

    const candidateVoteCount = (
        candidate: MealPlanDecisionStageResponse['candidates'][number]
    ) =>
        stage.votes.filter(
            item =>
                item.voteType !== 'EXCLUDE' &&
                JSON.stringify(item.candidate) === JSON.stringify(candidate)
        ).length

    const candidateExcludeCount = (
        candidate: MealPlanDecisionStageResponse['candidates'][number]
    ) =>
        stage.votes.filter(
            item =>
                item.voteType === 'EXCLUDE' &&
                JSON.stringify(item.candidate) === JSON.stringify(candidate)
        ).length

    return (
        <article className="rounded-20 flex flex-col gap-12 bg-white p-16">
            <div className="flex items-center justify-between">
                <h3 className="text-body1-semibold text-gray-8">
                    {stageTitle[stage.stageType] ?? stage.stageType}
                </h3>
                <span className="rounded-20 bg-gray-1 text-caption-medium text-gray-6 px-10 py-5">
                    {stage.status}
                </span>
            </div>
            {stage.selectedCandidate ? (
                <div className="rounded-16 bg-primary-100 p-12 text-body2-medium text-primary-main">
                    선택됨: {candidateText(stage.selectedCandidate)}
                </div>
            ) : (
                <span className="text-caption-regular text-gray-5">
                    아직 선택된 후보가 없습니다.
                </span>
            )}
            <div className="flex flex-col gap-8">
                {stage.candidates.map((candidate, index) => {
                    const voteCount = candidateVoteCount(candidate)
                    const excludeCount = candidateExcludeCount(candidate)
                    return (
                        <div
                            key={`${stage.stageId}-${index}`}
                            className="rounded-16 border border-gray-2 bg-gray-1 p-12">
                            <div className="flex items-start justify-between gap-10">
                                <div>
                                    <p className="text-body2-medium text-gray-8">
                                        {candidateText(candidate)}
                                    </p>
                                    <p className="text-caption-regular text-gray-5">
                                        PICK/PREFER {voteCount}표 · EXCLUDE {excludeCount}표
                                    </p>
                                </div>
                                <div className="flex shrink-0 flex-wrap justify-end gap-6">
                                    <button
                                        type="button"
                                        disabled={isVotePending || !canVote}
                                        onClick={() =>
                                            vote({
                                                mealPlanId,
                                                stageId: stage.stageId,
                                                body: {
                                                    voteType: 'PICK',
                                                    candidate
                                                }
                                            })
                                        }
                                        className="rounded-30 bg-primary-main px-10 py-7 text-caption-medium text-white disabled:opacity-40">
                                        선택
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isVotePending || !canVote}
                                        onClick={() =>
                                            vote({
                                                mealPlanId,
                                                stageId: stage.stageId,
                                                body: {
                                                    voteType: 'PREFER',
                                                    candidate
                                                }
                                            })
                                        }
                                        className="rounded-30 bg-gray-8 px-10 py-7 text-caption-medium text-white disabled:opacity-40">
                                        선호
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isVotePending || !canVote}
                                        onClick={() =>
                                            vote({
                                                mealPlanId,
                                                stageId: stage.stageId,
                                                body: {
                                                    voteType: 'EXCLUDE',
                                                    candidate
                                                }
                                            })
                                        }
                                        className="rounded-30 bg-gray-3 px-10 py-7 text-caption-medium text-gray-7 disabled:opacity-40">
                                        제외
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isCompletePending || !canComplete}
                                        onClick={() =>
                                            completeStage({
                                                mealPlanId,
                                                stageId: stage.stageId,
                                                body: { selectedCandidate: candidate }
                                            })
                                        }
                                        className="rounded-30 bg-gray-2 px-10 py-7 text-caption-medium text-gray-7 disabled:opacity-40">
                                        확정
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </article>
    )
}
