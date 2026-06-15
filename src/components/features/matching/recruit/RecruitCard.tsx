import type { RecruitCardView } from '@/viewModels'
import {
    ProfileDefaultIcon,
    EmptyViewIcon,
    LocationWhiteIcon,
    TimeWhiteIcon,
    PeopleWhiteIcon
} from '@/assets/icons'
import { KebabButton } from '@/components'
import {
    formatKoreanDateTime,
    formatRecruitExpiresIn
} from '@/lib/dateTime'

export function RecruitCard({
    recruit,
    cardRef,
    index = 0,
    currentIndex = 0,
    isActive = true,
    showKebab = false
}: {
    recruit: RecruitCardView
    cardRef?: React.RefObject<HTMLDivElement>
    index?: number
    currentIndex?: number
    isActive?: boolean
    showKebab?: boolean
}) {
    return (
        <div
            ref={cardRef && currentIndex === index ? cardRef : null}
            className={`shadow-drop-1 rounded-16 relative flex max-h-327 w-full flex-col items-center justify-between bg-white px-12 py-8 transition-all duration-200 ${
                isActive ? 'cursor-pointer hover:shadow-lg' : 'cursor-pointer'
            }`}>
            {/* Header with creator info and time left */}
            <div className="flex w-full flex-col items-center gap-16">
                <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-10">
                        {recruit.author.profileImageUrl ? (
                            <img
                                src={recruit.author.profileImageUrl}
                                alt="profile"
                                className="size-20 rounded-full"
                            />
                        ) : (
                            <ProfileDefaultIcon className="size-20" />
                        )}
                        <span className="text-body1-semibold">
                            {recruit.author.name}
                        </span>
                    </div>
                    {/* KebabButton at top-right (optional) */}
                    {showKebab && (
                        <KebabButton
                            className="absolute top-8 right-8 z-10"
                            onClick={() => {}}
                        />
                    )}
                </div>

                <div className="flex flex-col items-center gap-6">
                    <span className="text-caption-medium text-gray-5">
                        {formatRecruitExpiresIn(recruit.createdAt)}
                    </span>
                    {/* Title */}
                    <div className="flex w-218 flex-col gap-16">
                        <div className="text-center">
                            <span className="text-title2-bold text-gray-8 whitespace-pre-line">
                                {recruit.message}
                            </span>
                        </div>

                        {/* Time and Location Info */}
                        <div className="rounded-12 bg-primary-500 p-16">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <TimeWhiteIcon />
                                    <span className="text-body2-semibold text-white">
                                        {formatKoreanDateTime(
                                            recruit.meetingAt
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <LocationWhiteIcon />
                                    <span className="text-body2-semibold text-white">
                                        {recruit.location}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <PeopleWhiteIcon />
                                    <span className="text-body2-semibold text-white">
                                        {recruit.targetCount}명
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex w-full flex-col gap-6">
                {/* Participants */}
                <span className="text-caption-medium text-gray-4">
                    함께 하는 친구
                </span>

                <div className="rounded-50 border-primary-200 h-40 border px-12 py-8">
                    <div className="flex flex-row gap-8">
                        {recruit.participants.map((participant, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-8">
                                {participant.profileImageUrl ? (
                                    <img
                                        src={participant.profileImageUrl}
                                        alt="profile"
                                        className="size-20 rounded-full"
                                    />
                                ) : (
                                    <ProfileDefaultIcon className="size-20" />
                                )}
                                <span className="text-body2-medium">
                                    {participant.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export function EmptyRecruitCard() {
    return (
        <div className="shadow-drop-1 rounded-16 h-353 w-280 origin-center translate-x-[-50%] bg-white px-12 py-8">
            <div className="flex h-full flex-col items-center justify-center gap-16">
                <div className="flex w-136 flex-col items-center gap-16">
                    <EmptyViewIcon />
                    <span className="text-body1-semibold text-gray-4 text-center whitespace-pre-line">
                        {'오늘은 아직 올라온\n공고가 없어요'}
                    </span>
                </div>
            </div>
        </div>
    )
}
