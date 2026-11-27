import { useQuery } from '@tanstack/react-query'
import { getMeetings } from '@/apis/meeting'

import { useAuthStore } from '@/store'

export const useGetMeetings = () => {
    const userId = useAuthStore(state => state.userId)
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['meetings', userId],
        enabled: Boolean(userId),
        queryFn: getMeetings
    })
    return { data: data?.data, isLoading, error, refetch }
}
