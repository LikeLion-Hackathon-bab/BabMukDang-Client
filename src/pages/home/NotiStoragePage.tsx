import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
    TabHeader,
    FilterList,
    MatchingInviteList,
    LocalNewsList
} from '@/components'
import { LOCAL_NEWS_FILTER_LIST } from '@/constants/filters'
import { useHeaderStore, useNotificationStore } from '@/store'
import {
    notificationApi,
    useDeleteNotification,
    useGetNotifications
} from '@/apis/notification.api'
import type { MatchingInviteNoti } from '@/viewModels'
import { formatRelativeKoreanTime } from '@/lib/dateTime'
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
    const { notifications, addNotification } = useNotificationStore()
    const removeNotification = useNotificationStore(
        state => state.removeNotification
    )
    const markRead = useNotificationStore(state => state.markRead)
    const { mutate: deleteNotification } = useDeleteNotification({
        onSuccess: () => {},
        onError: () => {}
    })
    const { data: fetchedNotifications } = useGetNotifications()

    useEffect(() => {
        if (fetchedNotifications) {
            fetchedNotifications.forEach(notification => {
                addNotification(notification)
            })
        }
    }, [addNotification, fetchedNotifications])

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

    const [localNewsNotis, setLocalNewsNotis] = useState<LocalNewsNoti[]>([])

    const [activeFilter, setActiveFilter] = useState<{
        key: string
        label: string
    }>(LOCAL_NEWS_FILTER_LIST[0])

    // 삭제 핸들러들
    const matchingNotis: MatchingInviteNoti[] = notifications.map(
        notification => ({
            notificationId: notification.notificationId,
            createdAt: formatNotificationTime(notification.createdAt),
            roomId: notification.roomId,
            roomType: notification.roomType,
            kind: notification.kind,
            title:
                notification.kind === 'invitation' ? '매칭 초대' : '매칭 모집',
            readAt: notification.readAt,
            message: notification.message
        })
    )

    const handleDeleteMatchingNoti = async (id: string) => {
        await deleteNotification(id)
        removeNotification(id)
    }

    const handleDeleteLocalNewsNoti = (id: number) => {
        setLocalNewsNotis(prev => prev.filter(noti => noti.id !== id))
    }

    const handleMatchingInviteNotiClick = async (noti: MatchingInviteNoti) => {
        const [notification, accessRoomData] = await Promise.all([
            notificationApi.markRead(noti.notificationId),
            notificationApi.accessRoom(noti.roomId)
        ])

        markRead(notification)

        navigate(
            `/${accessRoomData.roomType}/${accessRoomData.phase}/${accessRoomData.roomId}`
        )
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
    return formatRelativeKoreanTime(createdAt)
}
