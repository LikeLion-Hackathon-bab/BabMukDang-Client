import { useState, useEffect, useRef } from 'react'

import { useSocket } from '@/contexts/SocketContext'
import { KakaoMap, LocationCadidateItem } from '@/components'
import {
    LocationCandidateAddRequestDto,
    LocationCandidate
} from '@kimdaegyu/babmukdang-shared'
import { LocationAddInitialState } from '@kimdaegyu/babmukdang-shared'

export function LocationSelectionPage() {
    const service = useSocket()

    const [locationOptions, setLocationOptions] =
        useState<LocationAddInitialState>([])
    const mapRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (!service) return
        service.locationAddInitialState$.subscribe(data => {
            if (data && 'locations' in data) {
                setLocationOptions(data.locations)
            }
        })
        service.locationAddUpdated$.subscribe(data => {
            if (data) {
                setLocationOptions(data)
            }
        })
    }, [service])

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
        // 새로운 위치 옵션 추가
        const newLocation: LocationCandidate = {
            id: Date.now().toString(),
            placeName: `새로운 위치 (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            address: address,
            lat,
            lng
        }

        // 서버에 위치 데이터 전송
        try {
            const locationData: LocationCandidateAddRequestDto = {
                id: newLocation.id,
                lat,
                lng,
                placeName: newLocation.placeName,
                address: newLocation.address
            }

            service?.emit('add-location-candidate', locationData)
            // await locationApi.sendLocationSelection(locationData)
            console.log('위치 데이터가 서버에 전송되었습니다:', locationData)
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
                {locationOptions?.map(location => (
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
