import { Capacitor, registerPlugin } from '@capacitor/core'
import { CapgoLiveActivities } from '@capgo/capacitor-live-activities'
import type {
    MealPlanId,
    MealPlanLiveActivityPlatform,
    MealPlanLiveActivityState,
    RegisterMealPlanLiveActivitySessionRequest
} from '@kimdaegyu/babmukdang-shared/domain'
import { getOrCreateDeviceId } from '@/features/push'

type NativeBridgeResult = {
    activityId: string
    pushToken?: string
}

type AndroidLiveUpdatePlugin = {
    startOrUpdate(input: {
        mealPlanId: string
        title: string
        status: string
        scheduledAt: string | null
        restaurantName: string | null
        placeName: string | null
        deepLink: string
        progressLabel: string
        updatedAt: string
    }): Promise<NativeBridgeResult>
    end(input: { mealPlanId: string; activityId?: string }): Promise<void>
}

const AndroidLiveUpdates = registerPlugin<AndroidLiveUpdatePlugin>(
    'BabMukDangAndroidLiveUpdates'
)

const appVersion = import.meta.env.VITE_APP_VERSION ?? 'web-dev'
const buildNumber = import.meta.env.VITE_BUILD_NUMBER ?? undefined
const activityIdStorageKey = (mealPlanId: MealPlanId) =>
    `babmukdang:meal-plan-live-activity:${mealPlanId}`

const getPlatform = (): MealPlanLiveActivityPlatform | null => {
    if (!Capacitor.isNativePlatform()) return null
    const platform = Capacitor.getPlatform()
    if (platform === 'ios') return 'IOS_LIVE_ACTIVITY'
    if (platform === 'android') return 'ANDROID_LIVE_UPDATE'
    return null
}

const getStoredActivityId = (mealPlanId: MealPlanId): string | null => {
    try {
        return localStorage.getItem(activityIdStorageKey(mealPlanId))
    } catch {
        return null
    }
}

const setStoredActivityId = (mealPlanId: MealPlanId, activityId: string) => {
    try {
        localStorage.setItem(activityIdStorageKey(mealPlanId), activityId)
    } catch {
        // localStorage is best-effort only.
    }
}

const clearStoredActivityId = (mealPlanId: MealPlanId) => {
    try {
        localStorage.removeItem(activityIdStorageKey(mealPlanId))
    } catch {
        // localStorage is best-effort only.
    }
}

const toActivityProgress = (state: MealPlanLiveActivityState) => {
    if (state.status === 'CONFIRMED') return 0.9
    if (state.status === 'READY') return 0.75
    if (state.status === 'COMPLETED') return 1
    if (state.status === 'RECORDED') return 1
    return 0.45
}

const toCapgoData = (state: MealPlanLiveActivityState) => ({
    mealPlanId: state.mealPlanId,
    title: state.title,
    status: state.status,
    progressLabel: state.progressLabel,
    eta: state.scheduledAt
        ? new Intl.DateTimeFormat('ko-KR', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
          }).format(new Date(state.scheduledAt))
        : '시간 정하는 중',
    place: state.restaurantName ?? state.placeName ?? '장소 정하는 중',
    progress: toActivityProgress(state),
    deepLink: state.deepLink,
    updatedAt: state.updatedAt
})

const buildCapgoStartOptions = (state: MealPlanLiveActivityState) => ({
    layout: {
        type: 'container' as const,
        direction: 'vertical' as const,
        spacing: 6,
        children: [
            {
                type: 'text' as const,
                content: '{{title}}',
                fontSize: 16,
                fontWeight: 'bold' as const,
                lineLimit: 1
            },
            {
                type: 'text' as const,
                content: '{{progressLabel}} · {{eta}}',
                fontSize: 13,
                color: '#666666',
                lineLimit: 1
            },
            {
                type: 'text' as const,
                content: '{{place}}',
                fontSize: 13,
                lineLimit: 1
            },
            {
                type: 'progress' as const,
                value: 'progress',
                tint: '#FF7A45'
            }
        ]
    },
    dynamicIslandLayout: {
        expanded: {
            leading: {
                type: 'text' as const,
                content: '밥약',
                fontSize: 14,
                fontWeight: 'semibold' as const
            },
            trailing: {
                type: 'text' as const,
                content: '{{eta}}',
                fontSize: 13
            },
            center: {
                type: 'text' as const,
                content: '{{progressLabel}}',
                fontSize: 13
            },
            bottom: {
                type: 'progress' as const,
                value: 'progress',
                tint: '#FF7A45'
            }
        },
        compactLeading: {
            type: 'text' as const,
            content: '밥',
            fontSize: 13,
            fontWeight: 'bold' as const
        },
        compactTrailing: {
            type: 'text' as const,
            content: '{{eta}}',
            fontSize: 11
        },
        minimal: {
            type: 'text' as const,
            content: '밥',
            fontSize: 12,
            fontWeight: 'bold' as const
        }
    },
    behavior: {
        widgetUrl: state.deepLink,
        backgroundTint: '#FFF6EE',
        systemActionForegroundColor: '#FF7A45',
        keyLineTint: '#FF7A45'
    },
    data: toCapgoData(state),
    staleDate: state.scheduledAt
        ? new Date(state.scheduledAt).getTime() + 1000 * 60 * 60
        : undefined,
    relevanceScore: 80
})

const startOrUpdateIosLiveActivity = async (
    mealPlanId: MealPlanId,
    state: MealPlanLiveActivityState
): Promise<NativeBridgeResult | null> => {
    const support = await CapgoLiveActivities.areActivitiesSupported()
    if (!support.supported) return null

    const activityId = getStoredActivityId(mealPlanId)
    if (activityId) {
        await CapgoLiveActivities.updateActivity({
            activityId,
            data: toCapgoData(state),
            staleDate: state.scheduledAt
                ? new Date(state.scheduledAt).getTime() + 1000 * 60 * 60
                : undefined
        })
        return { activityId }
    }

    const result = await CapgoLiveActivities.startActivity(
        buildCapgoStartOptions(state)
    )
    setStoredActivityId(mealPlanId, result.activityId)
    return { activityId: result.activityId }
}

const startOrUpdateAndroidLiveUpdate = async (
    _mealPlanId: MealPlanId,
    state: MealPlanLiveActivityState
): Promise<NativeBridgeResult> =>
    AndroidLiveUpdates.startOrUpdate({
        mealPlanId: state.mealPlanId,
        title: state.title,
        status: state.status,
        scheduledAt: state.scheduledAt,
        restaurantName: state.restaurantName,
        placeName: state.placeName,
        deepLink: state.deepLink,
        progressLabel: state.progressLabel,
        updatedAt: state.updatedAt
    })

export const createMealPlanLiveActivityRegistration = async (
    mealPlanId: MealPlanId,
    state: MealPlanLiveActivityState
): Promise<RegisterMealPlanLiveActivitySessionRequest | null> => {
    const platform = getPlatform()
    if (!platform) return null

    const nativeResult =
        platform === 'IOS_LIVE_ACTIVITY'
            ? await startOrUpdateIosLiveActivity(mealPlanId, state)
            : await startOrUpdateAndroidLiveUpdate(mealPlanId, state)

    if (!nativeResult) return null

    return {
        platform,
        deviceId: getOrCreateDeviceId(),
        activityId: nativeResult.activityId,
        pushToken: nativeResult.pushToken,
        appVersion,
        buildNumber
    }
}

export const endNativeMealPlanLiveActivity = async (
    mealPlanId: MealPlanId
): Promise<void> => {
    if (!Capacitor.isNativePlatform()) return
    const platform = getPlatform()
    const activityId = getStoredActivityId(mealPlanId) ?? undefined

    if (platform === 'IOS_LIVE_ACTIVITY' && activityId) {
        await CapgoLiveActivities.endActivity({
            activityId,
            data: { status: '종료됨', progress: 1 },
            dismissalPolicy: 'after',
            dismissAfter: Date.now() + 1000 * 60 * 30
        })
        clearStoredActivityId(mealPlanId)
        return
    }

    if (platform === 'ANDROID_LIVE_UPDATE') {
        await AndroidLiveUpdates.end({ mealPlanId, activityId })
        clearStoredActivityId(mealPlanId)
    }
}
