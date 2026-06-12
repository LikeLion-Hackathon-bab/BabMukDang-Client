import {
    apiContract,
    type MatchingNotification,
    type RoomAccessResponse
} from '@kimdaegyu/babmukdang-shared/domain'
import { contractClient } from './client'
import { domainId } from '@/domain/factories'

export const notificationApi = {
    getAll: async (): Promise<MatchingNotification[]> => {
        return contractClient.get(apiContract.notifications.list)
    },

    accessRoom: async (roomId: string): Promise<RoomAccessResponse> => {
        return contractClient.get(apiContract.room.access, {
            pathParams: { roomId: domainId.room(roomId) }
        })
    },

    markRead: async (notificationId: string): Promise<MatchingNotification> => {
        return contractClient.patch(apiContract.notifications.markRead, {
            pathParams: { notificationId }
        })
    },

    delete: async (notificationId: string): Promise<void> => {
        await contractClient.delete(apiContract.notifications.delete, {
            pathParams: { notificationId }
        })
    }
}
