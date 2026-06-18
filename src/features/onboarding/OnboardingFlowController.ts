import type { OnboardingStatus } from '@kimdaegyu/babmukdang-shared/domain'
import type { OnboardingDraftState } from '@/store'

export type OnboardingStepKey = 'PROFILE' | 'PREFER_MENU' | 'ALLERGY_MENU' | 'FINISH'

export interface OnboardingStepDefinition {
    key: OnboardingStepKey
    path: string
    requiresDraft?: (draft: OnboardingDraftSnapshot) => boolean
}

export type OnboardingDraftSnapshot = Pick<
    OnboardingDraftState,
    'username' | 'liked' | 'disliked' | 'allergy'
>

export interface ProtectedRouteDecisionInput {
    currentPath: string
    onboardingStatus: OnboardingStatus
    draft: OnboardingDraftSnapshot
}

export interface ProtectedRouteDecision {
    allow: boolean
    redirectTo?: string
}

const hasUsername = (draft: OnboardingDraftSnapshot) =>
    draft.username.trim().length > 0

export const ONBOARDING_FLOW_STEPS: readonly OnboardingStepDefinition[] = [
    { key: 'PROFILE', path: '/onboarding' },
    {
        key: 'PREFER_MENU',
        path: '/prefer-menu',
        requiresDraft: hasUsername
    },
    {
        key: 'ALLERGY_MENU',
        path: '/allergic-menu',
        requiresDraft: hasUsername
    },
    { key: 'FINISH', path: '/finish-register' }
] as const

const stepByKey = new Map(
    ONBOARDING_FLOW_STEPS.map(step => [step.key, step] as const)
)

const stepByPath = new Map(
    ONBOARDING_FLOW_STEPS.map(step => [step.path, step] as const)
)

const draftOnlyStepKeys = new Set<OnboardingStepKey>([
    'PROFILE',
    'PREFER_MENU',
    'ALLERGY_MENU'
])

export class OnboardingFlowController {
    readonly startPath = stepByKey.get('PROFILE')!.path
    readonly finishPath = stepByKey.get('FINISH')!.path
    readonly completedHomePath = '/home'

    getStepPath(stepKey: OnboardingStepKey): string {
        return stepByKey.get(stepKey)?.path ?? this.startPath
    }

    isOnboardingPath(path: string): boolean {
        return stepByPath.has(path)
    }

    isDraftOnlyPath(path: string): boolean {
        const step = stepByPath.get(path)
        return step ? draftOnlyStepKeys.has(step.key) : false
    }

    routeAfterAuth(onboardingStatus?: OnboardingStatus | string): string {
        return onboardingStatus === 'COMPLETED'
            ? this.completedHomePath
            : this.startPath
    }

    nextPathFrom(stepKey: OnboardingStepKey): string {
        const index = ONBOARDING_FLOW_STEPS.findIndex(step => step.key === stepKey)
        return ONBOARDING_FLOW_STEPS[index + 1]?.path ?? this.completedHomePath
    }

    resolveProtectedRoute({
        currentPath,
        onboardingStatus,
        draft
    }: ProtectedRouteDecisionInput): ProtectedRouteDecision {
        const isOnboardingRoute = this.isOnboardingPath(currentPath)

        if (onboardingStatus !== 'COMPLETED' && !isOnboardingRoute) {
            return { allow: false, redirectTo: this.startPath }
        }

        if (
            onboardingStatus === 'COMPLETED' &&
            this.isDraftOnlyPath(currentPath)
        ) {
            return { allow: false, redirectTo: this.completedHomePath }
        }

        const currentStep = stepByPath.get(currentPath)
        if (
            onboardingStatus !== 'COMPLETED' &&
            currentStep?.requiresDraft &&
            !currentStep.requiresDraft(draft)
        ) {
            return { allow: false, redirectTo: this.startPath }
        }

        return { allow: true }
    }
}

export const onboardingFlowController = new OnboardingFlowController()
