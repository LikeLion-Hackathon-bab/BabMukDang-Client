import { useQuery } from '@tanstack/react-query'
import { client } from '@/apis/client'
import type { BaseResponse } from '@/apis/dto'
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
    LocalNewsList
} from '@/components'
import { LOCAL_NEWS_FILTER_LIST } from '@/constants/filters'

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

    const rooms = useQuery({
        queryKey: ['waiting-rooms'],
        queryFn: async () => (await client.get<BaseResponse<{id: number; location: string}[]>>(
            `${import.meta.env.VITE_BASE_API_URL}/meetings/rooms`
        )).data.data,
        refetchInterval: 5000
    })
    const [localNewsNotis, setLocalNewsNotis] = useState<LocalNewsNoti[]>(
        MockLocalNewsNotis as LocalNewsNoti[]
    )

    const [activeFilter, setActiveFilter] = useState<{
        key: string
        label: string
    }>(LOCAL_NEWS_FILTER_LIST[0])

    // 삭제 핸들러들
    const handleDeleteLocalNewsNoti = (id: number) => {
        setLocalNewsNotis(prev => prev.filter(noti => noti.id !== id))
    }

    return (
        <div className="absolute top-0 left-0 flex h-full w-screen flex-col">
            <TabHeader
                tabs={tabs}
                activeTab={tab}
                onTabChange={tab => setTab(tab as 'noti' | 'local')}
            />
            {tab === 'noti' && (
                <div className="flex flex-col gap-12 px-20">
                    {rooms.isLoading && <p>알림을 불러오는 중…</p>}
                    {rooms.isError && <button onClick={() => rooms.refetch()}>알림 다시 불러오기</button>}
                    {rooms.data?.length === 0 && <p>입장할 공고 대기실이 없어요.</p>}
                    {rooms.data?.map(room => <button key={room.id} className="rounded-12 bg-white p-16 text-left"
                        onClick={() => navigate('/announcement/waiting/' + room.id)}>
                        {room.location} 공고 대기실 입장
                    </button>)}
                </div>
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
