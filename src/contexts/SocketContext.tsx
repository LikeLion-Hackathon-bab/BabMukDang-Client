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
    RoomProgress,
    RoomTaskKey,
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
    progress: RoomProgress | null
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
    menuCandidates: ReturnType<typeof useMatchStore.getState>['menuCandidates']
    restaurantPicks: ReturnType<
        typeof useMatchStore.getState
    >['restaurantPicks']
    restaurantCandidates: ReturnType<
        typeof useMatchStore.getState
    >['restaurantCandidates']
}

const taskKeyByStage: Partial<Record<RoomStage, RoomTaskKey>> = {
    date: 'schedule-date',
    time: 'schedule-time',
    location: 'location-candidate',
    'location-vote': 'location-vote',
    'exclude-menu': 'exclude-menu',
    menu: 'menu-pick',
    restaurant: 'restaurant-pick'
}

const TASK_PRIORITY: RoomTaskKey[] = [
    'schedule-date',
    'schedule-time',
    'location-candidate',
    'location-vote',
    'exclude-menu',
    'prefer-menu',
    'menu-pick',
    'restaurant-pick'
]

export const getReadyTaskKeyForStage = (
    stage: RoomStage,
    progress?: RoomProgress | null
): RoomTaskKey => {
    const progressTask = TASK_PRIORITY.find(taskKey =>
        progress?.tasks.some(
            task =>
                task.key === taskKey &&
                ['open', 'ready', 'stale'].includes(task.status)
        )
    )

    return progressTask ?? taskKeyByStage[stage] ?? 'location-candidate'
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
        if (!roomId || !matchState.phaseData || matchState.progress) {
            return
        }

        navigate(`/${matchType}/${matchState.phaseData.phase}/${roomId}`, {
            replace: true
        })
    }, [matchState.phaseData, matchState.progress, matchType, navigate, roomId])

    useEffect(() => {
        if (!roomId || !matchState.progress) {
            return
        }

        const nextRoute =
            matchState.progress.phase === 'finished' ? 'finish' : 'active'

        navigate(`/${matchType}/${nextRoute}/${roomId}`, {
            replace: true
        })
    }, [matchState.progress, matchType, navigate, roomId])

    const finalStateMessage = useMemo<FinalStateMessage>(
        () => ({
            location: matchState.finalState?.location?.address,
            'exclude-menu': matchState.finalState?.excludeMenu?.map(
                menu => menu.label
            ),
            menu: matchState.finalState?.menu?.menu.label,
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
            progress: matchState.progress,
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
            menuCandidates: matchState.menuCandidates,
            restaurantPicks: matchState.restaurantPicks,
            restaurantCandidates: matchState.restaurantCandidates
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
