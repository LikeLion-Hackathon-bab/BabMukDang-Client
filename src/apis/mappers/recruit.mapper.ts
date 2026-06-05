import type { PostResponse, RecruitDto } from '../types'

export const mapRecruit = (recruit: RecruitDto): PostResponse => ({
    targetCount: recruit.targetCount,
    meetingAt: recruit.meetingAt,
    location: recruit.location,
    message: recruit.message,
    postId: recruit.postId,
    author: {
        authorId: Number(recruit.author.userId),
        name: recruit.author.username,
        profileImageUrl: recruit.author.profileImageUrl
    },
    createdAt: recruit.createdAt,
    participants: recruit.participants.map(participant => ({
        memberId: Number(participant.userId),
        name: participant.username,
        profileImageUrl: participant.profileImageUrl
    }))
})
