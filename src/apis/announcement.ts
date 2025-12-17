import { client } from './client'
import { BaseResponse, PostRequest, PostResponse } from './dto'

export const getAnnouncements = async (): Promise<
    BaseResponse<PostResponse[]>
> => {
    const res = await client.get(`${import.meta.env.VITE_BASE_API_URL}/posts`)
    return res.data
}

export const postAnnouncement = async (
    data: PostRequest
): Promise<BaseResponse<void>> => {
    const res = await client.post(
        `${import.meta.env.VITE_BASE_API_URL}/posts`,
        data
    )
    return res.data
}

export const closeAnnouncement = async (
    announcementId: number
): Promise<BaseResponse<void>> => {
    const res = await client.post(
        `${import.meta.env.VITE_BASE_API_URL}/posts/${announcementId}/close`
    )
    return res.data
}

export const joinAnnouncement = async (
    announcementId: number
): Promise<BaseResponse<void>> => {
    const res = await client.post(
        `${import.meta.env.VITE_BASE_API_URL}/participate/${announcementId}`
    )
    return res.data
}

export const subscribeAnnouncement = async (
    announcementId: number
): Promise<BaseResponse<void>> => {
    const res = await client.post(
        `${import.meta.env.VITE_BASE_API_URL}/subscribe/${announcementId}`
    )
    return res.data
}
