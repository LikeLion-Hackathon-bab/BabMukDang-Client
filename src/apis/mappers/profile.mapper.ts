import type {
    ProfileDetailDto,
    ProfileDetailView,
    ProfileDto,
    ProfileSummaryView
} from '../types'

export const mapProfile = (profile: ProfileDto | ProfileDetailDto): ProfileSummaryView => ({
    memberId: Number(profile.memberId),
    userName: profile.username,
    username: profile.username,
    profileImageUrl: profile.profileImageUrl ?? '',
    bio: '',
    meetingCount: 0
})

export const mapProfileDetail = (
    profile: ProfileDetailDto
): ProfileDetailView => ({
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
