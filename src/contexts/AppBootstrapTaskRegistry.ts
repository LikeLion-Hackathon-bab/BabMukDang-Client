import type { ProfileSummaryView } from '@/viewModels/api'

export type AppBootstrapTaskPhase =
    | 'AUTH_RECOVERY'
    | 'PROFILE_BOOTSTRAP'
    | 'POST_AUTH'

export type AppBootstrapTaskStatus =
    | 'idle'
    | 'running'
    | 'success'
    | 'error'
    | 'skipped'

export interface AppBootstrapTaskContext {
    accessToken: string | null
    profile: ProfileSummaryView | undefined
    refreshSession: () => Promise<void>
    loadMyProfile: () => Promise<ProfileSummaryView | undefined>
    syncPermissionSettings?: () => Promise<void>
    syncLocationSnapshot?: () => Promise<void>
    registerPushToken?: () => Promise<void>
}

export interface AppBootstrapTask {
    id: string
    phase: AppBootstrapTaskPhase
    description: string
    shouldRun: (context: AppBootstrapTaskContext) => boolean
    run: (context: AppBootstrapTaskContext) => Promise<void> | void
    /**
     * 같은 인증 상태에서 task를 한 번만 실행하기 위한 scope key.
     * access token이 바뀌면 다른 인증 상태로 판단되어 다시 실행될 수 있다.
     */
    scopeKey?: (context: AppBootstrapTaskContext) => string
    order?: number
}

const phaseOrder: Record<AppBootstrapTaskPhase, number> = {
    AUTH_RECOVERY: 0,
    PROFILE_BOOTSTRAP: 1,
    POST_AUTH: 2
}
const accessScopeKey = (context: AppBootstrapTaskContext) =>
    `access:${context.accessToken ?? 'none'}`

const memberScopeKey = (context: AppBootstrapTaskContext) =>
    context.profile
        ? `member:${context.profile.memberId}`
        : accessScopeKey(context)
export class AppBootstrapTaskRegistry {
    private readonly tasks = new Map<string, AppBootstrapTask>()

    constructor(tasks: AppBootstrapTask[] = []) {
        tasks.forEach(task => this.register(task))
    }

    register(task: AppBootstrapTask) {
        if (this.tasks.has(task.id)) {
            throw new Error(`Duplicate app bootstrap task id: ${task.id}`)
        }
        this.tasks.set(task.id, task)
        return this
    }

    getTasks(): AppBootstrapTask[] {
        return Array.from(this.tasks.values()).sort((a, b) => {
            const phaseDiff = phaseOrder[a.phase] - phaseOrder[b.phase]
            if (phaseDiff !== 0) return phaseDiff
            const orderDiff = (a.order ?? 0) - (b.order ?? 0)
            if (orderDiff !== 0) return orderDiff
            return a.id.localeCompare(b.id)
        })
    }
}

export const defaultAppBootstrapTaskRegistry = new AppBootstrapTaskRegistry([
    {
        id: 'profile.load-me',
        phase: 'PROFILE_BOOTSTRAP',
        description: 'access token으로 /members/me 프로필을 bootstrap한다.',
        order: 10,
        shouldRun: context => Boolean(context.accessToken) && !context.profile,
        scopeKey: accessScopeKey,
        run: async context => {
            await context.loadMyProfile()
        }
    },
    {
        id: 'permissions.sync',
        phase: 'POST_AUTH',
        description:
            '서버에 저장된 위치 동의/권한 설정을 앱 bootstrap cache에 적재한다.',
        order: 10,
        shouldRun: context => Boolean(context.accessToken && context.profile),
        scopeKey: memberScopeKey,
        run: async context => {
            try {
                await context.syncPermissionSettings?.()
            } catch (error) {
                console.warn(
                    '[bootstrap] passive permission sync failed',
                    error
                )
            }
        }
    },
    {
        id: 'location.sync-if-stale',
        phase: 'POST_AUTH',
        description:
            '권한과 서비스 동의가 모두 유효하고 위치 snapshot이 오래됐을 때만 현재 위치를 갱신한다.',
        order: 20,
        shouldRun: context => Boolean(context.accessToken && context.profile),
        scopeKey: memberScopeKey,
        run: async context => {
            try {
                await context.syncLocationSnapshot?.()
            } catch (error) {
                console.warn('[bootstrap] passive location sync failed', error)
            }
        }
    },
    {
        id: 'push.register-token',
        phase: 'POST_AUTH',
        description:
            '알림 권한이 허용되어 있으면 현재 device push token을 서버에 등록한다.',
        order: 30,
        shouldRun: context => Boolean(context.accessToken && context.profile),
        scopeKey: memberScopeKey,
        run: async context => {
            try {
                await context.registerPushToken?.()
            } catch (error) {
                console.warn(
                    '[bootstrap] passive push token registration failed',
                    error
                )
            }
        }
    }
])
