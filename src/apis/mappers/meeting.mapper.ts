import type { MeetingDto, MeetingResponse } from '../types'

export const mapMeeting = (meeting: MeetingDto): MeetingResponse => ({
    id: Number(meeting.planId),
    participants: meeting.participants.map((participant: { memberId: number | string; username: string }) => ({
        userId: Number(participant.memberId),
        name: participant.username
    })),
    location: meeting.location?.address ?? '위치 알 수 없음',
    time: meeting.meetingAt,
    restaurant: meeting.restaurant?.placeName ?? '알 수 없는 식당',
    isCompleted: meeting.status === 'COMPLETED' || isComplete(meeting.meetingAt),
    restaurantType: meeting.restaurant?.categoryName ?? '미분류'
})

function isComplete(meetingAt: string): boolean {
    return new Date(meetingAt) < new Date()
}
