import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { BOTTOM_NAVIGATION_HEIGHT } from '@/constants/bottomNav'
import { MockMyProfileData } from '@/constants/mockData'

import { useHeader } from '@/hooks'
import {
    ProfileModal,
    ProfileSection,
    FriendProfileSection
} from '@/components'

export function FriendProfilePage() {
    const navigate = useNavigate()
    return (
        <main className="relative h-full min-h-full">
            {/* 프로필 섹션 */}
            <ProfileSection
                profileImgUrl={MockMyProfileData.profileImageUrl}
                name={MockMyProfileData.userName}
                description={MockMyProfileData.bio}
                likes={MockMyProfileData.likes.map(like => like.label)}
                dislikes={MockMyProfileData.dislikes.map(
                    dislike => dislike.label
                )}
                allergies={MockMyProfileData.allergies.map(
                    allergy => allergy.label
                )}
                isFriend={true}
            />
            <FriendProfileSection
                friends={MockMyProfileData.meetingCount}
                completedMeetings={MockMyProfileData.meetingCount}
                uncompletedMeetings={MockMyProfileData.meetingCount}
            />
            <ProfileModal
                id="profile-notify-modal"
                likes={MockMyProfileData.likes.map(like => like.label)}
                dislikes={MockMyProfileData.dislikes.map(
                    dislike => dislike.label
                )}
                allergies={MockMyProfileData.allergies.map(
                    allergy => allergy.label
                )}
            />
        </main>
    )
}
