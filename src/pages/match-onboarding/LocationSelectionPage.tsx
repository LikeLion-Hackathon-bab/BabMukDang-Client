import { useState, useEffect, useRef } from 'react'
import type {
    LocationAddInitialState,
    LocationCandidateAddUpdateResponseDto
} from '@kimdaegyu/babmukdang-shared'

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
    candidates: LocationCandidateAddUpdateResponseDto
): LocationOption[] =>
    candidates.map(candidate => ({
        id: candidate.id,
        placeName: candidate.placeName,
        lat: candidate.lat,
        lng: candidate.lng,
        address: candidate.address,
        isSelected: false
    }))

export function LocationSelectionPage() {
    const { socket, phaseData } = useSocket()

    const [locationOptions, setLocationOptions] = useState<LocationOption[]>([])
    const mapRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (phaseData && phaseData.phase === 'location') {
            setLocationOptions(
                toOptions(phaseData.data as LocationAddInitialState)
            )
        }
    }, [phaseData])

    useEffect(() => {
        const handleLocationAdded = (
            data: LocationCandidateAddUpdateResponseDto
        ) => {
            setLocationOptions(toOptions(data))
            data.forEach(location => {
                const latlng = new window.kakao.maps.LatLng(
                    location.lat,
                    location.lng
                )
                const marker = new window.kakao.maps.Marker({
                    position: latlng
                })
                marker.setMap(mapRef.current)
            })
        }
        socket?.on('location-add-updated', handleLocationAdded)
        return () => {
            socket?.off('location-add-updated', handleLocationAdded)
        }
    }, [socket])

    const handleLocationSelect = (locationId: string) => {
        // setLocationOptions(prev =>
        //     prev.map(location =>
        //         location.id === locationId
        //             ? { ...location, isSelected: !location.isSelected }
        //             : location
        //     )
        // )
        // setSelectedLocation(locationId)
        // socket?.emit('add-location-candidate', {
        //     candidateId: locationId
        // })
    }

    const handleMapLocationSelect = async (
        lat: number,
        lng: number,
        address: string
    ) => {
        // 서버에 위치 후보 전송 (LocationCandidateAddRequestDto: id 필수)
        try {
            socket?.emit('add-location-candidate', {
                id: Date.now().toString(),
                placeName: `새로운 위치 (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
                address,
                lat,
                lng
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
