import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
    MealGroupHistoryList,
    MealGroupMemberManager,
    MealGroupStartMealPlanButton
} from '@/components/features/meal-group'
import {
    useMealGroupDetail,
    useMealGroupHistory,
    useMealGroupPreferences
} from '@/apis'
import { useHeaderStore } from '@/store'

export function MealGroupDetailPage() {
    const { mealGroupId = '' } = useParams<{ mealGroupId: string }>()
    const { data, isLoading, error } = useMealGroupDetail(mealGroupId, {
        enabled: Boolean(mealGroupId)
    })
    const { data: history = [] } = useMealGroupHistory(mealGroupId, {
        enabled: Boolean(mealGroupId)
    })
    const { data: preferences } = useMealGroupPreferences(mealGroupId, {
        enabled: Boolean(mealGroupId)
    })
    const { setTitle, resetHeader } = useHeaderStore()

    useEffect(() => {
        setTitle('MealGroup')
        return () => resetHeader()
    }, [setTitle, resetHeader])

    if (isLoading) return <div className="py-40 text-center text-gray-5">불러오는 중입니다.</div>
    if (error || !data) return <div className="py-40 text-center text-red-500">MealGroup을 불러오지 못했습니다.</div>

    return (
        <div className="flex flex-col gap-20 py-20">
            <section className="rounded-24 bg-primary-100 border-primary-300 border p-18">
                <h1 className="text-title2-semibold text-gray-8">{data.name}</h1>
                <p className="text-body2-medium text-gray-6">
                    멤버 {data.members.length}명 · 최근 밥약 {data.recentMealPlanIds.length}개
                </p>
            </section>
            <MealGroupMemberManager mealGroup={data} />
            <MealGroupStartMealPlanButton
                mealGroupId={mealGroupId}
                defaultTitle={`${data.name} 밥약`}
            />
            {preferences && (
                <section className="rounded-20 flex flex-col gap-10 bg-white p-16">
                    <h2 className="text-body1-semibold text-gray-8">그룹 취향 요약</h2>
                    <p className="text-caption-regular text-gray-5">
                        자주 먹은 메뉴: {preferences.frequentMenuCategories.map(item => `${item.label} ${item.count}회`).join(', ') || '아직 없습니다.'}
                    </p>
                    <p className="text-caption-regular text-gray-5">
                        자주 간 식당: {preferences.frequentRestaurants.map(item => `${item.restaurantName} ${item.count}회`).join(', ') || '아직 없습니다.'}
                    </p>
                    <p className="text-caption-regular text-gray-5">
                        추천 후보: {preferences.recommendationContext.candidateMenuCategories.join(', ') || '히스토리가 쌓이면 자동 반영됩니다.'}
                    </p>
                </section>
            )}
            <MealGroupHistoryList history={history} />
        </div>
    )
}
