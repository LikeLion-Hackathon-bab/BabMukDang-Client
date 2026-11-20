import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MealPlanDecisionVoteSocketEvent } from '@kimdaegyu/babmukdang-shared/domain'
import type {
    CreateMealPlanVoteRequest,
    MealPlanResponse
} from '@kimdaegyu/babmukdang-shared/domain'
import { useSocket } from '@/contexts/SocketContext'
import { queryKeys } from '@/apis/keys'
import { useMealPlanStore } from '@/store/mealPlanStore'
import { parseMealPlanClientPayload } from './mealPlanSocket.validator'

export type MealPlanDecisionVoteInput = {
    mealPlanId: string
    stageId: string
    body: CreateMealPlanVoteRequest
}

type MealPlanDecisionVoteMutationOptions = {
    onSuccess?: (mealPlan: MealPlanResponse) => void
    onError?: (error: Error) => void
    onSettled?: () => void
}

/**
 * Socket.IO is the sole write transport for decision votes and candidate
 * materialization. The Gateway acknowledgement updates local state immediately;
 * the same result is broadcast to every joined participant.
 */
export function useMealPlanDecisionVote(
    options: MealPlanDecisionVoteMutationOptions = {}
) {
    const { commands, guestSessionToken, socket } = useSocket()
    const queryClient = useQueryClient()
    const setCurrentMealPlan = useMealPlanStore(
        state => state.setCurrentMealPlan
    )

    return useMutation({
        mutationFn: async ({
            mealPlanId,
            stageId,
            body
        }: MealPlanDecisionVoteInput) => {
            if (!commands || !socket?.connected) {
                throw new Error('실시간 밥약 연결이 준비되지 않았습니다.')
            }

            const payload = parseMealPlanClientPayload(
                MealPlanDecisionVoteSocketEvent,
                {
                    mealPlanId,
                    stageId,
                    ...body,
                    ...(guestSessionToken ? { guestSessionToken } : {})
                }
            )
            return commands.vote(payload)
        },
        onSuccess: mealPlan => {
            setCurrentMealPlan(mealPlan)
            queryClient.setQueryData(
                queryKeys.mealPlans.detail(mealPlan.mealPlanId),
                mealPlan
            )
            options.onSuccess?.(mealPlan)
        },
        onError: error => {
            options.onError?.(
                error instanceof Error
                    ? error
                    : new Error('실시간 투표 요청에 실패했습니다.')
            )
        },
        onSettled: () => options.onSettled?.()
    })
}
