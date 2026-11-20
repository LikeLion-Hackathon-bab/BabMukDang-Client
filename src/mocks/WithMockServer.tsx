import { useEffect, useState } from 'react'

async function initMsw() {
    if (typeof window !== 'undefined') {
        const { worker } = await import('./browser')
        await worker.start()
    } else {
        // const { server } = await import("./server");
        // server.listen();
        const { worker } = await import('./browser')
        await worker.start()
    }
}

export default function WithMockServer() {
    const [ready, setReady] = useState(false)

    useEffect(() => {
        const shouldMock = import.meta.env.VITE_MOCK_SERVER_ENABLE === true

        if (!shouldMock) return

        const init = async () => {
            await initMsw()
            setReady(true)
        }

        if (!ready) {
            init()
        }
    }, [ready])

    if (!ready && import.meta.env.VITE_MOCK_SERVER_ENABLE === true) {
        return (
            <p className="text-sm text-gray-500">
                🧪 Mock server initializing...
            </p>
        )
    }

    if (ready && import.meta.env.VITE_MOCK_SERVER_ENABLE === true) {
        return (
            <p className="text-sm text-gray-500">🎉 Mock server initialized</p>
        )
    }

    return null
}
