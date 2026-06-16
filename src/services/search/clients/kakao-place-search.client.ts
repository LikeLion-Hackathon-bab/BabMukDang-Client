import type { PlaceSearchResult, SearchContext } from '../types'

export interface PlaceSearchClient {
    searchPlaces(query: string, context?: SearchContext): Promise<PlaceSearchResult[]>
}

declare global {
    interface Window {
        kakao?: any
    }
}

const toNumberOrNull = (value: unknown): number | null => {
    if (value === undefined || value === null || value === '') return null
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

const toPlaceSearchResult = (value: unknown): PlaceSearchResult => {
    const item = value as Record<string, unknown>
    const latitude = toNumberOrNull(item.y) ?? 0
    const longitude = toNumberOrNull(item.x) ?? 0

    return {
        placeId: String(item.id ?? ''),
        placeName: String(item.place_name ?? item.placeName ?? ''),
        addressName: (item.address_name ?? item.addressName) as string | null | undefined,
        roadAddressName: (item.road_address_name ?? item.roadAddressName) as string | null | undefined,
        latitude,
        longitude,
        distance: toNumberOrNull(item.distance),
        categoryName: (item.category_name ?? item.categoryName) as string | null | undefined,
        categoryGroupCode: (item.category_group_code ?? item.categoryGroupCode) as string | null | undefined,
        categoryGroupName: (item.category_group_name ?? item.categoryGroupName) as string | null | undefined,
        phoneNumber: (item.phone ?? item.phoneNumber) as string | null | undefined,
        placeUrl: (item.place_url ?? item.placeUrl) as string | null | undefined,
        raw: value
    }
}

export class KakaoPlaceSearchClient implements PlaceSearchClient {
    constructor(private readonly timeoutMs = 5000) {}

    searchPlaces(query: string, context?: SearchContext): Promise<PlaceSearchResult[]> {
        return Promise.race([
            this.searchWithKakaoSdk(query, context),
            new Promise<PlaceSearchResult[]>((_, reject) => {
                window.setTimeout(
                    () => reject(new Error('KAKAO_PLACE_SEARCH_TIMEOUT')),
                    this.timeoutMs
                )
            })
        ])
    }

    private searchWithKakaoSdk(
        query: string,
        context?: SearchContext
    ): Promise<PlaceSearchResult[]> {
        return new Promise((resolve, reject) => {
            const kakao = window.kakao

            if (!kakao?.maps?.services?.Places) {
                reject(new Error('KAKAO_MAP_SDK_NOT_READY'))
                return
            }

            const places = new kakao.maps.services.Places()
            const options: Record<string, unknown> = {
                category_group_code: 'FD6'
            }

            if (context?.longitude !== undefined && context.latitude !== undefined) {
                options.x = context.longitude
                options.y = context.latitude
                options.sort =
                    context.sort === 'accuracy'
                        ? kakao.maps.services.SortBy.ACCURACY
                        : kakao.maps.services.SortBy.DISTANCE
            }

            if (context?.radius !== undefined) {
                options.radius = context.radius
            }

            places.keywordSearch(
                query,
                (data: unknown[], status: string) => {
                    if (status === kakao.maps.services.Status.OK) {
                        resolve(data.map(toPlaceSearchResult).filter(item => item.placeId && item.placeName))
                        return
                    }

                    if (status === kakao.maps.services.Status.ZERO_RESULT) {
                        resolve([])
                        return
                    }

                    reject(new Error(`KAKAO_PLACE_SEARCH_FAILED:${status}`))
                },
                options
            )
        })
    }
}
