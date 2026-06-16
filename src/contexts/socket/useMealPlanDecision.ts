import { useMemo } from 'react'
import { useMealPlanStore } from '@/store/mealPlanStore'

export function useMealPlanDecision() {
    const decisionStages = useMealPlanStore(state => state.decisionStages)
    const decisionProgress = useMealPlanStore(state => state.decisionProgress)
    const readyCount = useMealPlanStore(state => state.readyCount)
    const participantCount = useMealPlanStore(state => state.participantCount)
    const isSelfReady = useMealPlanStore(state => state.isSelfReady)
    const setIsSelfReady = useMealPlanStore(state => state.setIsSelfReady)

    const taskMap = useMemo(() => {
        return new Map(
            (decisionProgress?.tasks ?? []).map(task => [task.taskKey, task])
        )
    }, [decisionProgress])

    return {
        decisionStages,
        decisionProgress,
        taskMap,
        readyCount,
        participantCount,
        isSelfReady,
        setIsSelfReady
    }
}
