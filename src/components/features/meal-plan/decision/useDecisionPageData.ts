/**
 * Shared decision-page wiring: reads the route id, fetches the meal plan, syncs
 * it into the store, and exposes the viewer's role/permissions/ready state.
 * Every decision sub-page uses this inside a SocketProvider.
 */
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useMealPlanDetail } from '@/apis'
import { useMealPlanStore } from '@/store'

export function useDecisionPageData() {
    const { mealPlanId = '' } = useParams<{ mealPlanId: string }>()
    const { data, isLoading, error } = useMealPlanDetail(mealPlanId, {
        enabled: Boolean(mealPlanId)
    })
    const setCurrentMealPlan = useMealPlanStore(
        state => state.setCurrentMealPlan
    )
    const current = useMealPlanStore(state => state.current)
    const isSelfReady = useMealPlanStore(state => state.isSelfReady)

    useEffect(() => {
        if (data) setCurrentMealPlan(data)
    }, [data, setCurrentMealPlan])

    const mealPlan = current ?? data ?? null

    return {
        mealPlanId,
        mealPlan,
        permissions: mealPlan?.viewerPermissions,
        isOwner: mealPlan?.viewerRole === 'OWNER',
        viewerRole: mealPlan?.viewerRole,
        isSelfReady,
        status: mealPlan?.status,
        isLoading,
        error
    }
}

export function mealPlanTitle(title?: string | null) {
    return title ?? '밥약'
}
