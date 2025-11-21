import { LocationVoteItem } from '@/components'
import { useSocket } from '@/contexts/SocketContext'
import {
    LocationCandidateVoteUpdateResponseDto,
    LocationVoteInitialState
} from '@kimdaegyu/babmukdang-shared'
import { useEffect, useState } from 'react'

function isLocationVoteInitialState(
    x: LocationVoteInitialState | LocationCandidateVoteUpdateResponseDto
): x is LocationVoteInitialState {
    return x != null && typeof x === 'object' && 'locations' in x
}
export function LocationVotePage() {
    const service = useSocket()
    const [locationCandidates, setLocationCandidates] =
        useState<LocationVoteInitialState>({ locations: [], votes: [] })
    const [selectedLocation, setSelectedLocation] = useState<string | null>(
        null
    )
    useEffect(() => {
        if (!service) return
        const sub = service.locationVoteInitialState$.subscribe(data => {
            setLocationCandidates(data)
        })
        console.log('sub', sub)
        const sub2 = service.locationVoteUpdated$.subscribe(data => {
            setLocationCandidates(prev => ({
                ...prev,
                votes: data
            }))
        })
        return () => {
            sub.unsubscribe()
            sub2.unsubscribe()
        }
    }, [service])
    const handleLocationSelect = (id: string) => {
        setSelectedLocation(id)
        service?.emit('vote-location', { locationId: id })
    }
    return (
        <>
            <div className="mt-20 flex flex-col gap-13">
                {locationCandidates.locations.map(location => (
                    <LocationVoteItem
                        key={location.id}
                        location={location}
                        handleLocationSelect={handleLocationSelect}
                        isSelected={selectedLocation === location.id}
                    />
                ))}
            </div>
        </>
    )
}
