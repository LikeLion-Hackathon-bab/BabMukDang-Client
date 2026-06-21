import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode
} from 'react'
import type { ProfileSummaryView } from '@/viewModels/api'
import {
    useGetLocationSettings,
    useGetMyProfile,
    useRefreshToken,
    useUpdateMemberLocation,
    useRegisterPushToken
} from '@/apis'
import { useAuthStore } from '@/store'
import { LocationSyncService, permissionAdapter } from '@/features/permissions'
import { getPushTokenRegistrationIfAllowed } from '@/features/push'
import {
    defaultAppBootstrapTaskRegistry,
    type AppBootstrapTask,
    type AppBootstrapTaskContext,
    type AppBootstrapTaskRegistry,
    type AppBootstrapTaskStatus
} from './AppBootstrapTaskRegistry'

type AppBootstrapTaskState = {
    status: AppBootstrapTaskStatus
    error?: string
    updatedAt: string
}

type ActiveTaskState = {
    id: string
    phase: AppBootstrapTask['phase']
}

type AppBootstrapContextValue = {
    accessToken: string | null
    profile: ProfileSummaryView | undefined
    isAuthenticated: boolean
    isBootstrapping: boolean
    authError: Error | null
    refreshSession: () => Promise<void>
    runBootstrapTasks: () => void
    activeTaskId: string | null
    taskStates: Record<string, AppBootstrapTaskState>
}

const AppBootstrapContext = createContext<AppBootstrapContextValue | null>(null)

const nowIso = () => new Date().toISOString()

const taskAttemptKey = (
    task: AppBootstrapTask,
    context: AppBootstrapTaskContext
) => `${task.id}:${task.scopeKey?.(context) ?? 'default'}`

const isBlockingBootstrapTask = (task: AppBootstrapTask) =>
    task.phase !== 'POST_AUTH'

export function AppBootstrapProvider({
    children,
    taskRegistry = defaultAppBootstrapTaskRegistry
}: {
    children: ReactNode
    taskRegistry?: AppBootstrapTaskRegistry
}) {
    const accessToken = useAuthStore(state => state.accessToken)
    const [authError, setAuthError] = useState<Error | null>(null)
    const [activeTask, setActiveTask] = useState<ActiveTaskState | null>(null)
    const [taskStates, setTaskStates] = useState<
        Record<string, AppBootstrapTaskState>
    >({})
    const [taskRunnerTick, setTaskRunnerTick] = useState(0)
    const attemptedTaskKeysRef = useRef(new Set<string>())

    const { mutateAsync: refreshTokenAsync, isPending: isRefreshPending } =
        useRefreshToken()

    const {
        data: profile,
        isLoading: isProfileLoading,
        isFetching: isProfileFetching,
        error: profileError,
        refetch: refetchMyProfile
    } = useGetMyProfile({
        enabled: Boolean(accessToken)
    })
    const isProfileBootstrapping =
        Boolean(accessToken) && (isProfileLoading || isProfileFetching)

    const { data: locationSettings, refetch: refetchLocationSettings } =
        useGetLocationSettings({
            enabled: false
        })

    const { mutateAsync: updateMemberLocationAsync } = useUpdateMemberLocation()
    const { mutateAsync: registerPushTokenAsync } = useRegisterPushToken()

    const locationSyncService = useMemo(
        () => new LocationSyncService(permissionAdapter),
        []
    )

    const tasks = useMemo(() => taskRegistry.getTasks(), [taskRegistry])

    const setTaskState = useCallback(
        (taskId: string, state: Omit<AppBootstrapTaskState, 'updatedAt'>) => {
            setTaskStates(prev => ({
                ...prev,
                [taskId]: {
                    ...state,
                    updatedAt: nowIso()
                }
            }))
        },
        []
    )

    const refreshSession = useCallback(async () => {
        await refreshTokenAsync()
    }, [refreshTokenAsync])

    const loadMyProfile = useCallback(async () => {
        const result = await refetchMyProfile()

        if (result.error) {
            throw result.error instanceof Error
                ? result.error
                : new Error('Profile bootstrap failed')
        }

        return result.data
    }, [refetchMyProfile])

    const syncPermissionSettings = useCallback(async () => {
        const result = await refetchLocationSettings()

        if (result.error) {
            throw result.error instanceof Error
                ? result.error
                : new Error('Permission settings bootstrap failed')
        }
    }, [refetchLocationSettings])

    const syncLocationSnapshot = useCallback(async () => {
        const result = locationSettings
            ? { data: locationSettings, error: null }
            : await refetchLocationSettings()

        if (result.error) {
            throw result.error instanceof Error
                ? result.error
                : new Error('Location settings bootstrap failed')
        }

        await locationSyncService.syncIfNeeded({
            settings: result.data,
            updateLocation: updateMemberLocationAsync
        })
    }, [
        locationSettings,
        locationSyncService,
        refetchLocationSettings,
        updateMemberLocationAsync
    ])

    const registerPushToken = useCallback(async () => {
        const registration = await getPushTokenRegistrationIfAllowed()
        if (!registration) return
        await registerPushTokenAsync(registration)
    }, [registerPushTokenAsync])

    const runBootstrapTasks = useCallback(() => {
        setTaskRunnerTick(tick => tick + 1)
    }, [])

    const bootstrapContext = useMemo<AppBootstrapTaskContext>(
        () => ({
            accessToken,
            profile,
            refreshSession,
            loadMyProfile,
            syncPermissionSettings,
            syncLocationSnapshot,
            registerPushToken
        }),
        [
            accessToken,
            loadMyProfile,
            profile,
            refreshSession,
            syncPermissionSettings,
            syncLocationSnapshot,
            registerPushToken
        ]
    )

    useEffect(() => {
        if (accessToken) {
            setAuthError(null)
        }
    }, [accessToken])

    const activeTaskId = activeTask?.id ?? null
    const activeTaskIsBlocking = activeTask
        ? activeTask.phase !== 'POST_AUTH'
        : false

    if (import.meta.env.VITE_ENV === 'develop')
        console.table(
            tasks.map(task => {
                const key = taskAttemptKey(task, bootstrapContext)

                return {
                    id: task.id,
                    key,
                    shouldRun: task.shouldRun(bootstrapContext),
                    attempted: attemptedTaskKeysRef.current.has(key),
                    runnable:
                        task.shouldRun(bootstrapContext) &&
                        !attemptedTaskKeysRef.current.has(key)
                }
            })
        )

    const findRunnableTask = useCallback(
        (
            context: AppBootstrapTaskContext,
            options: { blockingOnly?: boolean } = {}
        ) =>
            tasks.find(task => {
                if (options.blockingOnly && !isBlockingBootstrapTask(task)) {
                    return false
                }
                if (!task.shouldRun(context)) {
                    return false
                }

                return !attemptedTaskKeysRef.current.has(
                    taskAttemptKey(task, context)
                )
            }) ?? null,
        [tasks]
    )

    useEffect(() => {
        if (activeTask || authError) {
            return
        }

        const nextTask = findRunnableTask(bootstrapContext)

        if (!nextTask) {
            return
        }

        const attemptKey = taskAttemptKey(nextTask, bootstrapContext)

        attemptedTaskKeysRef.current.add(attemptKey)
        setActiveTask({ id: nextTask.id, phase: nextTask.phase })
        setTaskState(nextTask.id, { status: 'running' })

        Promise.resolve(nextTask.run(bootstrapContext))
            .then(() => {
                setTaskState(nextTask.id, { status: 'success' })
            })
            .catch(error => {
                const normalizedError =
                    error instanceof Error
                        ? error
                        : new Error(`${nextTask.id} failed`)

                setTaskState(nextTask.id, {
                    status: 'error',
                    error: normalizedError.message
                })
                setAuthError(normalizedError)
            })
            .finally(() => {
                setActiveTask(null)
            })
    }, [
        activeTask,
        authError,
        bootstrapContext,
        findRunnableTask,
        setTaskState,
        taskRunnerTick
    ])

    const hasRunnableTask = Boolean(findRunnableTask(bootstrapContext))
    const hasRunnableBlockingTask = Boolean(
        findRunnableTask(bootstrapContext, { blockingOnly: true })
    )

    console.log(
        'isBootstrapping:',
        activeTaskIsBlocking,
        isRefreshPending,
        isProfileFetching,

        !authError && hasRunnableBlockingTask,
        !authError && hasRunnableTask
    )
    const value = useMemo<AppBootstrapContextValue>(
        () => ({
            accessToken,
            profile,
            isAuthenticated: Boolean(accessToken && profile),
            isBootstrapping:
                activeTaskIsBlocking ||
                isRefreshPending ||
                isProfileBootstrapping ||
                (!authError && hasRunnableBlockingTask),
            authError,
            refreshSession,
            runBootstrapTasks,
            activeTaskId,
            taskStates
        }),
        [
            accessToken,
            activeTaskId,
            activeTaskIsBlocking,
            authError,
            hasRunnableBlockingTask,
            isProfileBootstrapping,
            isRefreshPending,
            profile,
            refreshSession,
            runBootstrapTasks,
            taskStates
        ]
    )

    return (
        <AppBootstrapContext.Provider value={value}>
            {children}
        </AppBootstrapContext.Provider>
    )
}

export function useAppBootstrap() {
    const ctx = useContext(AppBootstrapContext)
    if (!ctx) {
        throw new Error(
            'useAppBootstrap must be used inside <AppBootstrapProvider>'
        )
    }
    return ctx
}
