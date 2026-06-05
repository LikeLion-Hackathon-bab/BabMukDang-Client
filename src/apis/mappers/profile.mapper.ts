import type { ProfileDto, ProfileResponse } from '../types'

/**
 * Backend 프로필 응답 DTO(`member` 래퍼)를 화면 view model로 flatten한다.
 */
export const mapProfile = (profile: ProfileDto): ProfileResponse => ({
    memberId: profile.member.id,
    userName: profile.member.username,
    profileImageUrl: profile.member.profileImageUrl,
    bio: profile.member.bio,
    meetingCount: profile.member.meetingCount
})
