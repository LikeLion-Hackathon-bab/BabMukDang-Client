import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { MockLocalNewsNotis } from '@/constants/mockData'

import {
    TabHeader,
    FilterList,
    MatchingInviteList,
    LocalNewsList
} from '@/components'
import { LOCAL_NEWS_FILTER_LIST } from '@/constants/filters'
import { useHeaderStore, useNotificationStore } from '@/store'
import { notificationApi } from '@/apis/notification.api'

type MatchingInviteNoti = {
    id: string
    type: 'invitation' | 'recruit'
    title: string
    time: string
    message: string
    period: string
    imageUrl: string
    roomId: string
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
    const notifications = useNotificationStore(state => state.notifications)
    const removeNotification = useNotificationStore(
        state => state.removeNotification
    )
    const markRead = useNotificationStore(state => state.markRead)

    // 헤더 관련
    const { resetHeader, setTitle, showCenterElement } = useHeaderStore()
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

    const [localNewsNotis, setLocalNewsNotis] = useState<LocalNewsNoti[]>(
        MockLocalNewsNotis as LocalNewsNoti[]
    )

    const [activeFilter, setActiveFilter] = useState<{
        key: string
        label: string
    }>(LOCAL_NEWS_FILTER_LIST[0])

    // 삭제 핸들러들
    const matchingNotis: MatchingInviteNoti[] = notifications.map(
        notification => ({
            id: notification.notificationId,
            type:
                notification.roomType === 'invitation'
                    ? 'invitation'
                    : 'recruit',
            title: notification.title,
            time: formatNotificationTime(notification.createdAt),
            message: notification.message,
            period: '',
            imageUrl: '',
            roomId: notification.roomId
        })
    )

    const handleDeleteMatchingNoti = async (id: string) => {
        await notificationApi.delete(id)
        removeNotification(id)
    }

    const handleDeleteLocalNewsNoti = (id: number) => {
        setLocalNewsNotis(prev => prev.filter(noti => noti.id !== id))
    }

    const handleMatchingInviteNotiClick = async (noti: MatchingInviteNoti) => {
        const notification = await notificationApi.markRead(noti.id)
        markRead(notification)
        const access = await notificationApi.accessRoom(noti.roomId)
        navigate(`/${access.roomType}/${access.stage}/${access.roomId}`)
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

const formatNotificationTime = (createdAt: string) => {
    const diffMs = Date.now() - new Date(createdAt).getTime()
    const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))

    if (diffMinutes < 1) return '방금 전'
    if (diffMinutes < 60) return `${diffMinutes}분 전`

    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}시간 전`

    return `${Math.floor(diffHours / 24)}일 전`
}
