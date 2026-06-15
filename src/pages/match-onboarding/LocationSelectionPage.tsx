import { domainId } from '@/domain/factories'
import { useState, useEffect, useRef } from 'react'
import { LatitudeSchema, LongitudeSchema, type LocationCandidateAddUpdateResponse } from '@kimdaegyu/babmukdang-shared/domain/room'

import { useSocket } from '@/contexts/SocketContext'
import { KakaoMap, LocationCadidateItem } from '@/components'

interface LocationOption {
    id: string
    placeName: string
    lat: number
    lng: number
    address?: string
    isSelected: boolean
}

const toOptions = (
    candidates: LocationCandidateAddUpdateResponse
): LocationOption[] =>
    candidates.map(candidate => ({
        id: candidate.locationId,
        placeName: candidate.placeName,
        lat: candidate.lat,
        lng: candidate.lng,
        address: candidate.address,
        isSelected: false
    }))

export function LocationSelectionPage() {
    const { commands, locationCandidates } = useSocket()

    const [locationOptions, setLocationOptions] = useState<LocationOption[]>([])
    const mapRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setLocationOptions(toOptions(locationCandidates))

        if (!window.kakao?.maps || !mapRef.current) {
            return
        }

        locationCandidates.forEach(location => {
            const latlng = new window.kakao.maps.LatLng(
                location.lat,
                location.lng
            )
            const marker = new window.kakao.maps.Marker({
                position: latlng
            })
            marker.setMap(mapRef.current)
        })
    }, [locationCandidates])

    const handleLocationSelect = (locationId: string) => {
        setLocationOptions(prev =>
            prev.map(location =>
                location.id === locationId
                    ? { ...location, isSelected: !location.isSelected }
                    : location
            )
        )
    }

    const handleMapLocationSelect = async (
        lat: number,
        lng: number,
        address: string
    ) => {
        try {
            commands?.addLocationCandidate({
                locationId: domainId.location(Date.now().toString()),
                placeName: `새로운 위치 (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
                address,
                lat: LatitudeSchema.parse(lat),
                lng: LongitudeSchema.parse(lng)
            })
        } catch (error) {
            console.error('위치 데이터 전송 실패:', error)
        }
    }

    return (
        <>
            {/* Map */}
            <div className="relative">
                <div
                    className="pointer-events-none absolute left-0 z-200 -ml-20 h-full w-screen select-none"
                    style={{
                        boxShadow:
                            '0 -4px 14px 0 rgba(0, 0, 0, 0.10) inset, 0 4px 14px 0 rgba(0, 0, 0, 0.10) inset'
                    }}></div>
                {/* <div className="absolute top-17 left-0 z-200 w-full">
                    <SearchInput
                        handleSearch={handleSearch}
                        placeholder="장소 검색하기"
                    />
                </div> */}
                <KakaoMap
                    ref={mapRef}
                    onLocationSelect={handleMapLocationSelect}
                    height="300px"></KakaoMap>
            </div>

            {/* Location Options */}
            <div className="mt-20 flex flex-col gap-13">
                {locationOptions.map(location => (
                    <LocationCadidateItem
                        key={location.id}
                        location={location}
                        onClick={() => handleLocationSelect(location.id)}
                    />
                ))}
            </div>
        </>
    )
}
