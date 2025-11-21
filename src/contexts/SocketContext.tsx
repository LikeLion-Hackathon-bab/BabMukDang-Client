// ws/SocketContext.tsx
import React, { createContext, useContext, useMemo, useEffect } from 'react'
import { SocketService } from './socket-service'
import { useAuthStore } from '@/store/authStore'
import { useParams, useNavigate, useLocation } from 'react-router-dom'

type Ctx = { service: SocketService | null }
const SocketContext = createContext<Ctx>({ service: null })

export const useSocket = () => {
    const ctx = useContext(SocketContext)
    if (!ctx)
        throw new Error('useSocketService must be used within SocketProvider')
    if (!ctx.service) {
        throw new Error('service is not initialized')
    }
    return ctx.service
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { accessToken } = useAuthStore()
    const { roomId, matchType } = useParams<{
        roomId: string
        matchType: 'announcement' | 'invitation'
    }>()
    const navigate = useNavigate()
    const location = useLocation()

    // 토큰/room/matchType이 바뀌면 새로운 서비스 인스턴스를 생성
    const connectKey = `${matchType ?? ''}:${roomId ?? ''}:${accessToken ?? ''}`
    const service = useMemo(() => {
        if (!accessToken || !matchType) {
            throw new Error('accessToken or matchType is required')
        }
        return new SocketService({
            baseUrl: import.meta.env.VITE_WEBSOCKET_URL,
            matchType,
            roomId,
            token: accessToken,
            debug: import.meta.env.DEV || true
        })
    }, [connectKey])

    useEffect(() => {
        if (!service) return
        service.connect()
        // 예: room-assigned 내비게이션 (기존 버그: if (!roomId && roomId) → 항상 false)
        const off = service.on('room-assigned', ({ roomId: newId }) => {
            if (!roomId && newId) {
                navigate(
                    `/${matchType}/${/* 현재 단계는 서버 broadcast에서 */ 'waiting'}/${newId}`,
                    { replace: true }
                )
            }
        })
        return () => {
            off()
            service.disconnect()
        }
    }, [service, roomId, matchType])

    if (!service) {
        return <div>Loading...</div>
    }
    return (
        <SocketContext.Provider value={{ service }}>
            {children}
        </SocketContext.Provider>
    )
}
