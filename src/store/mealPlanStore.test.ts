import type { MealPlanResponse } from '@kimdaegyu/babmukdang-shared/domain'
import { beforeEach, describe, expect, it } from 'vitest'
import { useMealPlanStore } from './mealPlanStore'

const mealPlanId = '11111111-1111-4111-8111-111111111111'

const ownerPermissions = {
    canView: true,
    canInviteFriends: true,
    canManageParticipants: true,
    canCreateShareLink: true,
    canExposeNearbyFriends: true,
    canVote: true,
    canChat: true,
    canReadyMealPlan: true,
    canRequestChange: true,
    canReopenDecisionTask: true,
    canConfirmDecisionSnapshot: true,
    canConfirmMealPlan: false,
    canCompleteMealPlan: false,
    canRecordMealPlan: false,
    canCancelMealPlan: true
}

const personalizedMealPlan = (
    overrides: Partial<MealPlanResponse> = {}
): MealPlanResponse =>
    ({
        mealPlanId,
        status: 'DECIDING',
        participants: [],
        decisionStages: [],
        decisionProgress: null,
        viewerRole: 'OWNER',
        viewerParticipantStatus: 'READY',
        viewerPermissions: ownerPermissions,
        ...overrides
    }) as unknown as MealPlanResponse

const allFalsePermissions = Object.fromEntries(
    Object.keys(ownerPermissions).map(key => [key, false])
) as unknown as MealPlanResponse['viewerPermissions']

// Backend room broadcast payload (meal-plan.gateway): viewer 없이 만든 응답
const viewerNeutralMealPlan = (status: MealPlanResponse['status']) =>
    ({
        ...personalizedMealPlan({ status }),
        viewerRole: 'NONE',
        viewerParticipantStatus: null,
        viewerPermissions: allFalsePermissions
    }) as unknown as MealPlanResponse

const nullViewerMealPlan = (status: MealPlanResponse['status']) =>
    ({
        ...personalizedMealPlan({ status }),
        viewerRole: null,
        viewerParticipantStatus: null,
        viewerPermissions: null
    }) as unknown as MealPlanResponse

describe('mealPlanStore room broadcasts', () => {
    beforeEach(() => {
        useMealPlanStore.getState().resetMealPlanState()
        useMealPlanStore.getState().setCurrentMealPlan(personalizedMealPlan())
    })

    it('keeps own viewer fields and isSelfReady on a viewer-neutral status broadcast', () => {
        useMealPlanStore.getState().applyStatusChanged({
            mealPlanId,
            status: 'READY',
            mealPlan: viewerNeutralMealPlan('READY')
        })

        const state = useMealPlanStore.getState()
        expect(state.status).toBe('READY')
        expect(state.current?.status).toBe('READY')
        expect(state.current?.viewerRole).toBe('OWNER')
        expect(state.current?.viewerParticipantStatus).toBe('READY')
        expect(state.current?.viewerPermissions.canVote).toBe(true)
        expect(state.current?.viewerPermissions.canConfirmMealPlan).toBe(true)
        expect(state.isSelfReady).toBe(true)
    })

    it('keeps own viewer fields on a viewer-neutral progress broadcast', () => {
        useMealPlanStore.getState().applyDecisionProgressUpdated({
            mealPlanId,
            progress: null,
            mealPlan: viewerNeutralMealPlan('DECIDING')
        })

        const state = useMealPlanStore.getState()
        expect(state.current?.viewerRole).toBe('OWNER')
        expect(state.current?.viewerPermissions).toEqual(ownerPermissions)
        expect(state.isSelfReady).toBe(true)
    })

    it('also treats null viewer fields as viewer-neutral', () => {
        useMealPlanStore.getState().applyStatusChanged({
            mealPlanId,
            status: 'READY',
            mealPlan: nullViewerMealPlan('READY')
        })

        const state = useMealPlanStore.getState()
        expect(state.current?.viewerRole).toBe('OWNER')
        expect(state.current?.viewerPermissions.canVote).toBe(true)
        expect(state.isSelfReady).toBe(true)
    })

    it('does not adopt a viewer-neutral mealPlan without hydrated state', () => {
        useMealPlanStore.getState().resetMealPlanState()

        useMealPlanStore.getState().applyStatusChanged({
            mealPlanId,
            status: 'READY',
            mealPlan: viewerNeutralMealPlan('READY')
        })

        expect(useMealPlanStore.getState().current).toBeNull()
        expect(useMealPlanStore.getState().status).toBe('READY')
    })

    it('applies a personalized mealPlan as-is', () => {
        useMealPlanStore.getState().applyStatusChanged({
            mealPlanId,
            status: 'DECIDING',
            mealPlan: personalizedMealPlan({
                viewerRole: 'FRIEND',
                viewerParticipantStatus: 'JOINED'
            })
        })

        const state = useMealPlanStore.getState()
        expect(state.current?.viewerRole).toBe('FRIEND')
        expect(state.isSelfReady).toBe(false)
    })
})
