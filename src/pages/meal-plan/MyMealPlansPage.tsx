import { useMemo, useState } from 'react'
import { FilterList, MealPlanCreateSheet, MyMealPlanCard } from '@/components'
import { useMyMealPlanCards } from '@/apis'
import { usePageChrome } from '@/hooks/usePageChrome'
import type { MealPlanCardView } from '@/viewModels'

type MyMealPlanSegmentKey = 'deciding' | 'upcoming' | 'recordNeeded' | 'past'
type MyMealPlanGroups = Record<MyMealPlanSegmentKey, MealPlanCardView[]>

const emptyGroups: MyMealPlanGroups = {
    deciding: [],
    upcoming: [],
    recordNeeded: [],
    past: []
}

const segments: Array<{
    key: MyMealPlanSegmentKey
    label: string
    emptyText: string
}> = [
    {
        key: 'deciding',
        label: '정하는중',
        emptyText: '정하는 중인 밥약이 없습니다.'
    },
    { key: 'upcoming', label: '예정', emptyText: '예정된 밥약이 없습니다.' },
    {
        key: 'recordNeeded',
        label: '기록필요',
        emptyText: '기록이 필요한 밥약이 없습니다.'
    },
    { key: 'past', label: '지난', emptyText: '지난 밥약이 없습니다.' }
]

export function MyMealPlansPage() {
    const [activeSegment, setActiveSegment] =
        useState<MyMealPlanSegmentKey>('deciding')
    const { data, isLoading, error } = useMyMealPlanCards()
    const rawGroups = data as Partial<MyMealPlanGroups> | undefined
    const groups: MyMealPlanGroups = {
        deciding: rawGroups?.deciding ?? [],
        upcoming: rawGroups?.upcoming ?? [],
        recordNeeded: rawGroups?.recordNeeded ?? [],
        past: rawGroups?.past ?? []
    }
    const activePlans = groups[activeSegment]
    const pageChromeConfig = useMemo(
        () => ({
            header: {
                title: '내 밥약',
                showLeftButton: false,
                showRightButton: true
            }
        }),
        []
    )

    usePageChrome(pageChromeConfig)

    return (
        <div className="flex flex-col gap-20">
            <MyMealPlansTab
                groups={groups}
                activeSegment={activeSegment}
                activePlans={activePlans}
                isLoading={isLoading}
                error={error}
                onChangeSegment={setActiveSegment}
            />

            <MealPlanCreateSheet
                open={false}
                onClose={() => undefined}
                persistent
            />
        </div>
    )
}

function MyMealPlansTab({
    groups,
    activeSegment,
    activePlans,
    isLoading,
    error,
    onChangeSegment
}: {
    groups: MyMealPlanGroups
    activeSegment: MyMealPlanSegmentKey
    activePlans: MealPlanCardView[]
    isLoading: boolean
    error: unknown
    onChangeSegment: (segment: MyMealPlanSegmentKey) => void
}) {
    const activeSegmentMeta = segments.find(
        segment => segment.key === activeSegment
    )
    const segmentFilters = segments.map(segment => {
        const count = groups[segment.key].length
        return {
            key: segment.key,
            label: count > 0 ? `${segment.label} ${count}` : segment.label
        }
    })
    const activeFilter =
        segmentFilters.find(filter => filter.key === activeSegment) ??
        segmentFilters[0]

    return (
        <>
            <FilterList
                filterList={segmentFilters}
                activeFilter={activeFilter}
                setActiveFilter={filter =>
                    onChangeSegment(filter.key as MyMealPlanSegmentKey)
                }
                className="overflow-x-auto pb-2"
            />

            {isLoading ? (
                <div className="rounded-20 text-caption-regular text-gray-5 bg-white p-18">
                    내 밥약을 불러오는 중입니다.
                </div>
            ) : error ? (
                <div className="rounded-20 text-caption-regular bg-white p-18 text-red-500">
                    내 밥약을 불러오지 못했습니다.
                </div>
            ) : (
                <section className="flex flex-col gap-12">
                    <h2 className="text-title2-semibold text-gray-8">
                        {activeSegmentMeta?.label}
                    </h2>
                    {activePlans.length === 0 ? (
                        <div className="rounded-20 text-caption-regular text-gray-5 bg-white p-18">
                            {activeSegmentMeta?.emptyText}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-12">
                            {activePlans.map(mealPlan => (
                                <MyMealPlanCard
                                    key={mealPlan.mealPlanId}
                                    mealPlan={mealPlan}
                                />
                            ))}
                        </div>
                    )}
                </section>
            )}
        </>
    )
}
