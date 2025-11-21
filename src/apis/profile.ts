import { client } from './client'
import {
    ProfileResponse,
    ProfileDetailResponse,
    UpdateProfileRequest
} from '@kimdaegyu/babmukdang-shared'

export const getProfile = async (): Promise<ProfileResponse> => {
    const res = await client.get(
        `${import.meta.env.VITE_BASE_API_URL}/members/me/profile`
    )
    return res.data.data
}

export const getMyProfileDetail = async (): Promise<ProfileDetailResponse> => {
    const res = await client.get(
        `${import.meta.env.VITE_BASE_API_URL}/members/me/profile/detail`
    )
    return res.data.data
}
export const getMyProfile = async (): Promise<ProfileResponse> => {
    const res = await client.get(
        `${import.meta.env.VITE_BASE_API_URL}/members/me/profile`
    )
    return res.data.data
}

export const getMemberProfile = async (
    memberId: number
): Promise<ProfileResponse> => {
    const res = await client.get(
        `${import.meta.env.VITE_BASE_API_URL}/members/${memberId}/profile`
    )
    return res.data.data
}

export const getMemberProfileDetail = async (
    memberId: number
): Promise<ProfileDetailResponse> => {
    const res = await client.get(
        `${import.meta.env.VITE_BASE_API_URL}/members/${memberId}/profile/detail`
    )
    return res.data.data
}

export const updateMyProfile = async (
    data: UpdateProfileRequest
): Promise<ProfileResponse> => {
    const res = await client.patch(
        `${import.meta.env.VITE_BASE_API_URL}/members/me/profile`,
        data
    )
    return res.data.data
}
