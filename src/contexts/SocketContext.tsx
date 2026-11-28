// SocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'
import { useAuthStore } from '@/store/authStore'
import { useNavigate, useParams } from 'react-router-dom'
import { refresh } from '@/apis'

interface ChatMessageDto {
    messageId: string
    roomId: string
    user: {
        userId: string | null
        username: string
    }
    text?: string
    imageUrl?: string
    createdAt: string
}
type Category = {
    id: string
    name: string
    aspectRatio: number
    placeholder: { blurhash: string; thumbhashDataURL: string }
    images: {
        src: string
        avifSrcset: string
    }
    priority?: boolean
}
const SocketContext = createContext<{
    socket: Socket | null
    roomId: string | undefined
    chatMessages: ChatMessageDto[]
    initialState: StageData | null
    setInitialState: (initialState: StageData | null) => void
    categories: Category[]
    participants: Participant[]
    setParticipants: (participants: Participant[]) => void
    readyCount: number
    participantCount: number
    stage: string
    matchType: 'announcement' | 'invitation'
    setStage: (stage: string) => void
    setReadyCount: (readyCount: number) => void
    setParticipantCount: (participantCount: number) => void
    isSelfReady: boolean
    setIsSelfReady: (isSelfReady: boolean) => void
    finalState: FinalState | null
    setFinalState: (finalState: FinalState | null) => void
    finalStateMessage: {
        location?: string
        'exclude-menu'?: string[]
        menu?: string
        restaurant?: string
    }
    dateSelections: { userId: string; dates: string[] }[]
    timeSelections: { userId: string; times: string[] }[]
    locationInitial: string | undefined
    meetingAtInitial: string | undefined
} | null>(null)
export const useSocket = () => {
    const ctx = useContext(SocketContext)
    if (!ctx) throw new Error('useSocket must be used inside <SocketProvider>')
    return ctx
}
interface Participant {
    userId: string
    username: string
    userProfileImageURL: string
    ready: boolean
}
type DateSelection = { userId: string; dates: string[] }
type TimeSelection = { userId: string; times: string[] }
type Candidate = {
    id: string
    placeName: string
    lat: number
    lng: number
    address?: string
    isSelected: boolean
}
type Place = {
    id: string
    place_name: string
    category_name: string
    category_group_name: string
    distance: string
    road_address_name: string
    address_name: string
    phone: string
    selectUsers: string[]
}
type StageData =
    | { stage: 'date'; initialState: DateSelection[] }
    | { stage: 'time'; initialState: TimeSelection[] }
    | {
          stage: 'location' | 'location-vote'
          initialState: { candidates: Candidate[] }
      }
    | {
          stage: 'exclude-menu'
          initialState: {
              userId: string
              menuList: { code: string; label: string }[]
          }[]
      }
    | {
          stage: 'menu'
          initialState: {
              availableMenus: { code: number; label: string }[]
              menuPerUserSelections: {
                  menuId: string
                  selectedUsers: string[]
              }[]
          }
      }
    | {
          stage: 'restaurant'
          initialState: {
              initialRestaurants: Place[]
              restaurantUserList: { userId: string; restaurantId: string }[]
          }
      }
type FinalState = {
    date?: string
    time?: string
    location?: { address?: string; placeName?: string }
    menu?: { label: string }
    excludeMenu?: { label: string }[]
    restaurant?: { place_name: string; name?: string }
}
export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [connectionFailed, setConnectionFailed] = useState(false)
    const [socket, setSocket] = useState<Socket | null>(null)
    const { accessToken, refreshToken, setTokens } = useAuthStore()
    const navigate = useNavigate()
    const { roomId } = useParams<{ roomId: string }>()
    const { matchType } = useParams<{
        matchType: 'announcement' | 'invitation'
    }>()
    const [chatMessages, setChatMessages] = useState<ChatMessageDto[]>([])
    const [initialState, setInitialState] = useState<StageData | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [participants, setParticipants] = useState<Participant[]>([])
    const [readyCount, setReadyCount] = useState(0)
    const [participantCount, setParticipantCount] = useState(0)
    const [stage, setStage] = useState('waiting')
    const [isSelfReady, setIsSelfReady] = useState(false)
    const [finalState, setFinalState] = useState<FinalState | null>(null)
    const [finalStateMessage, setFinalStateMessage] = useState<{
        location?: string
        menu?: string
        restaurant?: string
        'exclude-menu'?: string[]
    }>({
        'exclude-menu': undefined,
        location: undefined,
        menu: undefined,
        restaurant: undefined
    })
    const [locationInitial, setLocationInitial] = useState<string | undefined>(
        undefined
    )
    const [meetingAtInitial, setMeetingAtInitial] = useState<
        string | undefined
    >(undefined)
    const [dateSelections, setDateSelections] = useState<
        { userId: string; dates: string[] }[]
    >([])
    const [timeSelections, setTimeSelections] = useState<
        { userId: string; times: string[] }[]
    >([])
    useEffect(() => {
        fetch(`${import.meta.env.VITE_CDN_URL}/categories.json`)
            .then(res => res.json())
            .then(data => {
                setCategories(data)
            })
    }, [])

    // token이 설정된 후에 socket 생성
    useEffect(() => {
        const refreshTokenFunction = async () => {
            if (!refreshToken) {
                navigate('/')
                return
            }
            const res = await refresh()
            setTokens({
                accessToken: res.data.accessToken,
                refreshToken: res.data.refreshToken
            })
        }
        if (!accessToken) {
            refreshTokenFunction()
            return
        }
        const s = io(`${import.meta.env.VITE_WEBSOCKET_URL}/${matchType}`, {
            query: { roomId: roomId || '' },
            auth: {
                token: accessToken
            }
        })

        setSocket(s)
        console.log('socket init', s)

        return () => {
            console.log('socket destroy')
            s.removeAllListeners()
            s.close()
        }
    }, [accessToken, roomId, matchType]) // token과 roomId가 변경될 때마다 재생성
    useEffect(() => {
        if (!socket) return
        socket.on('connect_error', () => setConnectionFailed(true))
        socket.on('connect', () => setConnectionFailed(false))
        socket.on('chat-messages', setChatMessages)
        socket?.on(
            'ready-state-changed',
            (data: { readyCount: number; participantCount: number }) => {
                setReadyCount(data.readyCount)
                setParticipantCount(data.participantCount)
            }
        )
        socket.on('meeting-save-failed', () => {
            setIsSelfReady(false)
            setReadyCount(0)
            window.alert(
                '밥약을 저장하지 못했어요. 식당을 확인하고 다시 준비해 주세요.'
            )
        })
        socket?.on('stage-changed', data => {
            setStage(data.stage)
            navigate(`/${matchType}/${data.stage}/${roomId}`, {
                replace: true
            })
            setIsSelfReady(false)
        })

        socket?.on('initial-state-response', data => {
            if (data?.stage) setInitialState(data)
            if (Array.isArray(data?.participants)) {
                console.log('initial-state-participants', data)

                setParticipants(data.participants)
                setLocationInitial(data.locationInitial)
                setMeetingAtInitial(data.meetingAt)
            }
            if (data?.stage === 'date' && Array.isArray(data?.initialState)) {
                setDateSelections(data.initialState)
            }
            if (data?.stage === 'time' && Array.isArray(data?.initialState)) {
                setTimeSelections(data.initialState)
            }
        })
        // 방이 자동 할당되었을 때, URL을 갱신하여 roomId를 반영
        socket?.on('room-assigned', (data: { roomId: string }) => {
            if (!roomId && data?.roomId) {
                navigate(`/${matchType}/${stage}/${data.roomId}`, {
                    replace: true
                })
            }
        })
        socket?.on('join-room', data => {
            setParticipants(data)
        })
        socket?.on('date-updated', (data: DateSelection[]) => {
            if (Array.isArray(data)) setDateSelections(data)
        })
        socket?.on('time-updated', (data: TimeSelection[]) => {
            if (Array.isArray(data)) setTimeSelections(data)
        })
        socket?.on(
            'final-state-response',
            (event: FinalState | { finalState: FinalState } | null) => {
                const data =
                    event && 'finalState' in event ? event.finalState : event
                setFinalState(data)
                const excludeMenu = data?.excludeMenu?.map(menu => menu.label)
                const location = data?.location?.address
                const menu = data?.menu?.label
                const restaurant = data?.restaurant?.place_name
                setFinalStateMessage({
                    'exclude-menu': excludeMenu,
                    location,
                    menu,
                    restaurant
                })
            }
        )
        return () => {
            socket?.removeAllListeners()
        }
    }, [socket, matchType])

    // useEffect(() => {
    //     if (finalState) {
    //         const excludeMenu = finalState.finalState?.excludeMenu?.map(
    //             menu => menu.label
    //         )
    //         const location = finalState.finalState?.location?.address
    //         const menu = finalState.finalState?.menu?.label
    //         const restaurant = finalState.finalState?.restaurant?.place_name
    //         setFinalStateMessage({
    //             excludeMenu,
    //             location,
    //             menu,
    //             restaurant
    //         })
    //     }
    // }, [finalState])

    return (
        <SocketContext.Provider
            value={{
                socket,
                roomId,
                chatMessages,
                initialState,
                setInitialState,
                categories,
                participants,
                setParticipants,
                readyCount,
                participantCount,
                stage,
                matchType: matchType as 'announcement' | 'invitation',
                setStage,
                setReadyCount,
                setParticipantCount,
                isSelfReady,
                setIsSelfReady,
                finalState,
                setFinalState,
                finalStateMessage,
                dateSelections,
                timeSelections,
                locationInitial,
                meetingAtInitial
            }}>
            {matchType === 'invitation' &&
                finalState?.time &&
                stage !== 'finish' && (
                    <p
                        role="status"
                        className="text-center">
                        한국 시간 {finalState.time.split('–')[0]}
                    </p>
                )}
            {connectionFailed && (
                <p role="alert">
                    대기실에 연결하지 못했어요.{' '}
                    <button onClick={() => socket?.connect()}>
                        다시 연결하기
                    </button>
                </p>
            )}
            {children}
        </SocketContext.Provider>
    )
}
