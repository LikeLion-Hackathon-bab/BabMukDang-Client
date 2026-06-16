import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNearbyFriendMealPlans } from '@/apis'
import { useHeaderStore } from '@/store'

export function MealMapPage() {
    const { hideLeftButton, setTitle, resetHeader } = useHeaderStore()
    const { data, isLoading, error } = useNearbyFriendMealPlans()

    useEffect(() => {
        hideLeftButton()
        setTitle('밥지도')
        return () => resetHeader()
    }, [hideLeftButton, setTitle, resetHeader])

    return (
        <div className="flex flex-col gap-20 py-20">
            <section className="rounded-24 bg-primary-100 border-primary-300 border p-18">
                <h1 className="text-title2-semibold text-gray-8">친구 기반 밥지도</h1>
                <p className="text-body2-medium text-gray-6">
                    공개 모집 지도가 아니라 친구의 MealPlan, 식당 후보, 친구 기록을 보여주는 지도입니다.
                </p>
            </section>
            <section className="flex flex-col gap-12">
                <h2 className="text-body1-semibold text-gray-8">근처 친구 밥약</h2>
                {isLoading ? (
                    <div className="rounded-20 bg-white p-16 text-caption-regular text-gray-5">
                        불러오는 중입니다.
                    </div>
                ) : error ? (
                    <div className="rounded-20 bg-white p-16 text-caption-regular text-red-500">
                        근처 친구 밥약을 불러오지 못했습니다.
                    </div>
                ) : data?.length ? (
                    <div className="flex flex-col gap-10">
                        {data.map(mealPlan => (
                            <Link
                                key={mealPlan.mealPlanId}
                                to={`/meal-plans/${mealPlan.mealPlanId}`}
                                className="rounded-20 bg-white p-16">
                                <span className="text-body1-semibold text-gray-8">
                                    {mealPlan.title}
                                </span>
                                <p className="text-caption-regular text-gray-5">
                                    {mealPlan.owner.username} · {mealPlan.distanceMeters}m
                                </p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-20 bg-white p-16 text-caption-regular text-gray-5">
                        현재 노출된 친구 밥약이 없습니다.
                    </div>
                )}
            </section>
        </div>
    )
}
