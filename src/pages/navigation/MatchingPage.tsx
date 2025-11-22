import { useEffect, useState } from 'react'

import { MockAnnouncements, MockFriendList } from '@/constants/mockData'
import { Post, PostResponse } from '@/apis/dto'

import { useHeader } from '@/hooks'
import {
    TabHeader,
    JoinCompleteModal,
    AnnouncementCarousel,
    InvitationToggleButton,
    RecieveInvitationList,
    AnnouncementBottomSheet,
    FriendListSection
} from '@/components'
import { BOTTOM_NAVIGATION_HEIGHT } from '@/constants/bottomNav'
import { useGetAnnouncements, useSubscribeAnnouncement } from '@/query'
import { useAuthStore } from '@/store'
import { useGetInvitations } from '@/query/invitationQuery'
import { useFriendMeals } from '@/query/friendsQuery'

export function MatchingPage() {
    const [activeTab, setActiveTab] = useState<'announcement' | 'invitation'>(
        'announcement'
    )
    const { resetHeader, setTitle, showCenterElement, hideLeftButton } =
        useHeader()

    const tabs = [
        { key: 'announcement', label: '공고' },
        { key: 'invitation', label: '초대장' }
    ]
    useEffect(() => {
        setTitle('매칭')
        showCenterElement()
        hideLeftButton()
        return () => {
            resetHeader()
        }
    }, [])

    return (
        <div className="absolute top-0 left-0 flex h-full w-screen flex-col">
            <TabHeader
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={tab =>
                    setActiveTab(tab as 'announcement' | 'invitation')
                }
            />
            {activeTab === 'announcement' ? (
                <AnnouncementTab />
            ) : (
                <InvitationTab />
            )}
        </div>
    )
}

function AnnouncementTab() {
    const [announcements, setAnnouncements] = useState<PostResponse[]>([])
    const { userId } = useAuthStore()
    const [myAnnouncements, setMyAnnouncements] = useState<PostResponse | null>(
        null
    )
    const { data: announcementsData } = useGetAnnouncements()
    useEffect(() => {
        console.log('announcementsData', announcementsData)
        setMyAnnouncements(
            announcementsData?.find(
                announcement => announcement.author.authorId === Number(userId)
            ) || null
        )
        console.log('myAnnouncements', myAnnouncements, userId)
        setAnnouncements(announcementsData || [])
    }, [])
    return (
        <div className="bg-primary-100 flex h-full flex-col justify-center pb-90">
            <div className="flex flex-1 flex-col justify-center pb-90">
                <AnnouncementCarousel announcements={announcements} />
                <AnnouncementBottomSheet
                    isAdd={myAnnouncements === null}
                    myAnnouncement={myAnnouncements || null}
                />
            </div>
        </div>
    )
}

function InvitationTab() {
    const { data: invitations } = useGetInvitations()
    const { data: friendMeals } = useFriendMeals()
    console.log('invitations', invitations)
    console.log('friendMeals', friendMeals)
    return (
        <div
            className={`flex flex-col gap-40 px-20 pt-18 pb-${BOTTOM_NAVIGATION_HEIGHT}`}>
            {/* 식사 상태 토글 버튼 */}
            <div className="flex flex-col gap-16">
                <InvitationToggleButton />
                <RecieveInvitationList invitations={invitations?.data || []} />
            </div>
            <div className="flex flex-col items-center justify-center pb-10">
                <FriendListSection friendList={friendMeals?.data || []} />
            </div>
        </div>
    )
}
