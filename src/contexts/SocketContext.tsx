import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react'
import { io, type Socket } from 'socket.io-client'
import { useParams } from '@/navigation'

import { useRefreshToken } from '@/apis'
import {
    useMealPlanCommands,
    type MealPlanCommands
} from '@/socket/useMealPlanCommands'
import { createMealPlanEventHandlers } from '@/socket/mealPlanEventHandlers'
import { attachMealPlanSocketListeners } from '@/socket/mealPlanSocket.listener'
import type { MealPlanSocket } from '@/socket/mealPlanSocket.types'
import { useAuthStore } from '@/store/authStore'
import {
    getMealPlanStoreActions,
    useMealPlanStore
} from '@/store/mealPlanStore'

interface MealPlanSocketContextValue {
    socket: MealPlanSocket | null
    isConnected: boolean
    commands: MealPlanCommands | null
    mealPlanId: string | undefined
    guestSessionToken: string | null
    shareLinkToken: string | null
    current: ReturnType<typeof useMealPlanStore.getState>['current']
    participants: ReturnType<typeof useMealPlanStore.getState>['participants']
    decisionStages: ReturnType<
        typeof useMealPlanStore.getState
    >['decisionStages']
    decisionProgress: ReturnType<
        typeof useMealPlanStore.getState
    >['decisionProgress']
    chatMessages: ReturnType<typeof useMealPlanStore.getState>['chatMessages']
    status: ReturnType<typeof useMealPlanStore.getState>['status']
    readyCount: number
    participantCount: number
    isSelfReady: boolean
    setIsSelfReady: (isSelfReady: boolean) => void
    error: ReturnType<typeof useMealPlanStore.getState>['error']
}

const SocketContext = createContext<MealPlanSocketContextValue | null>(null)
const SOCKET_RELEASE_GRACE_MS = 500
/** 갱신 직후에도 토큰 오류가 반복되면 refresh/reconnect 루프를 만들지 않는다. */
const SOCKET_AUTH_RECOVERY_COOLDOWN_MS = 30_000
/** WsJwtGuard가 WsException(`exception` 이벤트)으로 보내는 member 토큰 오류 코드 */
const INVALID_SOCKET_TOKEN_CODES = new Set([
    'WS_INVALID_TOKEN',
    'WS_UNAUTHORIZED'
])

type SharedMealPlanSocket = {
    socket: MealPlanSocket
    mealPlanId: string
    isMember: boolean
    leases: number
    releaseTimer: number | null
    lastAuthRecoveryAt: number
    detachListeners: () => void
}

const sharedSockets = new Map<string, SharedMealPlanSocket>()

function getSocketKey(input: {
    mealPlanId: string
    isMember: boolean
    guestSessionToken: string | null
    shareLinkToken: string | null
}) {
    if (input.isMember) {
        return `member:${input.mealPlanId}`
    }

    return `guest:${input.mealPlanId}:${input.guestSessionToken ?? ''}:${input.shareLinkToken ?? ''}`
}

function createSharedSocket(input: {
    key: string
    mealPlanId: string
    isMember: boolean
    guestSessionToken: string | null
    shareLinkToken: string | null
}) {
    const socket: MealPlanSocket = io(
        `${import.meta.env.VITE_WEBSOCKET_SERVER_URL}/meal-plans`,
        {
            // 연결/재연결 handshake마다 호출되므로 갱신된 access token을 사용한다.
            auth: callback =>
                callback(
                    input.isMember
                        ? { token: useAuthStore.getState().accessToken }
                        : {
                              guestSessionToken: input.guestSessionToken,
                              shareLinkToken: input.shareLinkToken
                          }
                )
        }
    )
    const detachListeners = attachMealPlanSocketListeners(
        socket,
        createMealPlanEventHandlers(getMealPlanStoreActions())
    )
    const shared: SharedMealPlanSocket = {
        socket,
        mealPlanId: input.mealPlanId,
        isMember: input.isMember,
        leases: 0,
        releaseTimer: null,
        lastAuthRecoveryAt: 0,
        detachListeners
    }

    sharedSockets.set(input.key, shared)
    // 재연결된 socket은 서버 room membership을 잃으므로 connect마다 다시 join한다.
    socket.on('connect', () => {
        socket.emit('mealPlan:join', { mealPlanId: input.mealPlanId })
    })
    return shared
}

function readSocketErrorCode(payload: unknown): string | null {
    if (typeof payload === 'string') return payload
    if (!payload || typeof payload !== 'object') return null
    const { code, message } = payload as { code?: unknown; message?: unknown }
    if (typeof code === 'string' && INVALID_SOCKET_TOKEN_CODES.has(code)) {
        return code
    }
    return typeof message === 'string' ? message : null
}

function releaseSharedSocket(key: string, shared: SharedMealPlanSocket) {
    shared.leases = Math.max(0, shared.leases - 1)
    if (shared.leases > 0 || shared.releaseTimer !== null) return

    shared.releaseTimer = window.setTimeout(() => {
        shared.releaseTimer = null
        if (shared.leases > 0) return

        shared.socket.emit('mealPlan:leave', { mealPlanId: shared.mealPlanId })
        shared.detachListeners()
        shared.socket.close()
        sharedSockets.delete(key)

        if (useMealPlanStore.getState().mealPlanId === shared.mealPlanId) {
            useMealPlanStore.getState().resetMealPlanState()
        }
    }, SOCKET_RELEASE_GRACE_MS)
}

export const useSocket = () => {
    const ctx = useContext(SocketContext)
    if (!ctx) throw new Error('useSocket must be used inside <SocketProvider>')
    return ctx
}

type SocketProviderProps = {
    children: React.ReactNode
    mealPlanId?: string
    guestSessionToken?: string | null
    shareLinkToken?: string | null
}

/**
 * A decision activity is replaced on every stage move. Keep the underlying
 * socket alive for a short lease window so the incoming activity adopts the
 * same connection instead of reconnecting and resetting the meal-plan store.
 */
export function SocketProvider({
    children,
    mealPlanId: mealPlanIdProp,
    guestSessionToken = null,
    shareLinkToken = null
}: SocketProviderProps) {
    const [socket, setSocket] = useState<MealPlanSocket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    // 토큰 값 자체가 아니라 존재 여부만 구독해 refresh 때 socket을 재생성하지 않는다.
    const hasAccessToken = useAuthStore(state => Boolean(state.accessToken))
    const { mealPlanId: mealPlanIdParam } = useParams<{ mealPlanId: string }>()
    const mealPlanId = mealPlanIdProp ?? mealPlanIdParam
    const {
        mutate: refreshToken,
        mutateAsync: refreshTokenAsync,
        isPending,
        isError
    } = useRefreshToken()
    const commands = useMealPlanCommands(socket)
    const mealPlanState = useMealPlanStore()

    useEffect(() => {
        if (!mealPlanId) {
            setSocket(null)
            setIsConnected(false)
            return
        }

        const canConnectAsGuest = Boolean(guestSessionToken && shareLinkToken)
        if (!hasAccessToken && !canConnectAsGuest) {
            if (!isPending && !isError) {
                refreshToken()
            }
            return
        }

        const key = getSocketKey({
            mealPlanId,
            isMember: hasAccessToken,
            guestSessionToken,
            shareLinkToken
        })
        let shared = sharedSockets.get(key)
        if (!shared) {
            shared = createSharedSocket({
                key,
                mealPlanId,
                isMember: hasAccessToken,
                guestSessionToken,
                shareLinkToken
            })
        }
        const leased = shared

        if (leased.releaseTimer !== null) {
            window.clearTimeout(leased.releaseTimer)
            leased.releaseTimer = null
        }
        leased.leases += 1
        setSocket(leased.socket)
        setIsConnected(leased.socket.connected)

        // access token 만료로 서버가 토큰 오류를 보내면 refresh 후 새 handshake로 재연결한다.
        const recoverSocketAuth = (code: string | null) => {
            if (
                !leased.isMember ||
                !code ||
                !INVALID_SOCKET_TOKEN_CODES.has(code)
            ) {
                return
            }
            const now = Date.now()
            if (
                now - leased.lastAuthRecoveryAt <
                SOCKET_AUTH_RECOVERY_COOLDOWN_MS
            ) {
                return
            }
            leased.lastAuthRecoveryAt = now

            refreshTokenAsync()
                .then(() => {
                    if (sharedSockets.get(key) !== leased) return
                    leased.socket.disconnect().connect()
                })
                .catch(error => {
                    console.warn(
                        '[meal-plan-socket] token refresh failed',
                        error
                    )
                })
        }

        const handleConnect = () => setIsConnected(true)
        const handleDisconnect = () => setIsConnected(false)
        const handleConnectError = (error: Error) => {
            setIsConnected(false)
            recoverSocketAuth(error.message)
        }
        const handleException = (payload: unknown) =>
            recoverSocketAuth(readSocketErrorCode(payload))
        const handleMealPlanError = (payload: {
            code: string
            message: string
        }) => recoverSocketAuth(readSocketErrorCode(payload))

        // `exception`은 Nest WsException 기본 이벤트라 typed event map 밖에 있다.
        const rawSocket = leased.socket as unknown as Socket
        leased.socket.on('connect', handleConnect)
        leased.socket.on('disconnect', handleDisconnect)
        leased.socket.on('connect_error', handleConnectError)
        leased.socket.on('mealPlan:error', handleMealPlanError)
        rawSocket.on('exception', handleException)

        return () => {
            leased.socket.off('connect', handleConnect)
            leased.socket.off('disconnect', handleDisconnect)
            leased.socket.off('connect_error', handleConnectError)
            leased.socket.off('mealPlan:error', handleMealPlanError)
            rawSocket.off('exception', handleException)
            setSocket(current => (current === leased.socket ? null : current))
            setIsConnected(false)
            releaseSharedSocket(key, leased)
        }
    }, [
        hasAccessToken,
        guestSessionToken,
        shareLinkToken,
        mealPlanId,
        refreshToken,
        refreshTokenAsync,
        isPending,
        isError
    ])

    const value = useMemo<MealPlanSocketContextValue>(
        () => ({
            socket,
            isConnected,
            commands,
            mealPlanId,
            guestSessionToken,
            shareLinkToken,
            current: mealPlanState.current,
            participants: mealPlanState.participants,
            decisionStages: mealPlanState.decisionStages,
            decisionProgress: mealPlanState.decisionProgress,
            chatMessages: mealPlanState.chatMessages,
            status: mealPlanState.status,
            readyCount: mealPlanState.readyCount,
            participantCount: mealPlanState.participantCount,
            isSelfReady: mealPlanState.isSelfReady,
            setIsSelfReady: mealPlanState.setIsSelfReady,
            error: mealPlanState.error
        }),
        [
            socket,
            isConnected,
            commands,
            mealPlanId,
            guestSessionToken,
            shareLinkToken,
            mealPlanState
        ]
    )

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    )
}
