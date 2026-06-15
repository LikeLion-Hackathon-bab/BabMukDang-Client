/** @fileoverview Meeting/Plan mock fixtures */
import type { PlanResponse } from '@/apis/types'
import { LatitudeSchema, LongitudeSchema } from '@kimdaegyu/babmukdang-shared/domain/room'
import { mapMeeting } from '@/apis/mappers/meeting.mapper'

const now = '2025-08-20T09:00:00.000Z'

const member = (memberId: number, username: string) =>
    ({ memberId, username, profileImageUrl: '' }) as PlanResponse['author']

const createMeeting = ({
    id,
    location,
    meetingAt,
    restaurant,
    restaurantType,
    isCompleted
}: {
    id: number
    location: string
    meetingAt: string
    restaurant: string
    restaurantType: string
    isCompleted: boolean
}): PlanResponse => ({
    planId: id as PlanResponse['planId'],
    author: member(1, '서은우'),
    participants: [member(1, '서은우'), member(2, '유가은')],
    location: {
        locationId: String(id) as NonNullable<PlanResponse['location']>['locationId'],
        placeName: location,
        address: '주소',
        source: 'manual',
        lat: LatitudeSchema.parse(0),
        lng: LongitudeSchema.parse(0)
    },
    restaurant: {
        restaurantId: String(id) as NonNullable<PlanResponse['restaurant']>['restaurantId'],
        placeName: restaurant,
        categoryName: restaurantType,
        categoryGroupName: '음식점',
        distance: '200',
        roadAddressName: '',
        addressName: '',
        phone: '',
        placeUrl: null,
        lat: LatitudeSchema.parse(0),
        lng: LongitudeSchema.parse(0)
    },
    meetingAt,
    status: isCompleted ? 'COMPLETED' : 'PLANNING',
    type: 'RECRUIT',
    createdAt: now,
    updatedAt: now
})

export const mockMeetingResponses: PlanResponse[] = [
    createMeeting({ id: 1, location: '서울과학기술대학교 정문 앞', meetingAt: '2025-08-27T14:30:00.000Z', restaurant: '동학 주점', restaurantType: '한식', isCompleted: false }),
    createMeeting({ id: 2, location: '상상관 1층 앞', meetingAt: '2025-08-27T14:30:00.000Z', restaurant: '오하이요', restaurantType: '일식', isCompleted: false }),
    createMeeting({ id: 3, location: '서울과학기술대학교 정문 앞', meetingAt: '2025-08-27T14:30:00.000Z', restaurant: '동학 주점', restaurantType: '한식', isCompleted: true })
]

export const mockSingleMeetingResponse: PlanResponse = mockMeetingResponses[0]
export const MockMeetingList = mockMeetingResponses.map(mapMeeting)
