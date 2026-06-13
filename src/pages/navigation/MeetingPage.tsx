import { useEffect, useMemo, useState } from 'react'

import { FilterList, MeetingCard, MeetingHeader } from '@/components'
import { MEETING_FILTER_LIST } from '@/constants/filters'
import { useCancelPlan, useGetPlanDetail, useGetPlans } from '@/apis'
import { mapMeeting } from '@/apis/mappers/meeting.mapper'
import { useHeaderStore } from '@/store'

export function MeetingPage() {
    const { resetHeader, hideHeader } = useHeaderStore()
    const { data: plans, isLoading } = useGetPlans()
    const [selectedPlanId, setSelectedPlanId] = useState<number>(0)
    const { data: selectedPlanDetail } = useGetPlanDetail(selectedPlanId, {
        enabled: selectedPlanId > 0
    })
    const { mutate: cancelPlan } = useCancelPlan({
        onSuccess: () => {
            setSelectedPlanId(0)
        }
    })
    const [activeFilter, setActiveFilter] = useState<{
        key: string
        label: string
    }>(MEETING_FILTER_LIST[0])
    const meetingList = useMemo(() => (plans ?? []).map(mapMeeting), [plans])
    const selectedMeeting = selectedPlanDetail
        ? mapMeeting(selectedPlanDetail)
        : meetingList[0]

    useEffect(() => {
        hideHeader()
        return () => {
            resetHeader()
        }
    }, [])
    return (
        <div className="flex w-full flex-1 flex-col items-center gap-16 pt-303">
            {/* MeetingHeader */}
            {selectedMeeting && <MeetingHeader meeting={selectedMeeting} />}

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
                            key={meeting.id}
                            meeting={meeting}
                            onClick={() => {
                                setSelectedPlanId(meeting.id)
                            }}
                            onCancel={() => cancelPlan({ planId: meeting.id })}
                        />
                    ))}
                {isLoading && (
                    <span className="text-caption-regular text-gray-5">
                        약속을 불러오는 중입니다.
                    </span>
                )}
                {!isLoading && meetingList.length === 0 && (
                    <span className="text-caption-regular text-gray-5">
                        표시할 약속이 없습니다.
                    </span>
                )}
            </div>
        </div>
    )
}
