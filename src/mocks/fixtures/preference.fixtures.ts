/**
 * @fileoverview Preference (선호도) 관련 Mock Fixtures
 */

import type {
    PreferenceSummaryResponse,
    PreferenceMetaResponse,
    PreferenceItem
} from '@/apis'
import { domainFood } from '@/domain/factories'

export const mockPreferenceItems: {
    liked: PreferenceItem[]
    disliked: PreferenceItem[]
    allergy: PreferenceItem[]
    likes: PreferenceItem[]
    dislikes: PreferenceItem[]
    allergies: PreferenceItem[]
} = (() => {
    const liked = [
        domainFood('10000001', '한식'),
        domainFood('10000002', '일식'),
        domainFood('10000003', '양식'),
        domainFood('10000004', '분식')
    ]
    const disliked = [
        domainFood('20000001', '향신료'),
        domainFood('20000002', '고수')
    ]
    const allergy = [
        domainFood('30000001', '땅콩'),
        domainFood('30000002', '갑각류')
    ]
    return {
        liked,
        disliked,
        allergy,
        // Legacy aliases for view-only callers during migration.
        likes: liked,
        dislikes: disliked,
        allergies: allergy
    }
})()

export const mockPreferenceSummary: PreferenceSummaryResponse = {
    liked: mockPreferenceItems.liked,
    disliked: mockPreferenceItems.disliked,
    allergy: mockPreferenceItems.allergy
}

export const mockPreferenceMeta: PreferenceMetaResponse = {
    likes: mockPreferenceItems.liked,
    dislikes: mockPreferenceItems.disliked,
    allergies: mockPreferenceItems.allergy
}
