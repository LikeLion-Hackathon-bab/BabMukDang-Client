import { useEffect, type ReactNode } from 'react'
import { useActivity } from '@stackflow/react'
import { useShallow } from 'zustand/react/shallow'
import { Layout, RegisterLayout } from '@/components'
import { useAppBootstrap } from '@/contexts'
import { onboardingFlowController } from '@/features/onboarding'
import { useOnboardingStore } from '@/store'
import { NavigationActivityContext } from './NavigationActivityContext'
import {
    getActivityLocation,
    getRouteByActivityName,
    isTabRootActivity,
    resolvePathToActivity,
    type AppActivityName,
    type AppActivityRoute,
    type NavigationActivityParams
} from './routes'
import { useLocation, useNavigate } from './routerCompat'

const LoadingGate = () => (
    <div className="bg-gray-1 text-body2-medium text-gray-6 flex min-h-screen items-center justify-center px-20">
        로그인 상태를 확인하는 중입니다.
    </div>
)

function NavigationAccessGate({
    route,
    children
}: {
    route: AppActivityRoute
    children: ReactNode
}) {
    const navigate = useNavigate()
    const location = useLocation()
    const { profile, isAuthenticated, isBootstrapping, authError } =
        useAppBootstrap()
    const onboardingDraft = useOnboardingStore(
        useShallow(state => ({
            username: state.username,
            liked: state.liked,
            disliked: state.disliked,
            allergy: state.allergy
        }))
    )

    const redirectParam =
        route.access === 'publicOnly'
            ? new URLSearchParams(location.search).get('redirect')
            : null

    const resolvedRedirectTarget = redirectParam
        ? resolvePathToActivity(redirectParam)
        : null

    const publicOnlyRedirect =
        route.access === 'publicOnly' && isAuthenticated && profile
            ? resolvedRedirectTarget?.route.access === 'authenticated' &&
              onboardingFlowController.resolveProtectedRoute({
                  currentPath: resolvedRedirectTarget.pathname,
                  onboardingStatus: profile.onboardingStatus,
                  draft: onboardingDraft
              }).allow
                ? redirectParam
                : onboardingFlowController.routeAfterAuth(
                      profile.onboardingStatus
                  )
            : null

    const protectedDecision =
        route.access === 'authenticated' && profile
            ? onboardingFlowController.resolveProtectedRoute({
                  currentPath: getActivityLocation({
                      id: 'guard',
                      name: route.name,
                      params: {}
                  }).pathname,
                  onboardingStatus: profile.onboardingStatus,
                  draft: onboardingDraft
              })
            : null

    const currentFullPath = `${location.pathname}${location.search}${location.hash}`
    const loginRedirectPath = `/login?redirect=${encodeURIComponent(currentFullPath)}`
    const protectedRedirect =
        !isBootstrapping && route.access === 'authenticated'
            ? authError || !isAuthenticated
                ? loginRedirectPath
                : !protectedDecision?.allow
                  ? (protectedDecision?.redirectTo ?? '/home')
                  : null
            : null

    const redirectTo = publicOnlyRedirect ?? protectedRedirect

    useEffect(() => {
        if (redirectTo) {
            navigate(redirectTo, { replace: true })
        }
    }, [navigate, redirectTo])

    if (route.access === 'root' || route.access === 'guest') {
        return <>{children}</>
    }

    if (isBootstrapping) {
        return <LoadingGate />
    }

    if (redirectTo) {
        return null
    }

    return <>{children}</>
}
function ActivityLayout({
    route,
    children
}: {
    route: AppActivityRoute
    children: ReactNode
}) {
    if (route.layout === 'app') {
        return (
            <Layout showBottomNavigation={isTabRootActivity(route.name)}>
                {children}
            </Layout>
        )
    }

    if (route.layout === 'register') {
        return <RegisterLayout>{children}</RegisterLayout>
    }

    return <>{children}</>
}

export function NavigationActivityShell({ children }: { children: ReactNode }) {
    const activity = useActivity()
    const route = getRouteByActivityName(activity.name)

    if (!route) {
        throw new Error(`UNREGISTERED_STACKFLOW_ACTIVITY:${activity.name}`)
    }

    const params = activity.params as NavigationActivityParams
    const location = getActivityLocation({
        id: activity.id,
        name: activity.name,
        params
    })

    return (
        <NavigationActivityContext.Provider
            value={{
                activityId: activity.id,
                activityName: activity.name as AppActivityName,
                isTop: activity.isTop,
                params,
                location
            }}>
            <div
                data-stackflow-activity={activity.name}
                data-stackflow-active={activity.isTop ? 'true' : 'false'}
                className={[
                    'absolute inset-0 min-h-0',
                    activity.isTop
                        ? 'pointer-events-auto'
                        : 'pointer-events-none'
                ].join(' ')}
                style={{
                    zIndex: activity.zIndex,
                    transform:
                        activity.transitionState === 'enter-active'
                            ? 'translateX(100%)'
                            : activity.transitionState === 'exit-active'
                              ? 'translateX(100%)'
                              : 'translateX(0)',
                    transition: 'transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}>
                <NavigationAccessGate route={route}>
                    <ActivityLayout route={route}>{children}</ActivityLayout>
                </NavigationAccessGate>
            </div>
        </NavigationActivityContext.Provider>
    )
}
