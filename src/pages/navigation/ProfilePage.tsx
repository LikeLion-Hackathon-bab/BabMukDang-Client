import { useEffect, useMemo } from 'react'

import { ProfileModal, ProfileButtonSection, ProfileSection } from '@/components'
import {
    useGetMemberProfile,
    useGetMemberProfileDetail,
    useGetMyPreference,
    useLogout
} from '@/apis'
import { useAuthStore, useHeaderStore } from '@/store'
import { useNavigate } from 'react-router-dom'

export function ProfilePage() {
    const { hideHeader, resetHeader } = useHeaderStore()
    const { userId } = useAuthStore()
    const navigate = useNavigate()
    const currentMemberId = Number(userId)
    const canLoadMember = Number.isFinite(currentMemberId) && currentMemberId > 0
    const { data: profileSummary } = useGetMemberProfile(currentMemberId, {
        enabled: canLoadMember
    })
    const { data: profileData } = useGetMemberProfileDetail(currentMemberId, {
        enabled: canLoadMember
    })
    const { data: preferenceData } = useGetMyPreference()
    const { mutate: logout, isPending: isLogoutPending } = useLogout({
        onSuccess: () => {
            navigate('/login', { replace: true })
        }
    })
    const profile = useMemo(() => {
        if (!profileData) return null

        return {
            ...profileData,
            userName: profileSummary?.userName ?? profileData.userName,
            username: profileSummary?.username ?? profileData.username,
            profileImageUrl:
                profileSummary?.profileImageUrl ?? profileData.profileImageUrl,
            likes: preferenceData?.liked ?? profileData.likes,
            dislikes: preferenceData?.disliked ?? profileData.dislikes,
            allergies: preferenceData?.allergy ?? profileData.allergies
        }
    }, [preferenceData, profileData, profileSummary])

    useEffect(() => {
        hideHeader()
        return () => {
            resetHeader()
        }
    }, [])

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
            {profile ? (
                <>
                    {/* 프로필 섹션 */}
                    <ProfileSection
                        profileImgUrl={profile.profileImageUrl}
                        name={profile.userName}
                        description={profile.bio}
                        likes={profile.likes.map(like => like.label)}
                        dislikes={profile.dislikes.map(
                            dislike => dislike.label
                        )}
                        allergies={profile.allergies.map(
                            allergy => allergy.label
                        )}
                        isFriend={false}
                    />
                    <ProfileButtonSection
                        friends={profile.friendConunt}
                        completedMeetings={profile.completedPlans}
                        uncompletedMeetings={profile.uncompletedPlans}
                        challengeCount={profile.meetingCount}
                    />
                    <ProfileModal
                        id="profile-notify-modal"
                        likes={profile.likes.map(like => like.label)}
                        dislikes={profile.dislikes.map(
                            dislike => dislike.label
                        )}
                        allergies={profile.allergies.map(
                            allergy => allergy.label
                        )}
                    />
                </>
            ) : (
                <div className="flex h-full items-center justify-center">
                    <span className="text-caption-regular text-gray-5">
                        프로필을 불러오는 중입니다.
                    </span>
                </div>
            )}
        </main>
    )
}
