/**
 * Search-result → decision-candidate mappers. Shared by every register sheet so
 * each search result keeps its domain shape while becoming a stage candidate.
 */
import type { MealPlanDecisionCandidate } from '@kimdaegyu/babmukdang-shared/domain'
import type { FoodSearchResult, PlaceSearchResult } from '@/services/search'

export const toMenuCandidate = (
    food: FoodSearchResult
): MealPlanDecisionCandidate => ({
    stageType: 'MENU',
    value: {
        menuCandidateId: `manual:${food.code}` as never,
        menu: {
            code: food.code as never,
            label: food.label as never
        },
        source: 'manual-search',
        score: food.popularity ?? 0,
        createdAt: new Date().toISOString() as never
    }
})

export const toAreaCandidate = (
    place: PlaceSearchResult
): MealPlanDecisionCandidate => ({
    stageType: 'AREA',
    value: {
        locationId: `search:${place.placeId}` as never,
        placeName: place.placeName,
        lat: place.latitude as never,
        lng: place.longitude as never,
        address: place.roadAddressName || place.addressName || '',
        source: 'search',
        createdAt: new Date().toISOString() as never
    }
})

export const toRestaurantCandidate = (
    place: PlaceSearchResult
): MealPlanDecisionCandidate => ({
    stageType: 'RESTAURANT',
    value: {
        restaurantId: place.placeId as never,
        placeName: place.placeName,
        categoryName: place.categoryName ?? '',
        categoryGroupName: place.categoryGroupName ?? '',
        distance: place.distance == null ? undefined : String(place.distance),
        roadAddressName: place.roadAddressName ?? '',
        addressName: place.addressName ?? '',
        phone: place.phoneNumber ?? null,
        placeUrl: place.placeUrl ?? null,
        lat: place.latitude,
        lng: place.longitude,
        source: 'search',
        createdAt: new Date().toISOString() as never
    }
})

export const toDateCandidate = (
    isoDate: string
): MealPlanDecisionCandidate => ({
    stageType: 'DATE',
    value: isoDate as never
})

export const toTimeCandidate = (hhmm: string): MealPlanDecisionCandidate => ({
    stageType: 'TIME',
    value: hhmm as never
})
