import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
    MockLocalNewsNotis,
    MockMatchingInviteNotis
} from '@/constants/mockData'

import { useHeader } from '@/hooks'
import {
    TabHeader,
    FilterList,
    MatchingInviteList,
    LocalNewsList
} from '@/components'
import { LOCAL_NEWS_FILTER_LIST } from '@/constants/filters'

type MatchingInviteNoti = {
    id: number
    type: 'invitation' | 'announcement'
    title: string
    time: string
    message: string
    period: string
    imageUrl: string
}
interface LocalNewsNoti {
    id: number
    type: 'school' | 'restaurant' | 'area'
    title: string
    time: string
    message: string
    period: string
    imageUrl?: string
}
export function NotiStoragePage() {
    const navigate = useNavigate()

    // 헤더 관련
    const { resetHeader, setTitle, showCenterElement } = useHeader()
    const [tab, setTab] = useState<'noti' | 'local'>('noti')
    const tabs = [
        { key: 'noti', label: '알림' },
        { key: 'local', label: '동네소식' }
    ]
    useEffect(() => {
        showCenterElement()
        setTitle('알림')
        return () => {
            resetHeader()
        }
    }, [])

    const [matchingNotis, setMatchingNotis] = useState<MatchingInviteNoti[]>(
        MockMatchingInviteNotis as MatchingInviteNoti[]
    )

    const [localNewsNotis, setLocalNewsNotis] = useState<LocalNewsNoti[]>(
        MockLocalNewsNotis as LocalNewsNoti[]
    )

    const [activeFilter, setActiveFilter] = useState<{
        key: string
        label: string
    }>(LOCAL_NEWS_FILTER_LIST[0])

    // 삭제 핸들러들
    const handleDeleteMatchingNoti = (id: number) => {
        setMatchingNotis(prev => prev.filter(noti => noti.id !== id))
    }

    const handleDeleteLocalNewsNoti = (id: number) => {
        setLocalNewsNotis(prev => prev.filter(noti => noti.id !== id))
    }

    const handleMatchingInviteNotiClick = (
        type: 'invitation' | 'announcement'
    ) => {
        if (type === 'invitation') {
            navigate(`/invitation/waiting/${Math.floor(Math.random() * 10)}`)
        } else {
            navigate(`/announcement/waiting/${Math.floor(Math.random() * 10)}`)
        }
    }

    return (
        <div className="absolute top-0 left-0 flex h-full w-screen flex-col">
            <TabHeader
                tabs={tabs}
                activeTab={tab}
                onTabChange={tab => setTab(tab as 'noti' | 'local')}
            />
            {tab === 'noti' && (
                <MatchingInviteList
                    matchingNotis={matchingNotis}
                    handleDeleteMatchingNoti={handleDeleteMatchingNoti}
                    handleMatchingInviteNotiClick={
                        handleMatchingInviteNotiClick
                    }
                />
            )}
            {tab === 'local' && (
                <>
                    <FilterList
                        filterList={LOCAL_NEWS_FILTER_LIST}
                        activeFilter={activeFilter}
                        setActiveFilter={setActiveFilter}
                        className="my-16 ml-18"
                    />
                    <LocalNewsList
                        localNewsNotis={localNewsNotis.filter(
                            noti =>
                                noti.type ===
                                (activeFilter.key as
                                    | 'school'
                                    | 'restaurant'
                                    | 'area')
                        )}
                        handleDeleteLocalNewsNoti={handleDeleteLocalNewsNoti}
                    />
                </>
            )}
        </div>
    )
}
