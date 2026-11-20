import { useCallback, useEffect, useMemo, useState } from 'react'

// Kakao 지도 SDK(index.html 의 dapi.kakao.com 스크립트) 중 앱이 실제로 사용하는 부분만 타입으로 기술한다.
export interface KakaoLatLng {
    getLat(): number
    getLng(): number
}

/** 지도 인스턴스는 다른 SDK 객체에 그대로 넘기기만 하므로 불투명 객체로 다룬다. */
export type KakaoMapInstance = object

export interface KakaoMarker {
    setMap(map: KakaoMapInstance | null): void
}

export interface KakaoMouseEvent {
    latLng: KakaoLatLng
}

export interface KakaoGeocoder {
    coord2Address(
        lng: number,
        lat: number,
        callback: (
            result: Array<{ address: { address_name: string } }>,
            status: string
        ) => void
    ): void
}

export interface KakaoPlaces {
    keywordSearch(
        query: string,
        callback: (data: unknown[], status: string) => void,
        options?: Record<string, unknown>
    ): void
}

export interface KakaoSdk {
    maps: {
        LatLng: new (lat: number, lng: number) => KakaoLatLng
        Map: new (
            container: HTMLElement,
            options: { center: KakaoLatLng; level: number }
        ) => KakaoMapInstance
        Marker: new (options: { position: KakaoLatLng }) => KakaoMarker
        event: {
            addListener(
                target: KakaoMapInstance,
                type: string,
                handler: (event: KakaoMouseEvent) => void
            ): void
        }
        services: {
            Status: { OK: string; ZERO_RESULT: string }
            SortBy: { ACCURACY: string; DISTANCE: string }
            Places: new () => KakaoPlaces
            Geocoder: new () => KakaoGeocoder
        }
    }
}

declare global {
    interface Window {
        kakao?: KakaoSdk
    }
}

interface MapOptions {
    center?: { lat: number; lng: number }
    level?: number
}

export function useKakaoMap() {
    const [isLoaded, setIsLoaded] = useState<boolean>(false)

    useEffect(() => {
        if (window.kakao && window.kakao.maps) {
            setIsLoaded(true)
            return
        }
        const timer = setInterval(() => {
            if (window.kakao && window.kakao.maps) {
                setIsLoaded(true)
                clearInterval(timer)
            }
        }, 50)
        return () => clearInterval(timer)
    }, [])

    const kakao = useMemo(() => (isLoaded ? window.kakao : null), [isLoaded])

    const createMap = useCallback(
        (container: HTMLElement, options?: MapOptions) => {
            if (!kakao) return null
            const center = options?.center
                ? new kakao.maps.LatLng(options.center.lat, options.center.lng)
                : new kakao.maps.LatLng(37.5665, 126.978)
            const level = options?.level ?? 3
            const map = new kakao.maps.Map(container, { center, level })
            return map
        },
        [kakao]
    )

    const createPlaces = useCallback(() => {
        if (!kakao) return null
        return new kakao.maps.services.Places()
    }, [kakao])

    const createGeocoder = useCallback(() => {
        if (!kakao) return null
        return new kakao.maps.services.Geocoder()
    }, [kakao])

    return {
        isLoaded,
        kakao,
        createMap,
        createPlaces,
        createGeocoder
    }
}
