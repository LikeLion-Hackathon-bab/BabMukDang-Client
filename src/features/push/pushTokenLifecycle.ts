import type { RegisterPushTokenRequest } from '@kimdaegyu/babmukdang-shared/domain'
import { createPushClient } from './pushClients'

export const getPushTokenRegistrationIfAllowed = async (): Promise<
    RegisterPushTokenRequest | null
> => {
    const client = createPushClient()
    return client.getTokenIfPermissionGranted()
}

export const requestPushTokenRegistration = async (): Promise<
    RegisterPushTokenRequest | null
> => {
    const client = createPushClient()
    return client.requestToken()
}
