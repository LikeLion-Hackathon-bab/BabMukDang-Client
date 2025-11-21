import { client } from './client'
import {
    InvitationPostRequest,
    InvitationResponse
} from '@kimdaegyu/babmukdang-shared'

export const rejectInvitation = async (invitationId: number): Promise<void> => {
    const response = await client.post(
        `${import.meta.env.VITE_BASE_API_URL}/invitations/${invitationId}/reject`
    )
    return response.data.data
}

export const acceptInvitation = async (invitationId: number): Promise<void> => {
    const response = await client.post(
        `${import.meta.env.VITE_BASE_API_URL}/invitations/${invitationId}/accept`
    )
    return response.data.data
}

export const sendInvitation = async (
    data: InvitationPostRequest
): Promise<void> => {
    const response = await client.post(
        `${import.meta.env.VITE_BASE_API_URL}/invitations/send`,
        data
    )
    return response.data.data
}

export const getInvitations = async (): Promise<InvitationResponse[]> => {
    const response = await client.get(
        `${import.meta.env.VITE_BASE_API_URL}/invitations`
    )
    return response.data.data
}
