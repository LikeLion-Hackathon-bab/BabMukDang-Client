import { useEffect, useState } from 'react'
import { useSocket } from '../../../contexts/SocketContext'
import { useLocation } from 'react-router-dom'
import { FinalState } from '@kimdaegyu/babmukdang-shared'

type ToastMessageProps = {
    isOpen: boolean
    message: string
    onClose?: () => void
    durationMs?: number
}

export function ToastMessage() {
    const service = useSocket()
    const [isOpen, setIsOpen] = useState(false)
    const [message, setMessage] = useState('')
    const pathname = useLocation()
    const [finalState, setFinalState] = useState<FinalState>({} as FinalState)

    useEffect(() => {
        const currentStage = pathname.pathname.split('/')[2]
        service?.finalState$.subscribe(data => {
            setFinalState(data)
        })
        switch (currentStage) {
            case 'location-vote':
                if (finalState?.location) {
                    setMessage(`${finalState.location}에서 만나요!`)
                } else {
                    setMessage('만날 장소를 정해보아요!')
                }
                break
            case 'exclude-menu':
                if (
                    finalState?.excludeMenu &&
                    finalState?.excludeMenu?.length > 0
                ) {
                    setMessage(`${finalState.excludeMenu?.join(', ')} 제외`)
                } else {
                    setMessage('메뉴 제외 없이 진행해요!')
                }
                break
            case 'menu':
                if (finalState?.menu) {
                    setMessage(`${finalState.menu} 메뉴로 결정`)
                } else {
                    setMessage('메뉴를 고르지 않았어요!')
                }
                break
            case 'restaurant':
                if (finalState?.restaurant) {
                    setMessage(`${finalState.restaurant} 식당에서 만나요!`)
                } else {
                    setMessage('만남 장소 근처 맛집 중 골라보아요.')
                }
                break
            default:
                setMessage('')
                break
        }
        setIsOpen(true)
    }, [service, pathname])
    useEffect(() => {
        if (!isOpen) return

        const durationMs = 3000
        const timer = setTimeout(() => {
            setIsOpen(false)
        }, durationMs)

        return () => clearTimeout(timer)
    }, [isOpen])

    return (
        <div
            className={`fixed bottom-114 left-1/2 z-50 w-full -translate-x-1/2 transform px-20 transition-opacity duration-300 ${
                isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}>
            <div className="text-14 rounded-12 flex items-center justify-center bg-black/80 px-16 py-21 text-center text-white shadow-lg">
                {message}
            </div>
        </div>
    )
}
