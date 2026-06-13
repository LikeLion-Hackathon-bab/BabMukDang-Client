import { useEffect, useState } from 'react'

import type { RecruitCardView } from '@/viewModels'
import {
    TabHeader,
    RecruitCarousel,
    RecieveInvitationList,
    RecruitBottomSheet,
    InviteButton
} from '@/components'
import { BOTTOM_NAVIGATION_HEIGHT } from '@/constants/bottomNav'
import { useGetRecruits, useGetInvitations, useJoinRecruit } from '@/apis'
import { useAuthStore, useHeaderStore } from '@/store'

export function MatchingPage() {
    const [activeTab, setActiveTab] = useState<'recruit' | 'invitation'>(
        'recruit'
    )
    const { resetHeader, setTitle, showCenterElement, hideLeftButton } =
        useHeaderStore()

    const tabs = [
        { key: 'recruit', label: '공고' },
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
                    setActiveTab(tab as 'recruit' | 'invitation')
                }
            />
            {activeTab === 'recruit' ? <RecruitTab /> : <InvitationTab />}
        </div>
    )
}
function RecruitTab() {
    const [recruits, setRecruits] = useState<RecruitCardView[]>([])
    const { userId } = useAuthStore()
    const [myRecruits, setMyRecruits] = useState<RecruitCardView | null>(null)
    const { data: recruitsData } = useGetRecruits()
    const { mutate: joinRecruit } = useJoinRecruit({
        onSuccess: () => {
            console.log('announcement 참여하기가 완료되었습니다')
        },
        onError: (error: Error) => {
            console.log(error)
        }
    })
    useEffect(() => {
        console.log('recruitsData', recruitsData)
        setMyRecruits(
            recruitsData?.find(
                recruit => recruit.author.authorId === Number(userId)
            ) || null
        )
        console.log('myRecruits', myRecruits, userId)
        setRecruits(recruitsData || [])
    }, [recruitsData, userId])
    return (
        <div className="bg-primary-100 flex h-full flex-col justify-center pb-90">
            <div className="flex flex-1 flex-col gap-16 pt-20 pb-90">
                <RecruitCarousel
                    recruits={recruits}
                    currentUserId={userId}
                    onJoinRecruit={joinRecruit}
                />
                <RecruitBottomSheet
                    isAdd={myRecruits === null}
                    myRecruit={myRecruits || null}
                />
            </div>
        </div>
    )
}

function InvitationTab() {
    const { data: invitations, isLoading } = useGetInvitations()

    return (
        <div
            className={`flex flex-col gap-40 px-20 pt-18 pb-${BOTTOM_NAVIGATION_HEIGHT}`}>
            {/* 식사 상태 토글 버튼 */}
            <div className="flex flex-col gap-16">
                <InviteButton />
                <RecieveInvitationList invitations={invitations || []} />
                {isLoading && (
                    <span className="text-caption-regular text-gray-5">
                        초대장을 불러오는 중입니다.
                    </span>
                )}
            </div>
        </div>
    )
}
