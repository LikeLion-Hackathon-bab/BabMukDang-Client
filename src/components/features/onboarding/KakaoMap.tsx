import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useKakaoMap } from '@/hooks'

interface KakaoMapProps {
    ref?: React.RefObject<any>
    onLocationSelect?: (lat: number, lng: number, address: string) => void
    width?: string
    height?: string
    children?: React.ReactNode
}

export function KakaoMap({
    onLocationSelect,
    ref,
    width = '100vw',
    height = '260px',
    children
}: KakaoMapProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const [map, setMap] = useState<any>(null)
    const [markers, setMarkers] = useState<any[]>([])
    const markersRef = useRef<any[]>([])
    const { isLoaded, kakao, createMap, createGeocoder } = useKakaoMap()

    // markers 상태가 업데이트될 때마다 ref도 업데이트
    useEffect(() => {
        markersRef.current = markers
    }, [markers])

    const initMap = useCallback(() => {
        if (!mapRef.current || !isLoaded || !kakao) return
        try {
            const kakaoMap = createMap(mapRef.current, {
                center: { lat: 37.5665, lng: 126.978 },
                level: 3
            })
            if (!kakaoMap) return
            ref && (ref.current = kakaoMap)
            setMap(kakaoMap)

            // 지도 클릭 이벤트
            kakao.maps.event.addListener(
                kakaoMap,
                'click',
                (mouseEvent: any) => {
                    const latlng = mouseEvent.latLng
                    const lat = latlng.getLat()
                    const lng = latlng.getLng()

                    // 기존 마커 제거 (ref 사용)
                    markersRef.current.forEach(marker => marker.setMap(null))

                    // 새 마커 추가
                    const marker = new kakao.maps.Marker({
                        position: latlng
                    })
                    marker.setMap(kakaoMap)
                    setMarkers([marker])

                    // 주소 검색
                    const geocoder = createGeocoder()
                    if (!geocoder) return
                    geocoder.coord2Address(
                        lng,
                        lat,
                        (result: any, status: any) => {
                            if (status === kakao.maps.services.Status.OK) {
                                const address = result[0].address.address_name
                                onLocationSelect?.(lat, lng, address)
                            } else {
                                onLocationSelect?.(lat, lng, '알 수 없는 주소')
                            }
                        }
                    )
                }
            )
        } catch (error) {
            console.error('카카오맵 초기화 오류:', error)
        }
    }, [createGeocoder, createMap, isLoaded, kakao, onLocationSelect, ref])

    // API가 로드되면 지도 초기화
    useEffect(() => {
        initMap()
    }, [initMap])

    return (
        <div
            ref={mapRef}
            style={{
                width,
                height
            }}
            className="relative -ml-20">
            {children}
        </div>
    )
}
