import { useEffect, useState } from 'react'

import { useHeader } from '@/hooks'
import { FilterList, MeetingCard, MeetingHeader } from '@/components'
import { MEETING_FILTER_LIST } from '@/constants/filters'
import { useGetCompletedPlans } from '@/query/planQuery'

export function MeetingPage() {
    const { resetHeader, hideHeader } = useHeader()
    const { data: completedPlans, isLoading } = useGetCompletedPlans()
    const [activeFilter, setActiveFilter] = useState<{
        key: string
        label: string
    }>(MEETING_FILTER_LIST[0])

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
            {!isLoading && completedPlans && completedPlans.length > 0 && (
                <MeetingHeader meeting={completedPlans?.[0]} />
            )}

            <FilterList
                filterList={MEETING_FILTER_LIST}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                className="self-start"
            />

            <div className="flex w-full flex-col gap-16">
                {(completedPlans || [])
                    .filter(
                        plan =>
                            (activeFilter.key === 'recent' &&
                                !plan.isCompleted) ||
                            (activeFilter.key === 'past' && plan.isCompleted)
                    )
                    .map((plan, idx) => (
                        <MeetingCard
                            key={idx}
                            meeting={plan}
                            onClick={() => {
                                console.log('clicked')
                            }}
                        />
                    ))}
            </div>
        </div>
    )
}
