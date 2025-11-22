import {
    getMemberProfile,
    getMemberProfileDetail,
    getMyProfile,
    getMyProfileDetail,
    updateMyProfile,
    UpdateProfileRequest
} from '@/apis/profile'
import { useMutation, useQuery } from '@tanstack/react-query'

export const useGetMyProfile = () => {
    return useQuery({
        queryKey: ['myProfile'],
        queryFn: getMyProfile
    })
}

export const useGetMyProfileDetail = () => {
    return useQuery({
        queryKey: ['myProfileDetail'],
        queryFn: () => getMyProfileDetail()
    })
}

export const useGetMemberProfile = (memberId: number) => {
    return useQuery({
        queryKey: ['memberProfile', memberId],
        queryFn: () => getMemberProfile(memberId)
    })
}

export const useGetMemberProfileDetail = (memberId: number) => {
    return useQuery({
        queryKey: ['memberProfileDetail', memberId],
        queryFn: () => getMemberProfileDetail(memberId)
    })
}

export const useUpdateMyProfile = (
    onSuccess: () => void,
    onError: (e: Error) => void
) => {
    return useMutation({
        mutationFn: (data: UpdateProfileRequest) => updateMyProfile(data),
        onSuccess,
        onError
    })
}

export const useGetProfiles = (memberIds: number[]) => {
    return useQuery({
        queryKey: ['memberProfiles', memberIds],
        queryFn: async () => {
            const profiles = await Promise.all(
                memberIds.map(id => getMemberProfile(id))
            )
            return profiles.map(profile => ({
                memberId: profile.data.memberId,
                username: profile.data.userName
            }))
        },
        enabled: memberIds.length > 0
    })
}
