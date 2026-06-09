import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRefreshToken } from '@/apis'
import { useAuthStore } from '@/store'

export function AuthGate() {
    const navigate = useNavigate()

    const { accessToken } = useAuthStore()

    const { mutate, isPending, isError } = useRefreshToken({
        onSuccess: () => {
            navigate('/home', { replace: true })
        },
        onError: () => {
            navigate('/login', { replace: true })
        }
    })

    useEffect(() => {
        console.log('AuthGate', accessToken)
        if (accessToken) {
            navigate('/home', { replace: true })
        } else if (!isPending && !isError) {
            mutate()
        }
    }, [accessToken, mutate, navigate, isPending, isError])

    if (isPending) {
        return <div>로그인 상태를 확인하는 중입니다.</div>
    }

    return null
}
