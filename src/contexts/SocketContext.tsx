import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react'
import { io } from 'socket.io-client'
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

type SharedMealPlanSocket = {
    socket: MealPlanSocket
    mealPlanId: string
    leases: number
    releaseTimer: number | null
    detachListeners: () => void
}

const sharedSockets = new Map<string, SharedMealPlanSocket>()

function getSocketKey(input: {
    mealPlanId: string
    accessToken: string | null
    guestSessionToken: string | null
    shareLinkToken: string | null
}) {
    if (input.accessToken) {
        return `member:${input.mealPlanId}:${input.accessToken}`
    }

    return `guest:${input.mealPlanId}:${input.guestSessionToken ?? ''}:${input.shareLinkToken ?? ''}`
}

function createSharedSocket(input: {
    key: string
    mealPlanId: string
    accessToken: string | null
    guestSessionToken: string | null
    shareLinkToken: string | null
}) {
    const socket: MealPlanSocket = io(
        `${import.meta.env.VITE_WEBSOCKET_SERVER_URL}/meal-plans`,
        {
            auth: input.accessToken
                ? { token: input.accessToken }
                : {
                      guestSessionToken: input.guestSessionToken,
                      shareLinkToken: input.shareLinkToken
                  }
        }
    )
    const detachListeners = attachMealPlanSocketListeners(
        socket,
        createMealPlanEventHandlers(getMealPlanStoreActions())
    )
    const shared: SharedMealPlanSocket = {
        socket,
        mealPlanId: input.mealPlanId,
        leases: 0,
        releaseTimer: null,
        detachListeners
    }

    sharedSockets.set(input.key, shared)
    socket.emit('mealPlan:join', { mealPlanId: input.mealPlanId })
    return shared
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
    const accessToken = useAuthStore(state => state.accessToken)
    const { mealPlanId: mealPlanIdParam } = useParams<{ mealPlanId: string }>()
    const mealPlanId = mealPlanIdProp ?? mealPlanIdParam
    const { mutate: refreshToken, isPending, isError } = useRefreshToken()
    const commands = useMealPlanCommands(socket)
    const mealPlanState = useMealPlanStore()

    useEffect(() => {
        if (!mealPlanId) {
            setSocket(null)
            return
        }

        const canConnectAsGuest = Boolean(guestSessionToken && shareLinkToken)
        if (!accessToken && !canConnectAsGuest) {
            if (!isPending && !isError) {
                refreshToken()
            }
            return
        }

        const key = getSocketKey({
            mealPlanId,
            accessToken,
            guestSessionToken,
            shareLinkToken
        })
        let shared = sharedSockets.get(key)
        if (!shared) {
            shared = createSharedSocket({
                key,
                mealPlanId,
                accessToken,
                guestSessionToken,
                shareLinkToken
            })
        }

        if (shared.releaseTimer !== null) {
            window.clearTimeout(shared.releaseTimer)
            shared.releaseTimer = null
        }
        shared.leases += 1
        setSocket(shared.socket)

        return () => {
            setSocket(current => (current === shared.socket ? null : current))
            releaseSharedSocket(key, shared)
        }
    }, [
        accessToken,
        guestSessionToken,
        shareLinkToken,
        mealPlanId,
        refreshToken,
        isPending,
        isError
    ])

    const value = useMemo<MealPlanSocketContextValue>(
        () => ({
            socket,
            isConnected: Boolean(socket),
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
