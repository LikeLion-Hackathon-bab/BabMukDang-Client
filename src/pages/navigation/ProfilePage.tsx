import { useEffect, useState } from 'react'

import { BOTTOM_NAVIGATION_HEIGHT } from '@/constants/bottomNav'
import { MockMyProfileData } from '@/constants/mockData'

import {
    FriendInviteModal,
    ProfileModal,
    ProfileButtonSection,
    ProfileSection
} from '@/components'
import { useGetMyProfileDetail, ProfileDetailResponse, useLogout } from '@/apis'
import { useHeaderStore } from '@/store'
import { useNavigate } from 'react-router-dom'

export function ProfilePage() {
    const { hideHeader, resetHeader } = useHeaderStore()
    const navigate = useNavigate()
    const { data: profileData } = useGetMyProfileDetail()
    const { mutate: logout, isPending: isLogoutPending } = useLogout({
        onSuccess: () => {
            navigate('/login', { replace: true })
        }
    })
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
            setProfile(profileData)
        }
    }, [profileData])
    return (
        <main className="relative h-full min-h-full">
            <button
                className={`text-caption-regular text-black`}
                disabled={isLogoutPending}
                onClick={() => {
                    logout()
                }}>
                {isLogoutPending ? '로그아웃 중입니다' : '로그아웃'}
            </button>
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
