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
import { useMealPlanEvents } from '@/socket/useMealPlanEvents'
import type { MealPlanSocket } from '@/socket/mealPlanSocket.types'
import { useAuthStore } from '@/store/authStore'
import { useMealPlanStore } from '@/store/mealPlanStore'

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

    useMealPlanEvents(socket)

    const mealPlanState = useMealPlanStore()

    useEffect(() => {
        const canConnectAsGuest = Boolean(guestSessionToken && shareLinkToken)
        if (!accessToken && !canConnectAsGuest) {
            if (!isPending && !isError) {
                refreshToken()
            }
            return
        }

        const nextSocket: MealPlanSocket = io(
            `${import.meta.env.VITE_WEBSOCKET_SERVER_URL}/meal-plans`,
            {
                auth: accessToken
                    ? { token: accessToken }
                    : { guestSessionToken, shareLinkToken }
            }
        )

        setSocket(nextSocket)

        if (mealPlanId) {
            nextSocket.emit('mealPlan:join', { mealPlanId })
        }

        return () => {
            if (mealPlanId) {
                nextSocket.emit('mealPlan:leave', { mealPlanId })
            }
            nextSocket.removeAllListeners()
            nextSocket.close()
            setSocket(null)
            useMealPlanStore.getState().resetMealPlanState()
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
