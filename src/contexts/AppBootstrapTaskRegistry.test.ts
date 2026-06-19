import { describe, expect, it } from 'vitest'
import {
    AppBootstrapTaskRegistry,
    defaultAppBootstrapTaskRegistry,
    type AppBootstrapTask
} from './AppBootstrapTaskRegistry'

const noopTask = (
    id: string,
    phase: AppBootstrapTask['phase']
): AppBootstrapTask => ({
    id,
    phase,
    description: id,
    shouldRun: () => false,
    run: () => undefined
})

describe('AppBootstrapTaskRegistry', () => {
    it('returns tasks in bootstrap phase order', () => {
        const registry = new AppBootstrapTaskRegistry([
            noopTask('z-post', 'POST_AUTH'),
            noopTask('a-profile', 'PROFILE_BOOTSTRAP'),
            noopTask('b-auth', 'AUTH_RECOVERY')
        ])

        expect(registry.getTasks().map(task => task.id)).toEqual([
            'b-auth',
            'a-profile',
            'z-post'
        ])
    })

    it('rejects duplicate task ids', () => {
        const registry = new AppBootstrapTaskRegistry()
        registry.register(noopTask('same', 'POST_AUTH'))

        expect(() => registry.register(noopTask('same', 'POST_AUTH'))).toThrow(
            /Duplicate app bootstrap task id/
        )
    })

    it('ships auth recovery, profile loading, passive permission sync, stale location sync, and push registration tasks by default', () => {
        expect(
            defaultAppBootstrapTaskRegistry.getTasks().map(task => task.id)
        ).toEqual([
            'auth.refresh-session',
            'profile.load-me',
            'permissions.sync',
            'location.sync-if-stale',
            'push.register-token'
        ])
    })
})
