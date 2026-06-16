import { useCallback, useEffect, useMemo, useState } from 'react'

declare global {
    interface Window {
        kakao?: any
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
