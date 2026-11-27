import { useQuery, useMutation } from '@tanstack/react-query'
import { client } from '@/apis/client'
import type { BaseResponse } from '@/apis/dto'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useHeader } from '@/hooks'
import { TabHeader, FilterList } from '@/components'
import { LOCAL_NEWS_FILTER_LIST } from '@/constants/filters'

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

    const entry = useMutation({
        mutationFn: async (id: number) => {
            await client.post(
                `${import.meta.env.VITE_BASE_API_URL}/meetings/rooms/${id}/enter`
            )
            return id
        },
        onSuccess: id => navigate('/announcement/waiting/' + id)
    })
    const rooms = useQuery({
        queryKey: ['waiting-rooms'],
        queryFn: async () =>
            (
                await client.get<
                    BaseResponse<{ id: number; location: string }[]>
                >(`${import.meta.env.VITE_BASE_API_URL}/meetings/rooms`)
            ).data.data,
        refetchInterval: 5000
    })
    const [activeFilter, setActiveFilter] = useState<{
        key: string
        label: string
    }>(LOCAL_NEWS_FILTER_LIST[0])

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
                    {rooms.isError && (
                        <button onClick={() => rooms.refetch()}>
                            알림 다시 불러오기
                        </button>
                    )}
                    {rooms.data?.length === 0 && (
                        <p>입장할 공고 대기실이 없어요.</p>
                    )}
                    {entry.isError && (
                        <p role="alert">
                            대기실을 열지 못했어요. 다시 눌러 주세요.
                        </p>
                    )}
                    {rooms.data?.map(room => (
                        <button
                            key={room.id}
                            className="rounded-12 bg-white p-16 text-left"
                            disabled={entry.isPending}
                            onClick={() => entry.mutate(room.id)}>
                            {room.location} 공고 대기실 입장
                        </button>
                    ))}
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
                    <p
                        className="px-20"
                        role="status">
                        {activeFilter.label}에 등록된 소식이 없어요.
                    </p>
                </>
            )}
        </div>
    )
}
