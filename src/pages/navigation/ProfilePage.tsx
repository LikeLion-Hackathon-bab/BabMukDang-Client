import { useEffect, useState } from 'react'

import { BOTTOM_NAVIGATION_HEIGHT } from '@/constants/bottomNav'
import { MockMyProfileData } from '@/constants/mockData'

import { useHeader } from '@/hooks'
import {
    FriendInviteModal,
    ProfileModal,
    ProfileButtonSection,
    ProfileSection
} from '@/components'
import { useGetMyProfileDetail, useLogout } from '@/query'
import { ProfileDetailResponse } from '@kimdaegyu/babmukdang-shared'

export function ProfilePage() {
    const { hideHeader, resetHeader } = useHeader()
    const { data: profileData } = useGetMyProfileDetail()
    const { mutate: logout } = useLogout()
    const [profile, setProfile] = useState<ProfileDetailResponse>(
        profileData ?? MockMyProfileData
    )
    useEffect(() => {
        hideHeader()
        return () => {
            resetHeader()
        }
    }, [])
    useEffect(() => {
        if (profileData) {
            setProfile({
                memberId: profileData.memberId,
                profileImageUrl: profileData.profileImageUrl,
                userName: profileData.userName,
                bio: profileData.bio,
                meetingCount: profileData.meetingCount,
                likes: profileData.likes,
                allergies: profileData.allergies,
                dislikes: profileData.dislikes
            })
        }
    }, [profileData])
    return (
        <main className="relative h-full min-h-full">
            {/* 프로필 섹션 */}
            <ProfileSection
                profileImgUrl={profile.profileImageUrl}
                name={profile.userName}
                description={profile.bio}
                likes={profile.likes.map(like => like.label)}
                dislikes={profile.dislikes.map(dislike => dislike.label)}
                allergies={profile.allergies.map(allergy => allergy.label)}
                isFriend={false}
            />
            <ProfileButtonSection
                friends={profile.meetingCount}
                completedMeetings={profile.meetingCount}
                uncompletedMeetings={profile.meetingCount}
                challengeCount={profile.meetingCount}
            />
            <button
                className={`text-caption-regular text-gray-3 absolute bottom-${BOTTOM_NAVIGATION_HEIGHT} right-0 left-0`}
                onClick={() => {
                    logout()
                }}>
                로그아웃
            </button>
            <FriendInviteModal id="friend-invite-notify-modal" />
            <ProfileModal
                id="profile-notify-modal"
                likes={profile.likes.map(like => like.label)}
                dislikes={profile.dislikes.map(dislike => dislike.label)}
                allergies={profile.allergies.map(allergy => allergy.label)}
            />
        </main>
    )
}
