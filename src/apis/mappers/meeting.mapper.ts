import type { MeetingDto, MeetingResponse } from '../types'

/**
 * Backend 모임(Plan) 응답 DTO를 화면 view model로 변환한다.
 * - participants의 userId(string)를 number로, username을 name으로 맞춘다.
 * - meetingAt(ISO)을 화면 time 필드로 전달한다.
 */
export const mapMeeting = (meeting: MeetingDto): MeetingResponse => ({
    id: meeting.id,
    participants: meeting.participants.map(participant => ({
        userId: Number(participant.userId),
        name: participant.username
    })),
    location: meeting.location,
    time: meeting.meetingAt,
    restaurant: meeting.restaurant,
    isCompleted: meeting.isCompleted,
    restaurantType: meeting.restaurantType
})
