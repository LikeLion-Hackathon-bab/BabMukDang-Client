import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
    TabHeader,
    FilterList,
    MealPlanNotificationList,
    LocalNewsList
} from '@/components'
import { LOCAL_NEWS_FILTER_LIST } from '@/constants/filters'
import { useHeaderStore, useNotificationStore } from '@/store'
import {
    notificationApi,
    useDeleteNotification,
    useGetNotifications
} from '@/apis/notification.api'
import type { MealPlanNotificationView } from '@/viewModels'
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
    }, [showCenterElement, setTitle, resetHeader])

    const [localNewsNotis, setLocalNewsNotis] = useState<LocalNewsNoti[]>([])
    const [activeFilter, setActiveFilter] = useState<{
        key: string
        label: string
    }>(LOCAL_NEWS_FILTER_LIST[0])

    const mealPlanNotifications: MealPlanNotificationView[] = notifications.map(
        notification => ({
            ...notification,
            createdAtLabel: formatNotificationTime(notification.createdAt)
        })
    )

    const handleDeleteMealPlanNotification = async (id: string) => {
        await deleteNotification(id)
        removeNotification(id)
    }

    const handleDeleteLocalNewsNoti = (id: number) => {
        setLocalNewsNotis(prev => prev.filter(noti => noti.id !== id))
    }

    const handleMealPlanNotificationClick = async (
        notification: MealPlanNotificationView
    ) => {
        const readNotification = await notificationApi.markRead(
            notification.notificationId
        )
        markRead(readNotification)
        navigate(notification.deepLink)
    }

    return (
        <div className="absolute top-0 left-0 flex h-full w-screen flex-col">
            <TabHeader
                tabs={tabs}
                activeTab={tab}
                onTabChange={tab => setTab(tab as 'noti' | 'local')}
            />
            {tab === 'noti' && (
                <MealPlanNotificationList
                    notifications={mealPlanNotifications}
                    onDeleteNotification={handleDeleteMealPlanNotification}
                    onNotificationClick={handleMealPlanNotificationClick}
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
