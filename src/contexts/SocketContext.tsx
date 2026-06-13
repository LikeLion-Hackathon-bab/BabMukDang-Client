import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react'
import { io } from 'socket.io-client'
import { useNavigate, useParams } from 'react-router-dom'
import type {
    FinalState,
    LocationCandidateAddUpdateResponse,
    Participant,
    PhaseDataBroadcast,
    RoomType
} from '@kimdaegyu/babmukdang-shared/domain/room'

import { useRefreshToken } from '@/apis'
import { useRoomCommands, type RoomCommands } from '@/socket/useRoomCommands'
import { useRoomEvents } from '@/socket/useRoomEvents'
import type { RoomSocket } from '@/socket/roomSocket.types'
import { useAuthStore } from '@/store/authStore'
import { useMatchStore, type RoomStage } from '@/store/matchStore'

type Category = { id: string; name: string; imageUrl?: string }

interface FinalStateMessage {
    location?: string
    'exclude-menu'?: string[]
    menu?: string
    restaurant?: string
}

interface RoomContextValue {
    socket: RoomSocket | null
    isConnected: boolean
    commands: RoomCommands | null
    roomId: string | undefined
    matchType: RoomType
    categories: Category[]
    participants: Participant[]
    stage: RoomStage
    phaseData: PhaseDataBroadcast | null
    finalState: FinalState | null
    finalStateMessage: FinalStateMessage
    locationInitial: string | undefined
    meetingAtInitial: string | undefined
    locationCandidates: LocationCandidateAddUpdateResponse
    readyCount: number
    participantCount: number
    isSelfReady: boolean
    setIsSelfReady: (isSelfReady: boolean) => void
    chatMessages: ReturnType<typeof useMatchStore.getState>['chatMessages']
    dateSelections: ReturnType<typeof useMatchStore.getState>['datePicks']
    timeSelections: ReturnType<typeof useMatchStore.getState>['timePicks']
    excludeMenuPicks: ReturnType<
        typeof useMatchStore.getState
    >['excludeMenuPicks']
    menuPicks: ReturnType<typeof useMatchStore.getState>['menuPicks']
    restaurantPicks: ReturnType<
        typeof useMatchStore.getState
    >['restaurantPicks']
}

const SocketContext = createContext<RoomContextValue | null>(null)

export const useSocket = () => {
    const ctx = useContext(SocketContext)
    if (!ctx) throw new Error('useSocket must be used inside <SocketProvider>')
    return ctx
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<RoomSocket | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const accessToken = useAuthStore(state => state.accessToken)
    const navigate = useNavigate()
    const { roomId } = useParams<{ roomId: string }>()
    const { matchType = 'recruit' } = useParams<{ matchType: RoomType }>()
    const { mutate: refreshToken, isPending, isError } = useRefreshToken()
    const commands = useRoomCommands(socket)

    useRoomEvents(socket)

    const matchState = useMatchStore()
    const stageRef = useRef(matchState.stage)
    stageRef.current = matchState.stage

    useEffect(() => {
        fetch(`${import.meta.env.VITE_CDN_URL}/categories.json`)
            .then(res => res.json())
            .then((data: Category[]) => {
                setCategories(data)
            })
    }, [])

    useEffect(() => {
        if (!accessToken) {
            if (!isPending && !isError) {
                refreshToken()
            }
            return
        }

        const nextSocket: RoomSocket = io(
            `${import.meta.env.VITE_WEBSOCKET_URL}/${matchType}`,
            {
                query: { roomId: roomId || '' },
                auth: { token: accessToken }
            }
        )

        setSocket(nextSocket)

        return () => {
            nextSocket.removeAllListeners()
            nextSocket.close()
            setSocket(null)
            useMatchStore.getState().resetRoomState()
        }
    }, [accessToken, roomId, matchType, refreshToken, isPending, isError])

    useEffect(() => {
        if (!roomId && matchState.roomId) {
            navigate(`/${matchType}/${stageRef.current}/${matchState.roomId}`, {
                replace: true
            })
        }
    }, [matchState.roomId, matchType, navigate, roomId])

    useEffect(() => {
        if (!roomId || !matchState.phaseData) {
            return
        }

        navigate(`/${matchType}/${matchState.phaseData.phase}/${roomId}`, {
            replace: true
        })
    }, [matchState.phaseData, matchType, navigate, roomId])

    const finalStateMessage = useMemo<FinalStateMessage>(
        () => ({
            location: matchState.finalState?.location?.address,
            'exclude-menu': matchState.finalState?.excludeMenu?.map(
                menu => menu.label
            ),
            menu: matchState.finalState?.menu?.label,
            restaurant: matchState.finalState?.restaurant?.placeName
        }),
        [matchState.finalState]
    )

    const waitingData =
        matchState.phaseData?.phase === 'waiting' ||
        matchState.phaseData?.phase === 'location' ||
        matchState.phaseData?.phase === 'finish'
            ? matchState.phaseData.data
            : null

    const value = useMemo<RoomContextValue>(
        () => ({
            socket,
            isConnected: Boolean(socket),
            commands,
            roomId,
            matchType,
            categories,
            participants: matchState.participants,
            stage: matchState.stage,
            phaseData: matchState.phaseData,
            finalState: matchState.finalState,
            finalStateMessage,
            locationInitial: waitingData?.locationInitial,
            meetingAtInitial: waitingData?.meetingAt,
            locationCandidates: matchState.locationCandidates,
            readyCount: matchState.readyCount,
            participantCount: matchState.participantCount,
            isSelfReady: matchState.isSelfReady,
            setIsSelfReady: matchState.setIsSelfReady,
            chatMessages: matchState.chatMessages,
            dateSelections: matchState.datePicks,
            timeSelections: matchState.timePicks,
            excludeMenuPicks: matchState.excludeMenuPicks,
            menuPicks: matchState.menuPicks,
            restaurantPicks: matchState.restaurantPicks
        }),
        [
            socket,
            commands,
            roomId,
            matchType,
            categories,
            matchState,
            finalStateMessage,
            waitingData
        ]
    )

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    )
}
