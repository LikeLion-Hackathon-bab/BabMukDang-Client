import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppBootstrapProvider, useAppBootstrap } from '@/contexts'
import { NotificationSseProvider } from '@/contexts/NotificationSseProvider'
import { PushProvider } from '@/features/push'
import { StackflowStack } from '@/navigation'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false
        }
    }
})

function AuthenticatedRuntime({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAppBootstrap()

    if (!isAuthenticated) return <>{children}</>

    return <NotificationSseProvider>{children}</NotificationSseProvider>
}

function App() {
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
