import type {
    MealPlanParticipantResponse,
    MyMealPlanListItem
} from '@kimdaegyu/babmukdang-shared/domain'
import type {
    MealPlanCardView,
    MealPlanParticipantView
} from '@/viewModels/api'

const resolveParticipantName = (participant: MealPlanParticipantResponse) => {
    if (participant.member) {
        return participant.member.username
    }

    return participant.guest?.nickname ?? '게스트'
}

export const mapMealPlanParticipant = (
    participant: MealPlanParticipantResponse
): MealPlanParticipantView => ({
    participantId: participant.participantId,
    memberId: participant.member?.memberId ?? null,
    guestId: participant.guest?.guestId ?? null,
    name: resolveParticipantName(participant),
    profileImageUrl: participant.member?.profileImageUrl ?? null,
    role: participant.role,
    status: participant.status
})

const buildScheduleText = (item: MyMealPlanListItem) => {
    if (item.selectedDate && item.selectedTime) {
        return `${item.selectedDate} ${item.selectedTime}`
    }
    if (item.selectedDate) return item.selectedDate
    if (item.selectedTime) return item.selectedTime
    return '시간 미정'
}

export const mapMyMealPlanListItem = (
    item: MyMealPlanListItem
): MealPlanCardView => ({
    mealPlanId: item.mealPlanId,
    title: item.title,
    status: item.status,
    group: item.group,
    participantCount: item.participantCount,
    scheduleText: buildScheduleText(item),
    placeText:
        item.selectedRestaurantName ?? item.selectedAreaName ?? '장소 미정',
    primaryActionLabel: item.primaryAction.label,
    primaryActionHref: item.primaryAction.href,
    updatedAt: item.updatedAt
})
