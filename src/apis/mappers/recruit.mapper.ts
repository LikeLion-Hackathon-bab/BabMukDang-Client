import type { PostResponse, RecruitDto } from '../types'

export const mapRecruit = (recruit: RecruitDto): PostResponse => ({
    targetCount: recruit.targetCount,
    meetingAt: recruit.meetingAt,
    location: recruit.location,
    message: recruit.message,
    postId: Number(recruit.recruitId),
    author: {
        authorId: Number(recruit.author.memberId),
        name: recruit.author.username,
        profileImageUrl: recruit.author.profileImageUrl ?? ''
    },
    createdAt: recruit.createdAt,
    participants: recruit.participants.map((participant: { memberId: number | string; username: string; profileImageUrl?: string | null }) => ({
        memberId: Number(participant.memberId),
        name: participant.username,
        profileImageUrl: participant.profileImageUrl ?? ''
    }))
})
