import { useEffect, useState } from 'react'

import { Post, PostResponse } from '@/apis'

import { useHeader } from '@/hooks'
import {
    TabHeader,
    JoinCompleteModal,
    AnnouncementCarousel,
    RecieveInvitationList,
    AnnouncementBottomSheet,
    InviteButton,
    LongTimeNoSeeFriendList
} from '@/components'
import { BOTTOM_NAVIGATION_HEIGHT } from '@/constants/bottomNav'
import {
    useGetAnnouncements,
    useSubscribeAnnouncement,
    useGetInvitations,
    useFriendMeals
} from '@/apis'
import { useAuthStore } from '@/store'
import { HungryFriendList } from '@/components/features/matching/announcement/HungryFriendList'
import { Friend } from '@/components/features/friend/FriendListSection'

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
// TODO: fixture 제거
const hungryFriendFixture: Friend[] = [
    {
        memberId: 1,
        userName: '김철수',
        profileImageUrl: 'https://via.placeholder.com/150',
        hungry: true,
        label: '밥먹고 싶어요'
    },
    {
        memberId: 2,
        userName: '이영희',
        profileImageUrl: 'https://via.placeholder.com/150',
        hungry: false,
        label: '밥먹고 싶어요'
    },
    {
        memberId: 3,
        userName: '박민수',
        profileImageUrl: 'https://via.placeholder.com/150',
        hungry: false,
        label: '밥먹고 싶어요'
    },
    {
        memberId: 3,
        userName: '박민수',
        profileImageUrl: 'https://via.placeholder.com/150',
        hungry: false,
        label: '밥먹고 싶어요'
    },
    {
        memberId: 3,
        userName: '박민수',
        profileImageUrl: 'https://via.placeholder.com/150',
        hungry: false,
        label: '밥먹고 싶어요'
    },
    {
        memberId: 3,
        userName: '박민수',
        profileImageUrl: 'https://via.placeholder.com/150',
        hungry: false,
        label: '밥먹고 싶어요'
    },
    {
        memberId: 3,
        userName: '박민수',
        profileImageUrl: 'https://via.placeholder.com/150',
        hungry: false,
        label: '밥먹고 싶어요'
    },
    {
        memberId: 3,
        userName: '박민수',
        profileImageUrl: 'https://via.placeholder.com/150',
        hungry: false,
        label: '밥먹고 싶어요'
    }
]

function AnnouncementTab() {
    const [announcements, setAnnouncements] = useState<PostResponse[]>([])
    const { userId } = useAuthStore()
    const [myAnnouncements, setMyAnnouncements] = useState<PostResponse | null>(
        null
    )
    const { data: announcementsData } = useGetAnnouncements()
    const [hungryFriendList, setHungryFriendList] =
        useState<Friend[]>(hungryFriendFixture)
    useEffect(() => {
        console.log('announcementsData', announcementsData)
        setMyAnnouncements(
            announcementsData?.find(
                announcement => announcement.author.authorId === Number(userId)
            ) || null
        )
        console.log('myAnnouncements', myAnnouncements, userId)
        setAnnouncements(announcementsData || [])
    }, [announcementsData, userId])
    return (
        <div className="bg-primary-100 flex h-full flex-col justify-center pb-90">
            <div className="flex flex-1 flex-col gap-16 pt-20 pb-90">
                {hungryFriendList.length > 0 && (
                    <div className="px-20">
                        <HungryFriendList hungryFriendList={hungryFriendList} />
                    </div>
                )}
                <AnnouncementCarousel announcements={announcements} />
                <AnnouncementBottomSheet
                    isAdd={myAnnouncements === null}
                    myAnnouncement={myAnnouncements || null}
                />
            </div>
        </div>
    )
}

// TODO: fixture 제거
const longTimeNoSeeFriendFixture = [
    {
        memberId: 1,
        userName: '김철수',
        profileImageUrl: 'https://via.placeholder.com/150',
        lastMeetingDate: '2025-12-18'
    },
    {
        memberId: 2,
        userName: '이영희',
        profileImageUrl: 'https://via.placeholder.com/150',
        lastMeetingDate: '2025-12-18'
    },
    {
        memberId: 3,
        userName: '박민수',
        profileImageUrl: 'https://via.placeholder.com/150',
        lastMeetingDate: '2025-12-18'
    }
]
function InvitationTab() {
    const { data: invitations } = useGetInvitations()
    const { data: friendMeals } = useFriendMeals()
    const longTimeNoSeeFriendList = longTimeNoSeeFriendFixture
    return (
        <div
            className={`flex flex-col gap-40 px-20 pt-18 pb-${BOTTOM_NAVIGATION_HEIGHT}`}>
            {/* 식사 상태 토글 버튼 */}
            <div className="flex flex-col gap-16">
                <InviteButton />
                <RecieveInvitationList invitations={invitations || []} />
                <LongTimeNoSeeFriendList
                    longTimeNoSeeFriendList={longTimeNoSeeFriendList}
                />
            </div>
        </div>
    )
}
