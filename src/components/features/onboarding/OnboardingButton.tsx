import { useEffect, useState } from 'react'
import { useSocket } from '@/contexts/SocketContext'
import { COLORS } from '@/constants/colors'
import { useNavigate } from 'react-router-dom'
import {
    AnnouncementStage,
    InvitationStage,
    ReadyStateRequestDtoServer
} from '@kimdaegyu/babmukdang-shared'
import { useMatchStore } from '@/store/matchStore'

export function OnboardingButton() {
    const service = useSocket()
    const [readyCount, setReadyCount] = useState(0)
    const [participantCount, setParticipantCount] = useState(0)
    const [stage, setStage] = useState<AnnouncementStage | InvitationStage>(
        {} as AnnouncementStage | InvitationStage
    )
    const { isSelfReady, setIsSelfReady } = useMatchStore()
    const [countDown, setCountDown] = useState(3)
    const navigate = useNavigate()
    useEffect(() => {
        service?.ready$.subscribe(data => {
            setReadyCount(data.readyCount)
            setParticipantCount(data.participantCount)
        })
        service?.stage$.subscribe(data => {
            console.log(data)
            setStage(data)
        })
    }, [service])

    useEffect(() => {
        setIsSelfReady(false)
        setCountDown(3)
    }, [stage])

    useEffect(() => {
        if (isSelfReady) {
            setCountDown(3)
        }
    }, [isSelfReady])

    useEffect(() => {
        if (readyCount !== participantCount) {
            return
        }
        if (readyCount === participantCount) {
            const interval = setInterval(() => {
                setCountDown(prev => {
                    if (prev === 0) {
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [readyCount, participantCount])

    const onClickReady = () => {
        const next = !isSelfReady
        // 새로운 상태 값으로 소켓 이벤트 발생
        service?.emit('ready-state', {
            isReady: next
        } as ReadyStateRequestDtoServer)

        if (stage === 'finish') {
            navigate('/')
        }
        setIsSelfReady(!isSelfReady)
    }
    return (
        <button
            onClick={onClickReady}
            className="relative h-full w-full overflow-hidden rounded-full border-0 p-0"
            style={{ backgroundColor: COLORS.gray2 }}>
            <span
                className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
                style={{
                    width:
                        participantCount > 0
                            ? `${(readyCount / participantCount) * 100}%`
                            : '0%',
                    backgroundColor:
                        readyCount === participantCount
                            ? COLORS.primary500
                            : COLORS.primary300, // darker blue for filled part
                    zIndex: 1
                }}
            />
            <span className="relative z-10 flex w-full items-center justify-center">
                {isSelfReady
                    ? `${readyCount}/${participantCount}명 준비 완료 ${readyCount === participantCount ? `(${countDown}초 후 이동)` : ''}`
                    : '선택을 완료할게요'}
            </span>
        </button>
    )
}
