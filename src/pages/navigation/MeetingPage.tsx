import { useEffect, useState } from 'react'

import { useHeader } from '@/hooks'
import { FilterList, MeetingCard, MeetingHeader } from '@/components'
import { MEETING_FILTER_LIST } from '@/constants/filters'
import { useGetMeetings } from '@/query/meetingQuery'
import { useQuery } from '@tanstack/react-query'
import { getMeeting } from '@/apis/meeting'

import { useAuthStore } from '@/store'

export function MeetingPage() {
    const { resetHeader, hideHeader } = useHeader()
    const { data: meetings, isLoading, error, refetch } = useGetMeetings()
    const [activeFilter, setActiveFilter] = useState<{
        key: string
        label: string
    }>(MEETING_FILTER_LIST[0])
    const [selected, setSelected] = useState<number | null>(null)
    const userId = useAuthStore(state => state.userId)
    const detail = useQuery({
        queryKey: ['meeting-detail', userId, selected],
        queryFn: () => getMeeting(selected!),
        enabled: Boolean(userId) && selected !== null
    })
    const meetingList = meetings ?? []
    useEffect(() => {
        hideHeader()
        return () => {
            resetHeader()
        }
    }, [])
    if (selected !== null)
        return (
            <main className="p-20">
                <button onClick={() => setSelected(null)}>밥약 목록으로</button>
                <h1>밥약 상세</h1>
                {detail.isLoading && <p>불러오는 중…</p>}
                {detail.isError && (
                    <button onClick={() => detail.refetch()}>
                        상세 다시 불러오기
                    </button>
                )}
                {detail.data && (
                    <>
                        <h2>{detail.data.restaurant}</h2>
                        <p>
                            {detail.data.location} · {detail.data.time}
                        </p>
                        <p>
                            {detail.data.participants
                                .map(person => person.name)
                                .join(', ')}
                        </p>
                    </>
                )}
            </main>
        )
    if (isLoading) return <p>밥약을 불러오는 중…</p>
    if (error)
        return <button onClick={() => refetch()}>밥약 다시 불러오기</button>
    if (!meetingList.length) return <p>아직 확정된 밥약이 없어요.</p>
    return (
        <div className="flex w-full flex-1 flex-col items-center gap-16 pt-303">
            {/* MeetingHeader */}
            <MeetingHeader meeting={meetingList[0]} />

            <FilterList
                filterList={MEETING_FILTER_LIST}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                className="self-start"
            />

            <div className="flex w-full flex-col gap-16">
                {(meetingList || [])
                    .filter(
                        meeting =>
                            (activeFilter.key === 'recent' &&
                                !meeting.isCompleted) ||
                            (activeFilter.key === 'past' && meeting.isCompleted)
                    )
                    .map(meeting => (
                        <MeetingCard
                            key={meeting.id}
                            meeting={meeting}
                            onClick={() => {
                                setSelected(meeting.id)
                            }}
                        />
                    ))}
            </div>
        </div>
    )
}
