import type {
    DomainSearchState,
    FoodSearchResult,
    FriendSearchResult,
    PlaceSearchResult,
    SearchState
} from './types'

export const idleDomainState = <T>(): DomainSearchState<T> => ({
    status: 'idle',
    results: []
})

export const loadingDomainState = <T>(): DomainSearchState<T> => ({
    status: 'loading',
    results: []
})

export const successDomainState = <T>(
    results: T[]
): DomainSearchState<T> => ({
    status: results.length > 0 ? 'success' : 'empty',
    results
})

export const errorDomainState = <T>(error: unknown): DomainSearchState<T> => ({
    status: 'error',
    results: [],
    error
})

export const idleSearchState = (query = ''): SearchState => ({
    query,
    friend: idleDomainState<FriendSearchResult>(),
    place: idleDomainState<PlaceSearchResult>(),
    food: idleDomainState<FoodSearchResult>()
})
