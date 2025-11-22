import { useEffect, useState } from 'react'

import { useHeader } from '@/hooks'
import { FilterList, MeetingCard, MeetingHeader } from '@/components'
import { MEETING_FILTER_LIST } from '@/constants/filters'
import { useGetMeetings } from '@/query/meetingQuery'
import { MockMeetingList } from '@/constants/mockData'
import { MeetingResponse } from '@/apis/meeting'

export function MeetingPage() {
    const { resetHeader, hideHeader } = useHeader()
    const { data: meetings, isLoading } = useGetMeetings()
    const [activeFilter, setActiveFilter] = useState<{
        key: string
        label: string
    }>(MEETING_FILTER_LIST[0])
    const [meetingList, setMeetingList] =
        useState<MeetingResponse[]>(MockMeetingList)
    useEffect(() => {
        if (meetings?.length) {
            setMeetingList(meetings)
        }
    }, [meetings])
    useEffect(() => {
        hideHeader()
        hideHeader()
        return () => {
            resetHeader()
        }
    }, [])
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
                    .map((meeting, idx) => (
                        <MeetingCard
                            key={idx}
                            meeting={meeting}
                            onClick={() => {
                                console.log('clicked')
                            }}
                        />
                    ))}
            </div>
        </div>
    )
}
