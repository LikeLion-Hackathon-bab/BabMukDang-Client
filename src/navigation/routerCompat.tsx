import {
    forwardRef,
    useCallback,
    useMemo,
    useEffect,
    type AnchorHTMLAttributes,
    type MouseEvent,
    type ReactNode
} from 'react'
import { useActivity, useFlow, useStack } from '@stackflow/react'
import type { NavigationActivityParams, NavigationLocation } from './routes'
import {
    getActivityLocation,
    getParentPathByActivity,
    resolvePathToActivity,
    type AppActivityName
} from './routes'
import { useNavigationActivityContext } from './NavigationActivityContext'
import { stackflowActions } from './stackflow'

type NavigateOptions = {
    replace?: boolean
    state?: unknown
}

type NavigationDispatcher = {
    push: (
        activityName: AppActivityName,
        params: NavigationActivityParams
    ) => unknown
    replace: (
        activityName: AppActivityName,
        params: NavigationActivityParams
    ) => unknown
    pop: () => void
}

const isModifiedEvent = (event: MouseEvent<HTMLAnchorElement>) =>
    event.metaKey || event.altKey || event.ctrlKey || event.shiftKey

const toPath = (
    to: string | { pathname?: string; search?: string; hash?: string }
) => {
    if (typeof to === 'string') return to
    return `${to.pathname ?? ''}${to.search ?? ''}${to.hash ?? ''}` || '/'
}

const dispatchPath = (
    dispatcher: NavigationDispatcher,
    to: string,
    options: NavigateOptions = {}
) => {
    const target = resolvePathToActivity(to)
    if (!target) {
        window.location.assign(to)
        return
    }

    const action = options.replace ? dispatcher.replace : dispatcher.push
    action(target.route.name, target.params)
}

export const navigateToPath = (to: string, options: NavigateOptions = {}) => {
    dispatchPath(stackflowActions, to, options)
}

export const useNavigate = () => {
    const flow = useFlow()
    const stack = useStack()
    const activity = useActivity()

    return useCallback(
        (to: string | number, options: NavigateOptions = {}) => {
            if (typeof to === 'number') {
                if (to < 0) {
                    const popCount = Math.abs(to)
                    const activeActivities = stack.activities.filter(
                        item => item.transitionState !== 'exit-done'
                    )

                    if (activeActivities.length > popCount) {
                        flow.pop(popCount)
                        return
                    }

                    const fallbackPath = getParentPathByActivity(
                        activity.name,
                        activity.params as NavigationActivityParams
                    )

                    if (fallbackPath) {
                        dispatchPath(
                            flow as unknown as NavigationDispatcher,
                            fallbackPath,
                            { replace: true }
                        )
                    }
                }
                return
            }

            dispatchPath(flow as unknown as NavigationDispatcher, to, options)
        },
        [activity.name, activity.params, flow, stack.activities]
    )
}

export const useLocation = (): NavigationLocation => {
    const context = useNavigationActivityContext()
    const activity = useActivity()

    return useMemo(
        () =>
            context?.location ??
            getActivityLocation({
                id: activity.id,
                name: activity.name,
                params: activity.params as NavigationActivityParams
            }),
        [activity.id, activity.name, activity.params, context?.location]
    )
}

export const useParams = <
    T extends Record<string, string | undefined> = Record<
        string,
        string | undefined
    >
>(): Readonly<Partial<T>> => {
    const context = useNavigationActivityContext()
    const activity = useActivity()
    return (context?.params ?? activity.params) as Readonly<Partial<T>>
}

export const useSearchParams = (): [
    URLSearchParams,
    (
        next: URLSearchParams | string | Record<string, string>,
        options?: NavigateOptions
    ) => void
] => {
    const location = useLocation()
    const navigate = useNavigate()
    const searchParams = useMemo(
        () => new URLSearchParams(location.search),
        [location.search]
    )

    const setSearchParams = useCallback(
        (
            next: URLSearchParams | string | Record<string, string>,
            options?: NavigateOptions
        ) => {
            const nextSearch =
                typeof next === 'string'
                    ? next
                    : next instanceof URLSearchParams
                      ? next.toString()
                      : new URLSearchParams(next).toString()
            navigate(
                `${location.pathname}${nextSearch ? `?${nextSearch}` : ''}${location.hash}`,
                options
            )
        },
        [location.hash, location.pathname, navigate]
    )

    return [searchParams, setSearchParams]
}

export type LinkProps = Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    'href' | 'onClick'
> & {
    to: string | { pathname?: string; search?: string; hash?: string }
    replace?: boolean
    state?: unknown
    reloadDocument?: boolean
    onClick?: AnchorHTMLAttributes<HTMLAnchorElement>['onClick']
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
    {
        to,
        replace = false,
        state,
        reloadDocument = false,
        onClick,
        target,
        ...anchorProps
    },
    ref
) {
    const navigate = useNavigate()
    const href = toPath(to)
    const targetUrl = new URL(href, window.location.origin)
    const isKnownInternalPath =
        targetUrl.origin === window.location.origin &&
        Boolean(resolvePathToActivity(href))

    return (
        <a
            {...anchorProps}
            href={href}
            ref={ref}
            target={target}
            onClick={event => {
                onClick?.(event)
                if (
                    event.defaultPrevented ||
                    reloadDocument ||
                    target === '_blank' ||
                    isModifiedEvent(event) ||
                    !isKnownInternalPath
                ) {
                    return
                }

                event.preventDefault()
                navigate(href, { replace, state })
            }}
        />
    )
})

export function Navigate({
    to,
    replace = false
}: {
    to: string
    replace?: boolean
    state?: unknown
}) {
    const navigate = useNavigate()

    useEffect(() => {
        navigate(to, { replace })
    }, [navigate, replace, to])

    return null
}

export function Outlet({ children }: { children?: ReactNode } = {}) {
    return <>{children ?? null}</>
}

export type MatchPathOptions = {
    path: string
    end?: boolean
}

export const matchPath = (
    pattern: MatchPathOptions | string,
    pathname: string
): { params: Record<string, string> } | null => {
    const path = typeof pattern === 'string' ? pattern : pattern.path
    const end = typeof pattern === 'string' ? true : (pattern.end ?? true)
    const parameterNames: string[] = []
    const escaped = path
        .split('/')
        .map(segment => {
            if (!segment) return ''
            if (segment.startsWith(':')) {
                parameterNames.push(segment.slice(1))
                return '([^/]+)'
            }
            return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        })
        .join('/')
    const matched = pathname.match(
        new RegExp(`^${escaped}${end ? '/?$' : '(?:/|$)'}`)
    )
    if (!matched) return null

    return {
        params: parameterNames.reduce<Record<string, string>>(
            (result, name, index) => {
                result[name] = matched[index + 1]
                return result
            },
            {}
        )
    }
}
