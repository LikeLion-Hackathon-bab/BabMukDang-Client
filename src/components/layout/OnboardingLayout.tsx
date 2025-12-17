import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'

import { SocketProvider, useSocket } from '@/contexts/SocketContext'
import {
    ChatButton,
    ChatModal,
    ToastMessage,
    OnboardingButton,
    ProgressBar,
    OnboardingHeader,
    Header
} from '@/components'
import { useHeader, useBottomNav } from '@/hooks'

export const OnboardingLayout = () => {
    const [isChatOpen, setIsChatOpen] = useState(false)
    const { hideHeader, resetHeader } = useHeader()
    const { hideBottomNav, resetBottomNav } = useBottomNav()
    const navigate = useNavigate()
    const { matchType } = useParams<{
        matchType: 'announcement' | 'invitation'
    }>()

    const [stage, setStage] = useState('waiting')
    const isFirstStageEffect = useRef(true)
    useEffect(() => {
        hideHeader()
        hideBottomNav()
        isFirstStageEffect.current = true
        // navigate(`/${matchType}/${stage}`, {
        //     replace: true
        // })
        return () => {
            resetHeader()
            resetBottomNav()
        }
    }, [])
    useLayoutEffect(() => {
        // navigate(`/${matchType}/${stage}`, {
        //     replace: true
        // })
        if (isFirstStageEffect.current) {
            isFirstStageEffect.current = false
            return
        }
    }, [stage])
    return (
        <SocketProvider>
            <ContentBlocker />
            <div className="fixed bottom-38 left-0 z-50 flex h-60 w-full flex-row gap-20 rounded-full px-20">
                {/* Next Button */}
                <OnboardingButton />
            </div>
            <div className="fixed right-20 bottom-38 z-50">
                {/* Chat Button */}
                <ChatButton
                    onClick={() => setIsChatOpen(true)}
                    isOpen={isChatOpen}
                />
            </div>
            {/* Chat Modal */}
            <ChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                roomId={undefined}
            />
            <ToastMessage />
            <SocketInner setStage={setStage} />
        </SocketProvider>
    )
}
const ContentBlocker = () => {
    const { isSelfReady, socket } = useSocket()
    const { pathname } = useLocation()
    const isWaiting = pathname.split('/')[2] === 'waiting'
    const isFinish = pathname.split('/')[2] === 'finish'
    const navigate = useNavigate()
    return (
        <div className={isSelfReady ? 'pointer-events-none' : ''}>
            {!(isWaiting || isFinish) && (
                <OnboardingHeader isSkipable={false} />
            )}
            {socket ? (
                <Outlet />
            ) : (
                <div className="flex h-full w-full items-center justify-center">
                    오류가 발생했습니다. 다시 시도해주세요.
                    <button onClick={() => navigate('/')}>홈으로 이동</button>
                </div>
            )}
        </div>
    )
}
const SocketInner = ({ setStage }: { setStage: (stage: string) => void }) => {
    const { socket } = useSocket()
    const { matchType } = useParams<{
        matchType: 'announcement' | 'invitation'
    }>()
    useLayoutEffect(() => {
        socket?.on('stage-changed', data => {
            setStage(data.stage)
        })
        return () => {
            socket?.off('stage-changed')
        }
    }, [matchType, socket])
    return <></>
}
