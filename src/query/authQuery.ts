import { refresh } from '@/apis'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

export const useRefreshToken = (
    onSuccess: () => void,
    onError: (error: Error) => void,
    onSettled: () => void
) => {
    const navigate = useNavigate()
    return useMutation({
        mutationFn: refresh,
        onSuccess,
        onError,
        onSettled
    })
}
