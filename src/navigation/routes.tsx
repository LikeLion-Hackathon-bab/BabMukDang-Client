import { lazy, Suspense, type ComponentType, type ReactNode } from 'react'
import { defineConfig } from '@stackflow/config'

export type NavigationActivityParams = Record<string, string | undefined>

export type NavigationAccess = 'root' | 'publicOnly' | 'guest' | 'authenticated'
export type NavigationLayout = 'app' | 'bare' | 'register'

const lazyNamed = <T extends ComponentType<any>>(
    loader: () => Promise<Record<string, unknown>>,
    exportName: string
) => lazy(async () => ({ default: (await loader())[exportName] as T }))

type ActivityParentPath =
    | string
    | ((params: NavigationActivityParams) => string)

type ActivityDefinition = {
    path: string | string[]
    access: NavigationAccess
    layout: NavigationLayout
    component: ComponentType<any>
    parentPath?: ActivityParentPath
    tabRoot?: boolean
}

const activity = <const T extends ActivityDefinition>(definition: T) =>
    definition

export const appActivityDefinitions = {
    RootActivity: activity({
        path: '/',
        access: 'root',
        layout: 'bare',
        component: lazyNamed(() => import('@/pages/AuthGate'), 'AuthGate')
    }),
    LoginActivity: activity({
        path: '/login',
        access: 'publicOnly',
        layout: 'register',
        component: lazyNamed(
            () => import('@/pages/register/StartRegisterPage'),
            'StartRegisterPage'
        )
    }),
    IntroActivity: activity({
        path: '/intro',
        access: 'publicOnly',
        layout: 'bare',
        component: lazyNamed(
            () => import('@/pages/intro/IntroStart'),
            'IntroStart'
        )
    }),
    IntroTutorialActivity: activity({
        path: '/intro/tutorial',
        access: 'publicOnly',
        layout: 'bare',
        component: lazyNamed(
            () => import('@/pages/intro/IntroTutorial'),
            'IntroTutorial'
        )
    }),
    MealPlanSharePreviewActivity: activity({
        path: '/meal-plan-links/:token',
        access: 'guest',
        layout: 'register',
        parentPath: '/login',
        component: lazyNamed(
            () => import('@/pages/meal-plan/MealPlanSharePreviewPage'),
            'MealPlanSharePreviewPage'
        )
    }),
    MealPlanGuestJoinActivity: activity({
        path: '/meal-plan-links/:token/join',
        access: 'guest',
        layout: 'register',
        parentPath: params => `/meal-plan-links/${params.token ?? ''}`,
        component: lazyNamed(
            () => import('@/pages/meal-plan/MealPlanGuestJoinPage'),
            'MealPlanGuestJoinPage'
        )
    }),
    MealPlanGuestSessionActivity: activity({
        path: '/meal-plan-links/:token/session',
        access: 'guest',
        layout: 'register',
        parentPath: params => `/meal-plan-links/${params.token ?? ''}/join`,
        component: lazyNamed(
            () => import('@/pages/meal-plan/MealPlanGuestSessionPage'),
            'MealPlanGuestSessionPage'
        )
    }),
    HomeActivity: activity({
        path: '/home',
        access: 'authenticated',
        layout: 'app',
        tabRoot: true,
        component: lazyNamed(
            () => import('@/pages/navigation/HomePage'),
            'HomePage'
        )
    }),
    ProfileActivity: activity({
        path: '/profile',
        access: 'authenticated',
        layout: 'app',
        tabRoot: true,
        component: lazyNamed(
            () => import('@/pages/navigation/ProfilePage'),
            'ProfilePage'
        )
    }),
    FriendActivity: activity({
        path: '/friend',
        access: 'authenticated',
        layout: 'app',
        tabRoot: true,
        component: lazyNamed(
            () => import('@/pages/navigation/FriendPage'),
            'FriendPage'
        )
    }),
    FriendAddActivity: activity({
        path: '/friend/add',
        access: 'authenticated',
        layout: 'app',
        parentPath: '/friend',
        component: lazyNamed(
            () => import('@/pages/navigation/FriendAddPage'),
            'FriendAddPage'
        )
    }),
    MeetingActivity: activity({
        path: ['/meeting', '/meal-plans', '/meal-map'],
        access: 'authenticated',
        layout: 'app',
        tabRoot: true,
        component: lazyNamed(
            () => import('@/pages/navigation/MeetingPage'),
            'MeetingPage'
        )
    }),
    MealPlanStartActivity: activity({
        path: '/meal-plans/start',
        access: 'authenticated',
        layout: 'app',
        parentPath: '/meeting',
        component: lazyNamed(
            () => import('@/pages/meal-plan/MealPlanStartPage'),
            'MealPlanStartPage'
        )
    }),
    MealPlanDetailActivity: activity({
        path: '/meal-plans/:mealPlanId',
        access: 'authenticated',
        layout: 'app',
        parentPath: '/meeting',
        component: lazyNamed(
            () => import('@/pages/meal-plan/MealPlanDetailPage'),
            'MealPlanDetailPage'
        )
    }),
    MealPlanDecisionActivity: activity({
        path: '/meal-plans/:mealPlanId/decision',
        access: 'authenticated',
        layout: 'app',
        parentPath: params => `/meal-plans/${params.mealPlanId ?? ''}`,
        component: lazyNamed(
            () => import('@/pages/meal-plan/MealPlanDecisionPage'),
            'MealPlanDecisionPage'
        )
    }),
    MealPlanDecisionDateActivity: activity({
        path: '/meal-plans/:mealPlanId/decision/date',
        access: 'authenticated',
        layout: 'app',
        parentPath: params => `/meal-plans/${params.mealPlanId ?? ''}/decision`,
        component: lazyNamed(
            () => import('@/pages/meal-plan/MealPlanStageVotePage'),
            'MealPlanDateVotePage'
        )
    }),
    MealPlanDecisionTimeActivity: activity({
        path: '/meal-plans/:mealPlanId/decision/time',
        access: 'authenticated',
        layout: 'app',
        parentPath: params => `/meal-plans/${params.mealPlanId ?? ''}/decision`,
        component: lazyNamed(
            () => import('@/pages/meal-plan/MealPlanStageVotePage'),
            'MealPlanTimeVotePage'
        )
    }),
    MealPlanDecisionAreaActivity: activity({
        path: '/meal-plans/:mealPlanId/decision/area',
        access: 'authenticated',
        layout: 'app',
        parentPath: params => `/meal-plans/${params.mealPlanId ?? ''}/decision`,
        component: lazyNamed(
            () => import('@/pages/meal-plan/MealPlanStageVotePage'),
            'MealPlanAreaVotePage'
        )
    }),
    MealPlanDecisionMenuActivity: activity({
        path: '/meal-plans/:mealPlanId/decision/menu',
        access: 'authenticated',
        layout: 'app',
        parentPath: params => `/meal-plans/${params.mealPlanId ?? ''}/decision`,
        component: lazyNamed(
            () => import('@/pages/meal-plan/MealPlanStageVotePage'),
            'MealPlanMenuVotePage'
        )
    }),
    MealPlanDecisionRestaurantActivity: activity({
        path: '/meal-plans/:mealPlanId/decision/restaurant',
        access: 'authenticated',
        layout: 'app',
        parentPath: params => `/meal-plans/${params.mealPlanId ?? ''}/decision`,
        component: lazyNamed(
            () => import('@/pages/meal-plan/MealPlanStageVotePage'),
            'MealPlanRestaurantVotePage'
        )
    }),
    MealPlanDecisionFinalActivity: activity({
        path: '/meal-plans/:mealPlanId/decision/final',
        access: 'authenticated',
        layout: 'app',
        parentPath: params => `/meal-plans/${params.mealPlanId ?? ''}/decision`,
        component: lazyNamed(
            () => import('@/pages/meal-plan/MealPlanFinalConfirmPage'),
            'MealPlanFinalConfirmPage'
        )
    }),
    MealPlanDecisionChatActivity: activity({
        path: '/meal-plans/:mealPlanId/decision/chat',
        access: 'authenticated',
        layout: 'app',
        parentPath: params => `/meal-plans/${params.mealPlanId ?? ''}/decision`,
        component: lazyNamed(
            () => import('@/pages/meal-plan/MealPlanDecisionChatPage'),
            'MealPlanDecisionChatPage'
        )
    }),
    MealPlanDecisionSubActivity: activity({
        path: '/meal-plans/:mealPlanId/decision/:decisionStep',
        access: 'authenticated',
        layout: 'app',
        parentPath: params => `/meal-plans/${params.mealPlanId ?? ''}/decision`,
        component: lazyNamed(
            () => import('@/pages/meal-plan/MealPlanDecisionPage'),
            'MealPlanDecisionPage'
        )
    }),
    MealPlanRecordEntryActivity: activity({
        path: '/meal-plans/:mealPlanId/record',
        access: 'authenticated',
        layout: 'app',
        parentPath: params => `/meal-plans/${params.mealPlanId ?? ''}`,
        component: lazyNamed(
            () => import('@/pages/meal-plan/MealPlanRecordEntryPage'),
            'MealPlanRecordEntryPage'
        )
    }),
    MealGroupListActivity: activity({
        path: '/meal-groups',
        access: 'authenticated',
        layout: 'app',
        component: lazyNamed(
            () => import('@/pages/meal-group/MealGroupListPage'),
            'MealGroupListPage'
        )
    }),
    MealGroupDetailActivity: activity({
        path: '/meal-groups/:mealGroupId',
        access: 'authenticated',
        layout: 'app',
        parentPath: '/meal-groups',
        component: lazyNamed(
            () => import('@/pages/meal-group/MealGroupDetailPage'),
            'MealGroupDetailPage'
        )
    }),
    SearchRestaurantActivity: activity({
        path: '/search-restaurant',
        access: 'authenticated',
        layout: 'app',
        parentPath: params =>
            params.mealPlanId
                ? `/meal-plans/${params.mealPlanId}/record`
                : '/home',
        component: lazyNamed(
            () => import('@/pages/home/SearchRestaurantPage'),
            'SearchRestaurantPage'
        )
    }),
    NotificationStorageActivity: activity({
        path: '/noti',
        access: 'authenticated',
        layout: 'app',
        parentPath: '/home',
        component: lazyNamed(
            () => import('@/pages/home/NotiStoragePage'),
            'NotiStoragePage'
        )
    }),
    UploadActivity: activity({
        path: '/upload',
        access: 'authenticated',
        layout: 'app',
        parentPath: '/home',
        component: lazyNamed(
            () => import('@/pages/home/UploadPage'),
            'UploadPage'
        )
    }),
    CommentActivity: activity({
        path: '/post/:postId',
        access: 'authenticated',
        layout: 'app',
        parentPath: '/home',
        component: lazyNamed(
            () => import('@/pages/home/CommentPage'),
            'CommentPage'
        )
    }),
    CouponStorageActivity: activity({
        path: '/coupon',
        access: 'authenticated',
        layout: 'app',
        parentPath: '/profile',
        component: lazyNamed(
            () => import('@/pages/profile/CouponStoragePage'),
            'CouponStoragePage'
        )
    }),
    ProfileEditActivity: activity({
        path: '/profile-edit',
        access: 'authenticated',
        layout: 'app',
        parentPath: '/profile',
        component: lazyNamed(
            () => import('@/pages/profile/ProfileEditPage'),
            'ProfileEditPage'
        )
    }),
    BobCheckHistoryActivity: activity({
        path: '/bob-check-history',
        access: 'authenticated',
        layout: 'app',
        parentPath: '/profile',
        component: lazyNamed(
            () => import('@/pages/profile/BobCheckHistoryPage'),
            'BobCheckHistoryPage'
        )
    }),
    ChallengeActivity: activity({
        path: '/challenge',
        access: 'authenticated',
        layout: 'app',
        parentPath: '/home',
        component: lazyNamed(
            () => import('@/pages/profile/ChallengePage'),
            'ChallengePage'
        )
    }),
    FriendProfileActivity: activity({
        path: '/friend-profile',
        access: 'authenticated',
        layout: 'app',
        parentPath: '/friend',
        component: lazyNamed(
            () => import('@/pages/profile/FriendProfilePage'),
            'FriendProfilePage'
        )
    }),
    AllergicMenuActivity: activity({
        path: '/allergic-menu',
        access: 'authenticated',
        layout: 'register',
        component: lazyNamed(
            () => import('@/pages/register/AllergicMenuPage'),
            'AllergicMenuPage'
        )
    }),
    PreferMenuActivity: activity({
        path: '/prefer-menu',
        access: 'authenticated',
        layout: 'register',
        component: lazyNamed(
            () => import('@/pages/register/PreferMenuPage'),
            'PreferMenuPage'
        )
    }),
    OnboardingProfileActivity: activity({
        path: '/onboarding',
        access: 'authenticated',
        layout: 'register',
        component: lazyNamed(
            () => import('@/pages/register/MakeProfilePage'),
            'MakeProfilePage'
        )
    }),
    FinishRegisterActivity: activity({
        path: '/finish-register',
        access: 'authenticated',
        layout: 'register',
        component: lazyNamed(
            () => import('@/pages/register/FinishRegisterPage'),
            'FinishRegisterPage'
        )
    }),
    GpsTestActivity: activity({
        path: '/gps',
        access: 'authenticated',
        layout: 'app',
        component: lazyNamed(() => import('@/pages/test/GPSPage'), 'GPSPage')
    }),
    NotificationTestActivity: activity({
        path: '/notifications',
        access: 'authenticated',
        layout: 'app',
        component: lazyNamed(
            () => import('@/pages/test/NotificationPage'),
            'NotificationPage'
        )
    }),
    PushTestActivity: activity({
        path: '/push',
        access: 'authenticated',
        layout: 'app',
        component: lazyNamed(
            () => import('@/pages/test/PushNotificationPage'),
            'PushNotificationPage'
        )
    }),
    TestActivity: activity({
        path: '/test',
        access: 'authenticated',
        layout: 'app',
        component: lazyNamed(() => import('@/pages/test/TestPage'), 'TestPage')
    })
} satisfies Record<string, ActivityDefinition>

export type AppActivityName = keyof typeof appActivityDefinitions
const appActivityEntries = Object.entries(appActivityDefinitions) as Array<
    [AppActivityName, ActivityDefinition]
>

export const TAB_ROOT_ACTIVITY_NAMES = appActivityEntries
    .filter(([, definition]) => definition.tabRoot)
    .map(([name]) => name)

export const isTabRootActivity = (name: AppActivityName) =>
    TAB_ROOT_ACTIVITY_NAMES.includes(name)

export type AppActivityRoute = {
    name: AppActivityName
    path: string | string[]
    access: NavigationAccess
    layout: NavigationLayout
    parentPath?: ActivityParentPath
}

export const appActivityRoutes: readonly AppActivityRoute[] =
    appActivityEntries.map(([name, definition]) => ({
        name,
        path: definition.path,
        access: definition.access,
        layout: definition.layout,
        parentPath: definition.parentPath
    }))

export const getRoutePatterns = (route: AppActivityRoute): string[] =>
    Array.isArray(route.path) ? route.path : [route.path]

export const getRouteByActivityName = (name: string) =>
    appActivityRoutes.find(route => route.name === name)

const escapeRegExp = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const compileRoutePattern = (pattern: string) => {
    const parameterNames: string[] = []
    const matcher = pattern
        .split('/')
        .map(segment => {
            if (!segment) return ''
            if (!segment.startsWith(':')) return escapeRegExp(segment)
            parameterNames.push(segment.slice(1))
            return '([^/]+)'
        })
        .join('/')

    return {
        parameterNames,
        regexp: new RegExp(`^${matcher || '/'}/*$`)
    }
}

const parsePath = (to: string) => {
    const url = new URL(to, window.location.origin)
    return {
        pathname: url.pathname || '/',
        search: url.search,
        hash: url.hash,
        url
    }
}

export type ResolvedNavigationTarget = {
    route: AppActivityRoute
    params: NavigationActivityParams
    pathname: string
    search: string
    hash: string
}

export const resolvePathToActivity = (
    to: string
): ResolvedNavigationTarget | null => {
    const { pathname, search, hash, url } = parsePath(to)

    for (const route of appActivityRoutes) {
        for (const pattern of getRoutePatterns(route)) {
            const { regexp, parameterNames } = compileRoutePattern(pattern)
            const match = pathname.match(regexp)
            if (!match) continue

            const params: NavigationActivityParams = {}
            parameterNames.forEach((name, index) => {
                params[name] = decodeURIComponent(match[index + 1])
            })
            url.searchParams.forEach((value, key) => {
                params[key] = value
            })

            return { route, params, pathname, search, hash }
        }
    }

    return null
}

export const buildPathFromActivity = (
    route: AppActivityRoute,
    params: NavigationActivityParams
): string => {
    const pattern = getRoutePatterns(route)[0]
    const parameterNames: string[] = []
    const pathname = pattern.replace(/:([A-Za-z0-9_]+)/g, (_, name: string) => {
        parameterNames.push(name)
        return encodeURIComponent(params[name] ?? '')
    })

    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
        if (value == null || value === '' || parameterNames.includes(key))
            return
        searchParams.set(key, value)
    })

    const query = searchParams.toString()
    return query ? `${pathname}?${query}` : pathname
}

export const getParentPathByActivity = (
    name: string,
    params: NavigationActivityParams
): string | null => {
    const route = getRouteByActivityName(name)
    if (!route?.parentPath) return null
    return typeof route.parentPath === 'function'
        ? route.parentPath(params)
        : route.parentPath
}

export const getParentPathByPath = (to: string): string | null => {
    const target = resolvePathToActivity(to)
    if (!target) return null
    return getParentPathByActivity(target.route.name, target.params)
}

export type NavigationLocation = {
    pathname: string
    search: string
    hash: string
    state: unknown
    key: string
}

export const getActivityLocation = (activity: {
    id: string
    name: string
    params: NavigationActivityParams
}): NavigationLocation => {
    const route = getRouteByActivityName(activity.name)
    const fullPath = route ? buildPathFromActivity(route, activity.params) : '/'
    const url = new URL(fullPath, window.location.origin)

    return {
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        state: null,
        key: activity.id
    }
}

declare module '@stackflow/config' {
    interface Register extends Record<
        AppActivityName,
        NavigationActivityParams
    > {}
}

export const stackflowConfig = defineConfig({
    activities: appActivityRoutes.map(route => ({
        name: route.name,
        route: route.path
    })),
    transitionDuration: 280
})

const LoadingFallback = () => (
    <div className="bg-gray-1 text-caption-regular text-gray-5 flex min-h-screen items-center justify-center px-20">
        화면을 불러오는 중입니다.
    </div>
)

type ActivityShellComponent = ComponentType<{ children: ReactNode }>

const createActivity = (
    Page: ComponentType<any>,
    ActivityShell: ActivityShellComponent
) =>
    function ActivityComponent(_props: { params: NavigationActivityParams }) {
        return (
            <ActivityShell>
                <Suspense fallback={<LoadingFallback />}>
                    <Page />
                </Suspense>
            </ActivityShell>
        )
    }

export const createStackflowActivityComponents = (
    ActivityShell: ActivityShellComponent
) =>
    Object.fromEntries(
        appActivityEntries.map(([name, definition]) => [
            name,
            createActivity(definition.component, ActivityShell)
        ])
    ) as unknown as Record<
        AppActivityName,
        ComponentType<{ params: NavigationActivityParams }>
    >
