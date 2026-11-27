import { client } from './client'
import { BaseResponse } from './dto'

export interface MeetingParticipant {
    userId: number
    name: string
}

export interface MeetingResponse {
    id: number
    participants: MeetingParticipant[]
    location: string
    time: string
    restaurant: string
    isCompleted: boolean
    restaurantType: string
}

export const getMeetings = async (): Promise<
    BaseResponse<MeetingResponse[]>
> => {
    const res = await client.get(
        `${import.meta.env.VITE_BASE_API_URL}/meetings`
    )
    return res.data
}

export const getMeeting = async (id: number): Promise<MeetingResponse> => {
    const response = await client.get<BaseResponse<MeetingResponse>>(
        `${import.meta.env.VITE_BASE_API_URL}/meetings/${id}`
    )
    return response.data.data
}
