import { client } from './client'
import {
    RecruitResponseDto,
    RecruitRequestDto
} from '@kimdaegyu/babmukdang-shared'

export const getAnnouncements = async (): Promise<RecruitResponseDto[]> => {
    const res = await client.get(
        `${import.meta.env.VITE_BASE_API_URL}/recruits`
    )
    return res.data.data as RecruitResponseDto[]
}

export const postAnnouncement = async (
    data: RecruitRequestDto
): Promise<void> => {
    const res = await client.post(
        `${import.meta.env.VITE_BASE_API_URL}/recruits`,
        data
    )
    return res.data.data as void
}

export const closeAnnouncement = async (
    announcementId: number
): Promise<void> => {
    const res = await client.post(
        `${import.meta.env.VITE_BASE_API_URL}/recruits/${announcementId}/close`
    )
    return res.data.data as void
}

export const joinAnnouncement = async (
    announcementId: number
): Promise<void> => {
    const res = await client.post(
        `${import.meta.env.VITE_BASE_API_URL}/recruits/${announcementId}/join`
    )
    return res.data.data as void
}

export const subscribeAnnouncement = async (
    announcementId: number
): Promise<EventSource> => {
    const es = new EventSource(
        `${import.meta.env.VITE_SERVER_URL}${import.meta.env.VITE_BASE_API_URL}/sse/rooms/${announcementId}`
    )

    es.addEventListener('heartbeat', () => {
        // keep-alive
    })
    es.onerror = event => {
        console.error(event)
    }
    return es
}
