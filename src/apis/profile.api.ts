/**
 * @fileoverview Profile(프로필) API 모듈
 *
 * 사용자 프로필 조회 및 수정 관련 API 함수와 TanStack Query hooks를 제공합니다.
 *
 * @example
 * // 내 프로필 조회
 * const { data: profile } = useGetMyProfile()
 *
 * // 프로필 수정
 * const { mutate: updateProfile } = useUpdateMyProfile({
 *   onSuccess: () => toast.success('수정 완료')
 * })
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { client } from './client'
import { endpoints } from './endpoints'
import { queryKeys } from './keys'
import type {
    BaseResponse,
    MutationOptions,
    ProfileResponse,
    ProfileDetailResponse,
    UpdateProfileRequest
} from './types'

// ============================================================================
// API 함수
// ============================================================================

/**
 * Profile API 함수 모음
 */
export const profileApi = {
    /**
     * 내 프로필 조회
     * @returns 프로필 정보
     */
    getMyProfile: async (): Promise<BaseResponse<ProfileResponse>> => {
        const res = await client.get(endpoints.members.myProfile)
        return res.data
    },

    /**
     * 내 프로필 상세 조회
     * @returns 프로필 상세 정보 (선호도 포함)
     */
    getMyProfileDetail: async (): Promise<
        BaseResponse<ProfileDetailResponse>
    > => {
        const res = await client.get(endpoints.members.myProfileDetail)
        return res.data
    },

    /**
     * 특정 멤버 프로필 조회
     * @param memberId - 멤버 ID
     * @returns 프로필 정보
     */
    getMemberProfile: async (
        memberId: number
    ): Promise<BaseResponse<ProfileResponse>> => {
        const res = await client.get(endpoints.members.profile(memberId))
        return res.data
    },

    /**
     * 특정 멤버 프로필 상세 조회
     * @param memberId - 멤버 ID
     * @returns 프로필 상세 정보 (선호도 포함)
     */
    getMemberProfileDetail: async (
        memberId: number
    ): Promise<BaseResponse<ProfileDetailResponse>> => {
        const res = await client.get(endpoints.members.profileDetail(memberId))
        return res.data
    },

    /**
     * 내 프로필 수정
     * @param data - 수정할 프로필 데이터
     * @returns 수정된 프로필 정보
     */
    updateMyProfile: async (
        data: UpdateProfileRequest
    ): Promise<BaseResponse<ProfileResponse>> => {
        const res = await client.patch(endpoints.members.updateProfile, data)
        return res.data
    }
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 내 프로필 조회 Hook
 * @returns Query 결과 (data, isLoading, error)
 *
 * @example
 * const { data: profile } = useGetMyProfile()
 * console.log(profile?.data.userName)
 */
export const useGetMyProfile = () => {
    return useQuery({
        queryKey: queryKeys.profile.my,
        queryFn: profileApi.getMyProfile
    })
}

/**
 * 내 프로필 상세 조회 Hook (선호도 포함)
 * @returns Query 결과
 */
export const useGetMyProfileDetail = () => {
    return useQuery({
        queryKey: queryKeys.profile.myDetail,
        queryFn: profileApi.getMyProfileDetail
    })
}

/**
 * 특정 멤버 프로필 조회 Hook
 * @param memberId - 멤버 ID
 */
export const useGetMemberProfile = (memberId: number) => {
    return useQuery({
        queryKey: queryKeys.profile.member(memberId),
        queryFn: () => profileApi.getMemberProfile(memberId)
    })
}

/**
 * 특정 멤버 프로필 상세 조회 Hook
 * @param memberId - 멤버 ID
 */
export const useGetMemberProfileDetail = (memberId: number) => {
    return useQuery({
        queryKey: queryKeys.profile.memberDetail(memberId),
        queryFn: () => profileApi.getMemberProfileDetail(memberId)
    })
}

/**
 * 여러 멤버의 프로필 조회 Hook
 * @param memberIds - 멤버 ID 목록
 * @returns 멤버 ID와 이름이 포함된 객체 배열
 *
 * @example
 * const { data: profiles } = useGetProfiles([1, 2, 3])
 * profiles?.forEach(p => console.log(p.username))
 */
export const useGetProfiles = (memberIds: number[]) => {
    return useQuery({
        queryKey: queryKeys.profile.members(memberIds),
        queryFn: async () => {
            const profiles = await Promise.all(
                memberIds.map(id => profileApi.getMemberProfile(id))
            )
            return profiles.map(profile => ({
                memberId: profile.data.memberId,
                username: profile.data.userName
            }))
        },
        enabled: memberIds.length > 0
    })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 내 프로필 수정 Hook
 * @param options - 성공/에러 콜백
 *
 * @example
 * const { mutate: updateProfile } = useUpdateMyProfile({
 *   onSuccess: () => toast.success('프로필이 수정되었습니다.')
 * })
 *
 * updateProfile({
 *   userName: '새이름',
 *   profileImageUrl: 'https://...',
 *   bio: '자기소개'
 * })
 */
export const useUpdateMyProfile = (options: MutationOptions = {}) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: UpdateProfileRequest) =>
            profileApi.updateMyProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.profile.all })
            options.onSuccess?.()
        },
        onError: options.onError
    })
}
