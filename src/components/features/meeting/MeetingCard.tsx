import type { MeetingResponse } from '@/apis/meeting'
import { BackIcon } from '@/assets/icons'
import { COLORS } from '@/constants/colors'

export function MeetingCard({
    meeting,
    onClick
}: {
    meeting: MeetingResponse
    onClick: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="rounded-12 shadow-drop-1 flex w-full items-center justify-between gap-12 bg-white p-16 text-left">
            <span className="flex min-w-0 flex-col gap-6 break-words">
                <strong>{meeting.restaurant}</strong>
                <span>
                    {meeting.time} · {meeting.location}
                </span>
                <span className="text-caption-medium text-gray-6">
                    {meeting.participants.map(person => person.name).join(', ')}
                </span>
            </span>
            <BackIcon
                strokecolor={COLORS.gray3}
                className="shrink-0 rotate-180"
            />
        </button>
    )
}
