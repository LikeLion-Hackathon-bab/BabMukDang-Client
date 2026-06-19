import { useCallback, useState } from 'react'
import {
    useExposeMealPlanToNearbyFriends,
    useNearbyFriendExposureEligibility,
    useUpdateLocationConsent,
    useUpdateMemberLocation
} from '@/apis'
import type { ExposeMealPlanToNearbyFriendsResponse } from '@/apis/types'
import {
    locationPermissionErrorMessage,
    permissionAdapter
} from '@/features/permissions'

type WorkflowResult = ExposeMealPlanToNearbyFriendsResponse | null

export function useNearbyFriendExposureWorkflow(mealPlanId: string) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [lastResult, setLastResult] = useState<WorkflowResult>(null)
    const { data: eligibility, refetch: refetchEligibility } =
        useNearbyFriendExposureEligibility()
    const { mutateAsync: exposeAsync, isPending: isExposePending } =
        useExposeMealPlanToNearbyFriends()
    const { mutateAsync: updateLocationConsentAsync } =
        useUpdateLocationConsent()
    const { mutateAsync: updateMemberLocationAsync } = useUpdateMemberLocation()

    const startExposure = useCallback(
        async ({ radiusMeters }: { radiusMeters: number }) => {
            setErrorMessage(null)
            setLastResult(null)
            try {
                const permissionSnapshot =
                    await permissionAdapter.requestLocationPermission()

                if (permissionSnapshot.status !== 'GRANTED') {
                    await updateLocationConsentAsync({
                        locationConsentStatus: 'DENIED',
                        nearbyMealPlanExposureAllowed: false,
                        mealSuggestionAllowed: false,
                        permissionSnapshot
                    })
                    await refetchEligibility()
                    setErrorMessage(
                        `위치 권한이 필요합니다. ${locationPermissionErrorMessage(permissionSnapshot.status)}`
                    )
                    return null
                }

                await updateLocationConsentAsync({
                    locationConsentStatus: 'GRANTED',
                    nearbyMealPlanExposureAllowed: true,
                    mealSuggestionAllowed: true,
                    permissionSnapshot
                })
                const location = await permissionAdapter.getCurrentPosition()
                await updateMemberLocationAsync(location)
                const result = await exposeAsync({
                    mealPlanId,
                    body: { radiusMeters }
                })
                setLastResult(result)
                await refetchEligibility()
                return result
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : '근처 친구 노출을 시작하지 못했습니다.'
                setErrorMessage(message)
                return null
            }
        },
        [
            exposeAsync,
            mealPlanId,
            refetchEligibility,
            updateLocationConsentAsync,
            updateMemberLocationAsync
        ]
    )

    return {
        eligibility,
        errorMessage,
        lastResult,
        isPreparing: isExposePending,
        startExposure
    }
}
