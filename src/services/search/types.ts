import type {
    FoodCodeManifest,
    FoodCodeManifestItem
} from '@kimdaegyu/babmukdang-shared/domain/food'
import type { Observable } from 'rxjs'

export type SearchDomain = 'friend' | 'place' | 'food'

export type SearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error'

export interface SearchContext {
    latitude?: number
    longitude?: number
    radius?: number
    sort?: 'accuracy' | 'distance'
    userId?: number | string
}

export interface DomainSearchState<T> {
    status: SearchStatus
    results: T[]
    error?: unknown
}

export interface FriendSearchResult {
    friendId?: number | string
    memberId: number | string
    nickname: string
    profileImageUrl?: string | null
    handle?: string | null
    friendStatus?: string | null
    isBlocked?: boolean
    isFriend?: boolean
    canInviteToMealPlan?: boolean
    raw?: unknown
}

export interface PlaceSearchResult {
    placeId: string
    placeName: string
    addressName?: string | null
    roadAddressName?: string | null
    latitude: number
    longitude: number
    distance?: number | null
    categoryName?: string | null
    categoryGroupCode?: string | null
    categoryGroupName?: string | null
    phoneNumber?: string | null
    placeUrl?: string | null
    raw?: unknown
}

export type FoodSearchResult = FoodCodeManifestItem

export interface SearchState {
    query: string
    friend: DomainSearchState<FriendSearchResult>
    place: DomainSearchState<PlaceSearchResult>
    food: DomainSearchState<FoodSearchResult>
}

export interface SearchProviderInput {
    query: string
    context?: SearchContext
}

export interface SearchProvider<T> {
    readonly domain: SearchDomain
    readonly minQueryLength: number
    search(input: SearchProviderInput): Observable<T[]>
    clearCache?(): void
}

export type FoodSearchManifest = FoodCodeManifest

export type SearchProviderRegistry = {
    friend: SearchProvider<FriendSearchResult>
    place: SearchProvider<PlaceSearchResult>
    food: SearchProvider<FoodSearchResult>
}
