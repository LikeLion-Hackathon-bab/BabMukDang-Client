import { describe, expect, it } from 'vitest'
import { onboardingFlowController } from './OnboardingFlowController'

const emptyDraft = {
    username: '',
    liked: [],
    disliked: [],
    allergy: []
}

const profileDraft = {
    ...emptyDraft,
    username: '대규'
}

describe('OnboardingFlowController', () => {
    it('routes authenticated users by onboarding status', () => {
        expect(onboardingFlowController.routeAfterAuth('COMPLETED')).toBe('/home')
        expect(onboardingFlowController.routeAfterAuth('REQUIRED')).toBe('/onboarding')
    })

    it('redirects required users from protected app routes to onboarding start', () => {
        expect(
            onboardingFlowController.resolveProtectedRoute({
                currentPath: '/home',
                onboardingStatus: 'REQUIRED',
                draft: emptyDraft
            })
        ).toEqual({ allow: false, redirectTo: '/onboarding' })
    })

    it('prevents skipping preference or allergy pages before profile draft exists', () => {
        expect(
            onboardingFlowController.resolveProtectedRoute({
                currentPath: '/prefer-menu',
                onboardingStatus: 'REQUIRED',
                draft: emptyDraft
            })
        ).toEqual({ allow: false, redirectTo: '/onboarding' })

        expect(
            onboardingFlowController.resolveProtectedRoute({
                currentPath: '/allergic-menu',
                onboardingStatus: 'REQUIRED',
                draft: emptyDraft
            })
        ).toEqual({ allow: false, redirectTo: '/onboarding' })
    })

    it('allows the next onboarding steps when the profile draft exists', () => {
        expect(
            onboardingFlowController.resolveProtectedRoute({
                currentPath: '/prefer-menu',
                onboardingStatus: 'REQUIRED',
                draft: profileDraft
            })
        ).toEqual({ allow: true })
    })

    it('redirects completed users away from draft-only onboarding steps', () => {
        expect(
            onboardingFlowController.resolveProtectedRoute({
                currentPath: '/prefer-menu',
                onboardingStatus: 'COMPLETED',
                draft: profileDraft
            })
        ).toEqual({ allow: false, redirectTo: '/home' })
    })
})
