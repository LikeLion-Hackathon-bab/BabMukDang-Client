import { useMutation, useQuery } from '@tanstack/react-query'
import {
    getAnnouncements,
    postAnnouncement,
    closeAnnouncement,
    joinAnnouncement,
    subscribeAnnouncement
} from '@/apis'

export const useGetAnnouncements = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['announcements'],
        queryFn: getAnnouncements
    })
    return { data: data?.data, isLoading, error, refetch }
}

export const usePostAnnouncement = (
    onSuccess: () => void,
    onError: (error: Error) => void
) => {
    const { mutate, isPending, error } = useMutation({
        mutationFn: postAnnouncement,
        onSuccess,
        onError
    })
    return { mutate, isPending, error }
}

export const useCloseAnnouncement = (
    onSuccess: () => void,
    onError: (error: Error) => void
) => {
    const { mutate, isPending, error } = useMutation({
        mutationFn: closeAnnouncement,
        onSuccess,
        onError
    })
    return { mutate, isPending, error }
}

export const useJoinAnnouncement = (
    onSuccess: () => void,
    onError: (error: Error) => void
) => {
    const { mutate, isPending, isSuccess, error } = useMutation({
        mutationFn: joinAnnouncement,
        onSuccess,
        onError
    })
    return { mutate, isPending, isSuccess, error }
}

export const useSubscribeAnnouncement = ({
    onSuccess,
    onError
}: {
    onSuccess: () => void
    onError: (error: Error) => void
}) => {
    const { mutate, isPending, error } = useMutation({
        mutationFn: subscribeAnnouncement,
        onSuccess,
        onError
    })
    return { mutate, isPending, error }
}
