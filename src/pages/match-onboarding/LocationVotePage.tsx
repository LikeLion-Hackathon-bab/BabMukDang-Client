import { LocationVoteItem } from '@/components'
import { useSocket } from '@/contexts/SocketContext'
import { useState } from 'react'
import type { LocationCandidate } from '@kimdaegyu/babmukdang-shared/domain/room'

export function LocationVotePage() {
    const { commands, locationCandidates } = useSocket()
    const [selectedLocation, setSelectedLocation] = useState<string | null>(
        null
    )

    const handleLocationSelect = (id: string) => {
        setSelectedLocation(id)
        commands?.voteLocation({
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
