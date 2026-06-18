import { Navigate, Outlet } from 'react-router-dom'
import { useAppBootstrap } from '@/contexts'
import { onboardingFlowController } from '@/features/onboarding'

export function PublicOnlyRoute() {
    const { profile, isBootstrapping } = useAppBootstrap()

    if (isBootstrapping) {
        return <div>로그인 상태를 확인하는 중입니다.</div>
    }

    if (profile) {
        return (
            <Navigate
                to={onboardingFlowController.routeAfterAuth(
                    profile.onboardingStatus
                )}
                replace
            />
        )
    }

    return <Outlet />
}
