import { useEffect, type ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/apis/queryClient'
import { AppBootstrapProvider, useAppBootstrap } from '@/contexts'
import { NotificationSseProvider } from '@/contexts/NotificationSseProvider'
import { PushProvider } from '@/features/push'
import { StackflowStack, navigateToPath } from '@/navigation'
import { registerAppUrlOpenListener } from '@/features/app-links'

function AuthenticatedRuntime({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAppBootstrap()

    if (!isAuthenticated) return <>{children}</>

    return <NotificationSseProvider>{children}</NotificationSseProvider>
}

function App() {
    useEffect(
        () => registerAppUrlOpenListener(path => navigateToPath(path)),
        []
    )

    return (
        <QueryClientProvider client={queryClient}>
            <AppBootstrapProvider>
                <PushProvider>
                    <AuthenticatedRuntime>
                        <div className="relative h-screen min-h-screen overflow-hidden">
                            <StackflowStack />
                        </div>
                    </AuthenticatedRuntime>
                </PushProvider>
            </AppBootstrapProvider>
        </QueryClientProvider>
    )
}

export default App
