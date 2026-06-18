import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppBootstrap } from '@/contexts'
import { onboardingFlowController } from '@/features/onboarding'

export function AuthGate() {
    const navigate = useNavigate()
    const { profile, isBootstrapping, authError } = useAppBootstrap()

    useEffect(() => {
        if (authError) {
            navigate('/login', { replace: true })
        }
    }, [authError, navigate])

    useEffect(() => {
        if (!profile) {
            return
        }

        navigate(onboardingFlowController.routeAfterAuth(profile.onboardingStatus), {
            replace: true
        })
    }, [profile, navigate])

    if (isBootstrapping) {
        return <div>로그인 상태를 확인하는 중입니다.</div>
    }

    return null
}
