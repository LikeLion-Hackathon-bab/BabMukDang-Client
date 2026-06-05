// SocketContext.tsx
//
// 책임: 소켓 "연결/재연결/토큰 갱신"과 방 lifecycle 이벤트
// (room-assigned, join-room, stage-changed, final-state-response)만 담당한다.
// 도메인 이벤트 구독은 useRoomReadyState / useRoomChat / useRoomSchedule /
// useRoomMenu 훅으로 분리되어 있고 Provider가 합성한다.
import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState
} from 'react'
import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'
import { useNavigate, useParams } from 'react-router-dom'
import type {
    Category,
    ChatMessage,
    DatePicksUpdateResponseDto,
    FinalState,
    MenuPickUpdateResponseDto,
    Participant,
    PhaseDataBroadcastDto,
    RestaurantPickUpdateResponseDto,
    RoomInitialState,
    TimePicksUpdateResponseDto,
    WaitingInitialState
} from '@kimdaegyu/babmukdang-shared'
import { useAuthStore } from '@/store/authStore'
import { useRoomReadyState } from './socket/useRoomReadyState'
import { useRoomChat } from './socket/useRoomChat'
import { useRoomSchedule } from './socket/useRoomSchedule'
import { useRoomMenu } from './socket/useRoomMenu'
import type { AppSocket } from './socket/types'

/**
 * @deprecated Phase 7에서 제거 예정.
 *
 * 기존 match-onboarding 페이지들은 단계별 초기 상태를
 * `initialState.stage` / `initialState.initialState.*`(ad-hoc shape)로 읽는다.
 * Backend는 `stage-changed`(PhaseDataBroadcastDto)로 phase별 data를 보내므로
 * 여기서 `{ stage, initialState }` 호환 envelope로 감싸 노출한다.
 * 페이지들을 Shared phase 타입으로 재배선하기 전까지의 shim이며 그때까지
 * `initialState`는 any로 남는다.
 * (docs/todo/2026-06-06-socket-phase3-pending.md)
 */
interface LegacyPhaseInitialState {
    stage: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialState: any
}

interface FinalStateMessage {
    location?: string
    'exclude-menu'?: string[]
    menu?: string
    restaurant?: string
}

interface SocketContextValue {
    // 노출 socket은 아직 stale 이벤트명을 쓰는 페이지 호환을 위해 느슨한
    // 기본 Socket 타입으로 둔다(Provider/훅 내부는 AppSocket으로 타입 고정).
    socket: Socket | null
    roomId: string | undefined
    matchType: 'announcement' | 'invitation'
    categories: Category[]
    participants: Participant[]
    stage: string
    initialState: LegacyPhaseInitialState | null
    finalState: FinalState | null
    finalStateMessage: FinalStateMessage
    locationInitial: string | undefined
    meetingAtInitial: string | undefined
    // ready-state 도메인 훅
    readyCount: number
    participantCount: number
    isSelfReady: boolean
    setIsSelfReady: (isSelfReady: boolean) => void
    // chat 도메인 훅
    chatMessages: ChatMessage[]
    // schedule 도메인 훅
    dateSelections: DatePicksUpdateResponseDto
    timeSelections: TimePicksUpdateResponseDto
    // menu 도메인 훅
    menuPicks: MenuPickUpdateResponseDto
    restaurantPicks: RestaurantPickUpdateResponseDto
}

const SocketContext = createContext<SocketContextValue | null>(null)

export const useSocket = () => {
    const ctx = useContext(SocketContext)
    if (!ctx) throw new Error('useSocket must be used inside <SocketProvider>')
    return ctx
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<AppSocket | null>(null)
    const accessToken = useAuthStore(state => state.accessToken)
    const navigate = useNavigate()
    const { roomId } = useParams<{ roomId: string }>()
    const { matchType } = useParams<{
        matchType: 'announcement' | 'invitation'
    }>()

    // Provider가 직접 소유하는 lifecycle 상태 (≤10개)
    const [categories, setCategories] = useState<Category[]>([])
    const [participants, setParticipants] = useState<Participant[]>([])
    const [stage, setStage] = useState('waiting')
    const [initialState, setInitialState] =
        useState<LegacyPhaseInitialState | null>(null)
    const [finalState, setFinalState] = useState<FinalState | null>(null)
    const [finalStateMessage, setFinalStateMessage] =
        useState<FinalStateMessage>({})
    const [locationInitial, setLocationInitial] = useState<string | undefined>(
        undefined
    )
    const [meetingAtInitial, setMeetingAtInitial] = useState<
        string | undefined
    >(undefined)

    // room-assigned 네비게이션에서 최신 stage가 필요하므로 ref로 추적
    const stageRef = useRef(stage)
    stageRef.current = stage

    // 도메인 이벤트 구독은 훅으로 분리
    const { readyCount, participantCount, isSelfReady, setIsSelfReady } =
        useRoomReadyState(socket)
    const { chatMessages } = useRoomChat(socket)
    const { dateSelections, timeSelections } = useRoomSchedule(socket)
    const { menuPicks, restaurantPicks } = useRoomMenu(socket)

    // 음식 이미지 manifest (Shared Category)
    useEffect(() => {
        fetch(`${import.meta.env.VITE_CDN_URL}/categories.json`)
            .then(res => res.json())
            .then((data: Category[]) => {
                setCategories(data)
            })
    }, [])

    // 연결/재연결/토큰 갱신
    useEffect(() => {
        if (!accessToken) {
            // 토큰이 없으면 authStore.refresh()로 일원화된 갱신 시도.
            // refreshToken까지 없으면 홈으로 보낸다.
            const { refreshToken, refresh } = useAuthStore.getState()
            if (!refreshToken) {
                navigate('/')
                return
            }
            void refresh()
            return
        }

        const s: AppSocket = io(
            `${import.meta.env.VITE_WEBSOCKET_URL}/${matchType}`,
            {
                query: { roomId: roomId || '' },
                auth: { token: accessToken }
            }
        )
        setSocket(s)

        return () => {
            s.removeAllListeners()
            s.close()
        }
    }, [accessToken, roomId, matchType, navigate])

    // 방 lifecycle 이벤트 (도메인 이벤트는 훅이 담당)
    useEffect(() => {
        if (!socket) return

        const handleRoomAssigned = (data: { roomId: string }) => {
            if (!roomId && data?.roomId) {
                navigate(`/${matchType}/${stageRef.current}/${data.roomId}`, {
                    replace: true
                })
            }
        }
        const handleJoinRoom = (state: RoomInitialState) => {
            setParticipants(state.participants)
        }
        const handleStageChanged = (data: PhaseDataBroadcastDto) => {
            setStage(data.phase)
            setInitialState({ stage: data.phase, initialState: data.data })
            if (data.phase === 'waiting') {
                const waiting = data.data as WaitingInitialState
                setLocationInitial(waiting.locationInitial)
                setMeetingAtInitial(waiting.meetingAt)
            }
            navigate(`/${matchType}/${data.phase}/${roomId}`, { replace: true })
        }
        const handleFinalState = (final: FinalState) => {
            setFinalState(final)
            setFinalStateMessage({
                location: final?.location?.address,
                'exclude-menu': final?.excludeMenu?.map(menu => menu.label),
                menu: final?.menu?.label,
                restaurant: final?.restaurant?.place_name
            })
        }

        socket.on('room-assigned', handleRoomAssigned)
        socket.on('join-room', handleJoinRoom)
        socket.on('stage-changed', handleStageChanged)
        socket.on('final-state-response', handleFinalState)

        return () => {
            socket.off('room-assigned', handleRoomAssigned)
            socket.off('join-room', handleJoinRoom)
            socket.off('stage-changed', handleStageChanged)
            socket.off('final-state-response', handleFinalState)
        }
    }, [socket, matchType, roomId, navigate])

    return (
        <SocketContext.Provider
            value={{
                socket: socket as unknown as Socket | null,
                roomId,
                matchType: matchType as 'announcement' | 'invitation',
                categories,
                participants,
                stage,
                initialState,
                finalState,
                finalStateMessage,
                locationInitial,
                meetingAtInitial,
                readyCount,
                participantCount,
                isSelfReady,
                setIsSelfReady,
                chatMessages,
                dateSelections,
                timeSelections,
                menuPicks,
                restaurantPicks
            }}>
            {children}
        </SocketContext.Provider>
    )
}
