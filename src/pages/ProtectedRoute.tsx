import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { NotificationSseProvider } from '@/contexts/NotificationSseProvider'
import { useAppBootstrap } from '@/contexts'
import { useOnboardingStore } from '@/store'
import { onboardingFlowController } from '@/features/onboarding'

export function ProtectedRoute() {
    const location = useLocation()
    const { accessToken, profile, isBootstrapping, authError } =
        useAppBootstrap()

    const onboardingDraft = useOnboardingStore(
        useShallow(state => ({
            username: state.username,
            liked: state.liked,
            disliked: state.disliked,
            allergy: state.allergy
        }))
    )

    if (isBootstrapping) {
        return <div>로그인 상태를 확인하는 중입니다.</div>
    }

    if (!accessToken || authError || !profile) {
        return (
            <Navigate
                to="/login"
                replace
            />
        )
    }

    const decision = onboardingFlowController.resolveProtectedRoute({
        currentPath: location.pathname,
        onboardingStatus: profile.onboardingStatus,
        draft: onboardingDraft
    })

    if (!decision.allow && decision.redirectTo) {
        return (
            <Navigate
                to={decision.redirectTo}
                replace
                state={{ from: location }}
            />
        )
    }

    return (
        <NotificationSseProvider>
            <Outlet />
        </NotificationSseProvider>
    )
}
