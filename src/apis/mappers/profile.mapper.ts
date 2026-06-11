import type {
    ProfileDetailDto,
    ProfileDetailResponse,
    ProfileDto,
    ProfileResponse
} from '../types'

export const mapProfile = (profile: ProfileDto | ProfileDetailDto): ProfileResponse => ({
    memberId: Number(profile.memberId),
    userName: profile.username,
    username: profile.username,
    profileImageUrl: profile.profileImageUrl ?? '',
    bio: '',
    meetingCount: 0
})

export const mapProfileDetail = (
    profile: ProfileDetailDto
): ProfileDetailResponse => ({
    memberId: Number(profile.memberId),
    userName: profile.username,
    username: profile.username,
    profileImageUrl: profile.profileImageUrl ?? '',
    bio: profile.bio ?? '',
    meetingCount: profile.completedPlans + profile.uncompletedPlans,
    likes: [],
    dislikes: [],
    allergies: [],
    friendConunt: profile.friendConunt,
    completedPlans: profile.completedPlans,
    uncompletedPlans: profile.uncompletedPlans
})
