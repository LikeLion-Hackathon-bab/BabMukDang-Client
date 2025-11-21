import { RecruitResponseDto } from '@kimdaegyu/babmukdang-shared'
import {
    ProfileDefaultIcon,
    LocationWhiteIcon,
    TimeWhiteIcon,
    PeopleWhiteIcon
} from '@/assets/icons'

export function CloseAnnouncementCard({
    announcement
}: {
    announcement: RecruitResponseDto
}) {
    return (
        <div
            className={`shadow-drop-1 rounded-16 h-353 w-full bg-white px-12 py-8 transition-all duration-200`}>
            {/* Header with creator info and time left */}
            <div className="mb-12 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <ProfileDefaultIcon className="size-20" />
                    <span className="text-body1-semibold">
                        {announcement.author.username}
                    </span>
                </div>
                <span className="text-caption-medium text-gray-5">
                    {announcement.createdAt}
                </span>
            </div>

            {/* Title */}
            <div className="mb-16 text-center">
                <span className="text-title1-bold whitespace-pre-line">
                    {announcement.message}
                </span>
            </div>

            {/* Time and Location Info */}
            <div className="rounded-12 bg-primary-500 mb-16 p-16">
                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-4">
                        <TimeWhiteIcon />
                        <span className="text-body2-semibold text-white">
                            {announcement.meetingAt}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <LocationWhiteIcon />
                        <span className="text-body2-semibold text-white">
                            {announcement.location}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <PeopleWhiteIcon />
                        <span className="text-body2-semibold text-white">
                            {announcement.targetCount}명
                        </span>
                    </div>
                </div>
            </div>

            {/* Participants */}
            <div className="mb-12">
                <span className="text-caption-medium text-gray-4">
                    함께 하는 친구
                </span>
            </div>

            <div className="rounded-50 border-primary-200 border p-8">
                <div className="flex flex-row gap-8">
                    {announcement.participants.map((participant, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-8">
                            <ProfileDefaultIcon className="size-20" />
                            <span className="text-body2-medium">
                                {participant.username}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
