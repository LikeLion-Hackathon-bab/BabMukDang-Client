import { useState } from 'react'
import { useCompleteMealPlanStage } from '@/apis'
import { useSocket } from '@/contexts/SocketContext'
import type {
    MealPlanDecisionCandidate,
    MealPlanDecisionStageResponse
} from '@kimdaegyu/babmukdang-shared/domain'

const menuCandidateLabel = (candidate: MealPlanDecisionCandidate) => {
    if (candidate.stageType !== 'MENU') return '추천 후보'
    const { menu, source, score } = candidate.value
    const sourceLabel: Record<string, string> = {
        'external-recommendation': '추천',
        'prefer-menu': '선호 반영',
        'recent-menu': '최근 기록',
        fallback: '기본 후보',
        'manual-search': '직접 추가'
    }
    return `${menu.label} · ${sourceLabel[source] ?? source} · ${score}점`
}

export function MealPlanRecommendationPanel({
    mealPlanId,
    stages,
    interactionMode = 'complete',
    canComplete = true,
    canVote = true
}: {
    mealPlanId: string
    stages: MealPlanDecisionStageResponse[]
    interactionMode?: 'complete' | 'vote'
    canComplete?: boolean
    canVote?: boolean
}) {
    const [votedCandidateKey, setVotedCandidateKey] = useState<string | null>(null)
    const menuStage = stages.find(stage => stage.stageType === 'MENU')
    const { mutate: completeStage, isPending } = useCompleteMealPlanStage()
    const { commands, guestSessionToken, isConnected } = useSocket()

    if (!menuStage) {
        return (
            <section className="rounded-20 flex flex-col gap-8 bg-white p-16">
                <h2 className="text-body1-semibold text-gray-8">추천 결과</h2>
                <p className="text-caption-regular text-gray-5">
                    아직 저장된 추천 후보가 없습니다. 밥약 시작 화면에서 추천 조건을 입력하거나, 컨텍스트를 다시 저장해 주세요.
                </p>
            </section>
        )
    }

    const selectedMenu =
        menuStage.selectedCandidate?.stageType === 'MENU'
            ? menuStage.selectedCandidate.value.menu.label
            : null

    const voteCandidate = (candidate: MealPlanDecisionCandidate) => {
        commands?.vote({
            mealPlanId,
            stageId: menuStage.stageId,
            voteType: 'PICK',
            candidate,
            ...(guestSessionToken ? { guestSessionToken } : {})
        })
        setVotedCandidateKey(JSON.stringify(candidate))
    }

    return (
        <section className="rounded-20 flex flex-col gap-14 bg-white p-16">
            <div>
                <h2 className="text-body1-semibold text-gray-8">추천 결과</h2>
                <p className="text-caption-regular text-gray-5">
                    {interactionMode === 'vote'
                        ? '게스트도 메뉴 후보에 투표할 수 있습니다. 투표 결과는 밥약방 참여자에게 실시간으로 공유됩니다.'
                        : '추천 조건으로 생성된 메뉴 후보입니다. 혼자 밥약이라면 후보를 고르고 Ready 후 확정할 수 있습니다.'}
                </p>
            </div>
            {selectedMenu && (
                <div className="rounded-16 bg-primary-100 p-12 text-body2-medium text-primary-main">
                    선택한 메뉴: {selectedMenu}
                </div>
            )}
            <div className="flex flex-col gap-8">
                {menuStage.candidates.map((candidate, index) => {
                    const candidateKey = JSON.stringify(candidate)
                    const isSelected =
                        candidateKey === JSON.stringify(menuStage.selectedCandidate)
                    const isVoted = votedCandidateKey === candidateKey
                    const voteCount = menuStage.votes.filter(
                        vote => JSON.stringify(vote.candidate) === candidateKey
                    ).length
                    return (
                        <button
                            key={`${menuStage.stageId}-${index}`}
                            type="button"
                            disabled={
                                interactionMode === 'vote'
                                    ? !isConnected || isVoted || !canVote
                                    : isPending || isSelected || !canComplete
                            }
                            onClick={() =>
                                interactionMode === 'vote'
                                    ? voteCandidate(candidate)
                                    : completeStage({
                                          mealPlanId,
                                          stageId: menuStage.stageId,
                                          body: { selectedCandidate: candidate }
                                      })
                            }
                            className={`rounded-18 border px-14 py-12 text-left text-body2-medium disabled:opacity-50 ${
                                isSelected || isVoted
                                    ? 'border-primary-main bg-primary-100 text-primary-main'
                                    : 'border-gray-2 bg-gray-1 text-gray-8'
                            }`}>
                            <span>{menuCandidateLabel(candidate)}</span>
                            <span className="mt-4 block text-caption-regular text-gray-5">
                                {interactionMode === 'vote'
                                    ? isVoted
                                        ? `투표 완료 · 현재 ${voteCount + 1}표`
                                        : `투표하기 · 현재 ${voteCount}표`
                                    : '후보 선택'}
                            </span>
                        </button>
                    )
                })}
            </div>
        </section>
    )
}
