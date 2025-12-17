import { client } from './client'
import { BaseResponse } from './dto'

export interface ProfileResponse {
    memberId: number
    userName: string
    profileImageUrl: string
    bio: string
    meetingCount: number
}

export interface ProfileDetailResponse {
    memberId: number
    userName: string
    profileImageUrl: string
    bio: string
    meetingCount: number
    likes: PreferenceItem[]
    dislikes: PreferenceItem[]
    allergies: PreferenceItem[]
}

export interface PreferenceItem {
    code: string
    label: string
}

export interface UpdateProfileRequest {
    userName: string
    profileImageUrl: string
    bio: string
}

export const getProfile = async (): Promise<BaseResponse<ProfileResponse>> => {
    const res = await client.get(
        `${import.meta.env.VITE_BASE_API_URL}/members/me/profile`
    )
    return res.data
}

export const getMyProfileDetail = async (): Promise<
    BaseResponse<ProfileDetailResponse>
> => {
    const res = await client.get(
        `${import.meta.env.VITE_BASE_API_URL}/members/me/profile/detail`
    )
    return res.data
}
export const getMyProfile = async (): Promise<
    BaseResponse<ProfileResponse>
> => {
    const res = await client.get(
        `${import.meta.env.VITE_BASE_API_URL}/members/me/profile`
    )
    return res.data
}

export const getMemberProfile = async (
    memberId: number
): Promise<BaseResponse<ProfileResponse>> => {
    const res = await client.get(
        `${import.meta.env.VITE_BASE_API_URL}/members/${memberId}/profile`
    )
    return res.data
}

export const getMemberProfileDetail = async (
    memberId: number
): Promise<BaseResponse<ProfileDetailResponse>> => {
    const res = await client.get(
        `${import.meta.env.VITE_BASE_API_URL}/members/${memberId}/profile/detail`
    )
    return res.data
}

export const updateMyProfile = async (
    data: UpdateProfileRequest
): Promise<BaseResponse<ProfileResponse>> => {
    const res = await client.patch(
        `${import.meta.env.VITE_BASE_API_URL}/members/me/profile`,
        data
    )
    return res.data
}
