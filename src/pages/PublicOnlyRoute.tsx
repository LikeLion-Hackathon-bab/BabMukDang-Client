import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store'

export function PublicOnlyRoute() {
    const accessToken = useAuthStore(state => state.accessToken)

    console.log('PublicOnlyRoute', accessToken)
    if (accessToken) {
        return (
            <Navigate
                to="/home"
                replace
            />
        )
    }

    return <Outlet />
}
