export type NavigationActivityParams = Record<string, string | undefined>

export type NavigationAccess = 'root' | 'publicOnly' | 'guest' | 'authenticated'
export type NavigationLayout = 'app' | 'bare' | 'register'

export type AppActivityName =
    | 'RootActivity'
    | 'LoginActivity'
    | 'IntroActivity'
    | 'IntroTutorialActivity'
    | 'MealPlanSharePreviewActivity'
    | 'MealPlanGuestJoinActivity'
    | 'MealPlanGuestSessionActivity'
    | 'HomeActivity'
    | 'ProfileActivity'
    | 'FriendActivity'
    | 'MeetingActivity'
    | 'MealMapActivity'
    | 'MealPlanStartActivity'
    | 'MealPlanDetailActivity'
    | 'MealPlanDecisionActivity'
    | 'MealPlanRecordEntryActivity'
    | 'MealGroupListActivity'
    | 'MealGroupDetailActivity'
    | 'SearchRestaurantActivity'
    | 'NotificationStorageActivity'
    | 'UploadActivity'
    | 'CommentActivity'
    | 'CouponStorageActivity'
    | 'ProfileEditActivity'
    | 'BobCheckHistoryActivity'
    | 'ChallengeActivity'
    | 'FriendProfileActivity'
    | 'AllergicMenuActivity'
    | 'PreferMenuActivity'
    | 'OnboardingProfileActivity'
    | 'FinishRegisterActivity'
    | 'GpsTestActivity'
    | 'NotificationTestActivity'
    | 'PushTestActivity'
    | 'TestActivity'

export const TAB_ROOT_ACTIVITY_NAMES: readonly AppActivityName[] = [
    'HomeActivity',
    'MealMapActivity',
    'FriendActivity',
    'MeetingActivity',
    'ProfileActivity'
]

export const isTabRootActivity = (name: AppActivityName) =>
    TAB_ROOT_ACTIVITY_NAMES.includes(name)
export type AppActivityRoute = {
    name: AppActivityName
    path: string | string[]
    access: NavigationAccess
    layout: NavigationLayout
}

export const appActivityRoutes: readonly AppActivityRoute[] = [
    { name: 'RootActivity', path: '/', access: 'root', layout: 'bare' },
    {
        name: 'LoginActivity',
        path: '/login',
        access: 'publicOnly',
        layout: 'register'
    },
    {
        name: 'IntroActivity',
        path: '/intro',
        access: 'publicOnly',
        layout: 'bare'
    },
    {
        name: 'IntroTutorialActivity',
        path: '/intro/tutorial',
        access: 'publicOnly',
        layout: 'bare'
    },
    {
        name: 'MealPlanSharePreviewActivity',
        path: '/meal-plan-links/:token',
        access: 'guest',
        layout: 'register'
    },
    {
        name: 'MealPlanGuestJoinActivity',
        path: '/meal-plan-links/:token/join',
        access: 'guest',
        layout: 'register'
    },
    {
        name: 'MealPlanGuestSessionActivity',
        path: '/meal-plan-links/:token/session',
        access: 'guest',
        layout: 'register'
    },
    {
        name: 'HomeActivity',
        path: '/home',
        access: 'authenticated',
        layout: 'app'
    },
    {
        name: 'ProfileActivity',
        path: '/profile',
        access: 'authenticated',
        layout: 'app'
    },
    {
        name: 'FriendActivity',
        path: '/friend',
        access: 'authenticated',
        layout: 'app'
    },
    {
        name: 'MeetingActivity',
        path: ['/meeting', '/meal-plans'],
        access: 'authenticated',
        layout: 'app'
    },
    {
        name: 'MealMapActivity',
        path: '/meal-map',
        access: 'authenticated',
        layout: 'app'
    },
    {
        name: 'MealPlanStartActivity',
        path: '/meal-plans/start',
        access: 'authenticated',
        layout: 'app'
    },
    {
        name: 'MealPlanDetailActivity',
        path: '/meal-plans/:mealPlanId',
        access: 'authenticated',
        layout: 'app'
    },
    {
        name: 'MealPlanDecisionActivity',
        path: '/meal-plans/:mealPlanId/decision',
        access: 'authenticated',
        layout: 'app'
    },
    {
        name: 'MealPlanRecordEntryActivity',
        path: '/meal-plans/:mealPlanId/record',
        access: 'authenticated',
        layout: 'app'
    },
    {
        name: 'MealGroupListActivity',
        path: '/meal-groups',
        access: 'authenticated',
        layout: 'app'
    },
    {
        name: 'MealGroupDetailActivity',
        path: '/meal-groups/:mealGroupId',
        access: 'authenticated',
        layout: 'app'
    },
    {
        name: 'SearchRestaurantActivity',
        path: '/search-restaurant',
        access: 'authenticated',
        layout: 'app'
    },
    {
        name: 'NotificationStorageActivity',
        path: '/noti',
        access: 'authenticated',
        layout: 'app'
    },
    {
        name: 'UploadActivity',
        path: '/upload',
        access: 'authenticated',
        layout: 'app'
    },
    {
        name: 'CommentActivity',
        path: '/post/:postId',
        access: 'authenticated',
        layout: 'app'
    },
    {
        name: 'CouponStorageActivity',
        path: '/coupon',
        access: 'authenticated',
        layout: 'app'
    },
    {
        name: 'ProfileEditActivity',
        path: '/profile-edit',
        access: 'authenticated',
        layout: 'app'
    },
    {
        name: 'BobCheckHistoryActivity',
        path: '/bob-check-history',
        access: 'authenticated',
        layout: 'app'
    },
    {
        name: 'ChallengeActivity',
        path: '/challenge',
        access: 'authenticated',
        layout: 'app'
    },
    {
        name: 'FriendProfileActivity',
        path: '/friend-profile',
        access: 'authenticated',
        layout: 'app'
    },
    {
        name: 'AllergicMenuActivity',
        path: '/allergic-menu',
        access: 'authenticated',
        layout: 'register'
    },
    {
        name: 'PreferMenuActivity',
        path: '/prefer-menu',
        access: 'authenticated',
        layout: 'register'
    },
    {
        name: 'OnboardingProfileActivity',
        path: '/onboarding',
        access: 'authenticated',
        layout: 'register'
    },
    {
        name: 'FinishRegisterActivity',
        path: '/finish-register',
        access: 'authenticated',
        layout: 'register'
    },
    {
        name: 'GpsTestActivity',
        path: '/gps',
        access: 'authenticated',
        layout: 'app'
    },
    {
        name: 'NotificationTestActivity',
        path: '/notifications',
        access: 'authenticated',
        layout: 'app'
    },
    {
        name: 'PushTestActivity',
        path: '/push',
        access: 'authenticated',
        layout: 'app'
    },
    {
        name: 'TestActivity',
        path: '/test',
        access: 'authenticated',
        layout: 'app'
    }
]

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
