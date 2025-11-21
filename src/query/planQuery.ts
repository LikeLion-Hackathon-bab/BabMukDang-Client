import { useQuery } from '@tanstack/react-query'
import { getCompletedPlans, getUncompletedPlans } from '@/apis/plans'

export const useGetCompletedPlans = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['completedPlans'],
        queryFn: getCompletedPlans
    })
    return { data: data, isLoading, error, refetch }
}

export const useGetUncompletedPlans = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['uncompletedPlans'],
        queryFn: getUncompletedPlans
    })
    return { data: data, isLoading, error, refetch }
}
