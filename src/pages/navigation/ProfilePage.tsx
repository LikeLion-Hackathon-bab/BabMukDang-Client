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
import { useGetMyProfileDetail, } from '@/query'
import { ProfileDetailResponse } from '@/apis/profile'

export function ProfilePage() {
    const { hideHeader, resetHeader } = useHeader()
    const { data: profileData } = useGetMyProfileDetail()
    //TODO: Logout 구현
    // const { mutate: logout } = useLogout()
    const [profile, setProfile] = useState<ProfileDetailResponse>(
        profileData?.data ?? MockMyProfileData
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
                memberId: profileData.data.memberId,
                profileImageUrl: profileData.data.profileImageUrl,
                userName: profileData.data.userName,
                bio: profileData.data.bio,
                meetingCount: profileData.data.meetingCount,
                likes: profileData.data.likes,
                allergies: profileData.data.allergies,
                dislikes: profileData.data.dislikes
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
                    // logout()
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
