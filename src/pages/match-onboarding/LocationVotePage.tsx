import { LocationVoteItem } from '@/components'
import { useSocket } from '@/contexts/SocketContext'
import { useEffect, useState } from 'react'
import type { LocationCandidate, MemberId } from '@kimdaegyu/babmukdang-shared/domain'
type LocationCandidateAddUpdateResponseDto = (LocationCandidate & { authorMemberId?: MemberId })[]
type LocationVoteInitialState = { locations: LocationCandidateAddUpdateResponseDto }

export function LocationVotePage() {
    const { phaseData, socket } = useSocket()
    const [locationCandidates, setLocationCandidates] =
        useState<LocationCandidateAddUpdateResponseDto>([])
    const [selectedLocation, setSelectedLocation] = useState<string | null>(
        null
    )
    useEffect(() => {
        if (phaseData && phaseData.phase === 'location-vote') {
            const data = phaseData.data as LocationVoteInitialState
            setLocationCandidates(data.locations)
        }
    }, [phaseData])
    const handleLocationSelect = (id: string) => {
        setSelectedLocation(id)
        socket?.emit('vote-location', {
            locationId: id as LocationCandidate['locationId']
        })
    }
    return (
        <>
            <div className="mt-20 flex flex-col gap-13">
                {locationCandidates.map(location => (
                    <LocationVoteItem
                        key={location.locationId}
                        location={{ ...location, id: location.locationId }}
                        handleLocationSelect={handleLocationSelect}
                        isSelected={selectedLocation === location.locationId}
                    />
                ))}
            </div>
        </>
    )
}
