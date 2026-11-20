import { useSearchParams } from '@/navigation'

import {
    ProfileModal,
    ProfileSection,
    FriendProfileSection
} from '@/components'
import { useGetMemberProfileDetail } from '@/apis'

export function FriendProfilePage() {
    const [searchParams] = useSearchParams()
    const memberId = Number(searchParams.get('memberId'))
    const canLoadMember = Number.isFinite(memberId) && memberId > 0
    const { data: profile } = useGetMemberProfileDetail(memberId, {
        enabled: canLoadMember
    })

    return (
        <main className="relative h-full min-h-full">
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
                        isFriend={true}
                    />
                    <FriendProfileSection
                        friends={profile.friendConunt}
                        completedMeetings={profile.completedPlans}
                        uncompletedMeetings={profile.uncompletedPlans}
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
                        친구 프로필을 불러올 수 없습니다.
                    </span>
                </div>
            )}
        </main>
    )
}
