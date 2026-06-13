import { type ReactNode, useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

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
import { useBottomNavStore, useHeaderStore } from '@/store'

export const OnboardingLayout = () => {
    const [isChatOpen, setIsChatOpen] = useState(false)
    const { hideHeader, resetHeader } = useHeaderStore()
    const { hideBottomNav, resetBottomNav } = useBottomNavStore()

    useEffect(() => {
        hideHeader()
        hideBottomNav()
        return () => {
            resetHeader()
            resetBottomNav()
        }
    }, [])

    return (
        <SocketProvider>
            <ContentBlocker>
                <Outlet />
            </ContentBlocker>
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
        </SocketProvider>
    )
}
const ContentBlocker = ({ children }: { children: ReactNode }) => {
    const { isSelfReady, isConnected } = useSocket()
    const { pathname } = useLocation()
    const isWaiting = pathname.split('/')[2] === 'waiting'
    const isFinish = pathname.split('/')[2] === 'finish'
    const navigate = useNavigate()
    return (
        <div className={isSelfReady ? 'pointer-events-none' : ''}>
            {!(isWaiting || isFinish) && (
                <OnboardingHeader isSkipable={false} />
            )}
            {isConnected ? (
                children
            ) : (
                <div className="flex h-full w-full items-center justify-center">
                    오류가 발생했습니다. 다시 시도해주세요.
                    <button onClick={() => navigate('/')}>홈으로 이동</button>
                </div>
            )}
        </div>
    )
}
