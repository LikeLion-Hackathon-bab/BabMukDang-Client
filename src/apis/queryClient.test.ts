import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/store/authStore'
import { useMealPlanStore } from '@/store/mealPlanStore'
import { clearUserSession, queryClient } from './queryClient'

describe('clearUserSession', () => {
    beforeEach(() => {
        queryClient.clear()
        useAuthStore.getState().flushAuthStore()
    })

    it('clears auth, per-user stores and the query cache of the previous user', () => {
        useAuthStore.setState({ accessToken: 'token', userId: '1' })
        useMealPlanStore.getState().setIsSelfReady(true)
        queryClient.setQueryData(['members', 'me'], { memberId: 1 })

        clearUserSession()

        expect(useAuthStore.getState().accessToken).toBeNull()
        expect(useAuthStore.getState().userId).toBeNull()
        expect(useMealPlanStore.getState().isSelfReady).toBe(false)
        expect(queryClient.getQueryData(['members', 'me'])).toBeUndefined()
    })

    it('does nothing when the session is already cleared', () => {
        const clear = vi.spyOn(queryClient, 'clear')

        clearUserSession()

        expect(clear).not.toHaveBeenCalled()
        clear.mockRestore()
    })
})
