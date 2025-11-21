import { client } from './client'
import {
    OnboardingPreferenceRequest,
    PreferenceMetaResponse,
    PreferenceSummaryResponse
} from '@kimdaegyu/babmukdang-shared'

export const postOnboardingPreference = async (
    data: OnboardingPreferenceRequest
): Promise<void> => {
    const res = await client.post(
        `${import.meta.env.VITE_BASE_API_URL}/auth/onboarding/preference`,
        data
    )
    return res.data.data
}
export const getPreferenceSummary =
    async (): Promise<PreferenceSummaryResponse> => {
        const res = await client.get(
            `${import.meta.env.VITE_BASE_API_URL}/preferences/me`
        )
        return res.data.data
    }

export const getPreferenceMeta = async (): Promise<PreferenceMetaResponse> => {
    const res = await client.get(
        `${import.meta.env.VITE_BASE_API_URL}/preferences/me/meta`
    )
    return res.data.data
}
