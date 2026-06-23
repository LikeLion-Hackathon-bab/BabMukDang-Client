/** Search-result → shared decision-candidate mappers. */
import type { MealPlanDecisionCandidate } from '@kimdaegyu/babmukdang-shared/domain'
import type { FoodSearchResult, PlaceSearchResult } from '@/services/search'

export const toMenuCandidate = (
    food: FoodSearchResult
): MealPlanDecisionCandidate => ({
    stageType: 'MENU',
    value: {
        menuCandidateId: `manual-search:${food.code}` as never,
        menu: {
            code: food.code as never,
            label: food.label as never
        },
        source: 'manual-search',
        score: food.popularity ?? 0,
        imageUrl: food.imageUrl ?? food.image?.src ?? null,
        image: food.image ?? null,
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

export const toMapMarkerAreaCandidate = ({
    lat,
    lng,
    address
}: {
    lat: number
    lng: number
    address: string
}): MealPlanDecisionCandidate => ({
    stageType: 'AREA',
    value: {
        locationId: `map-marker:${lat.toFixed(6)}:${lng.toFixed(6)}` as never,
        placeName: address || '지도에서 선택한 위치',
        lat: lat as never,
        lng: lng as never,
        address: address || '',
        source: 'manual',
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
