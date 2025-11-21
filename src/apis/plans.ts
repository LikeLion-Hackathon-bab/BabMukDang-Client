import { client } from './client'
import { MeetingResponse } from '@kimdaegyu/babmukdang-shared'

export const getUncompletedPlans = async (): Promise<MeetingResponse[]> => {
    const res = await client.get(
        `${import.meta.env.VITE_BASE_API_URL}/plans/uncompleted`
    )
    return res.data.data as MeetingResponse[]
}

export const getCompletedPlans = async (): Promise<MeetingResponse[]> => {
    const res = await client.get(
        `${import.meta.env.VITE_BASE_API_URL}/plans/completed`
    )
    return res.data.data as MeetingResponse[]
}
