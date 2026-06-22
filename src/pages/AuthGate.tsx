import { useEffect } from 'react'
import { resolvePathToActivity, useNavigate } from '@/navigation'
import { useAppBootstrap } from '@/contexts'
import { onboardingFlowController } from '@/features/onboarding'

const getCurrentBrowserPath = () =>
    `${window.location.pathname}${window.location.search}${window.location.hash}`

export function AuthGate() {
    const navigate = useNavigate()
    const { profile, isAuthenticated, isBootstrapping, authError } =
        useAppBootstrap()

    useEffect(() => {
        if (authError) {
            navigate('/login', { replace: true })
        }
    }, [authError, navigate])

    useEffect(() => {
        if (!isAuthenticated || !profile) {
            return
        }

        const currentPath = getCurrentBrowserPath()
        const target = resolvePathToActivity(currentPath)
        const canRestoreCurrentPath =
            target?.route.access === 'authenticated' &&
            onboardingFlowController.resolveProtectedRoute({
                currentPath: target.pathname,
                onboardingStatus: profile.onboardingStatus,
                draft: {
                    username: '',
                    liked: [],
                    disliked: [],
                    allergy: []
                }
            }).allow

        navigate(
            canRestoreCurrentPath
                ? currentPath
                : onboardingFlowController.routeAfterAuth(
                      profile.onboardingStatus
                  ),
            {
                replace: true
            }
        )
    }, [isAuthenticated, profile, navigate])

    if (isBootstrapping) {
        return <div>로그인 상태를 확인하는 중입니다.</div>
    }

    return null
}
