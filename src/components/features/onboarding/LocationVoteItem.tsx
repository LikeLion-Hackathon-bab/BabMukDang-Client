import { HeartDefaultIcon, HeartFilledIcon } from '@/assets/icons'
import { LocationCandidateAddUpdateResponseItem } from '@kimdaegyu/babmukdang-shared'

export function LocationVoteItem({
    location,
    handleLocationSelect,
    isSelected
}: {
    location: LocationCandidateAddUpdateResponseItem
    handleLocationSelect: (id: string) => void
    isSelected: boolean
}) {
    return (
        <div
            className={`rounded-12 shadow-drop-1 cursor-pointer p-16 ${
                isSelected
                    ? 'bg-primary-100 border-primary-main border'
                    : 'bg-white'
            }`}
            onClick={() => handleLocationSelect(location.id)}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <h3 className="text-body1-medium text-black">
                        {location.address}
                    </h3>
                    {/* <p className="text-sm text-gray-500">
                        {location.placeName}
                    </p> */}
                </div>
                <div className="flex items-center">
                    {isSelected ? <HeartFilledIcon /> : <HeartDefaultIcon />}
                </div>
            </div>
        </div>
    )
}
