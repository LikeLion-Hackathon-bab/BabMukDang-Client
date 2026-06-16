import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MyMealPlanSection } from '@/components/features/meal-plan'
import { useMyMealPlanCards } from '@/apis'
import { useHeaderStore } from '@/store'

const emptyGroups = {
    deciding: [],
    upcoming: [],
    recordNeeded: [],
    past: []
}

export function MyMealPlansPage() {
    const { hideLeftButton, setTitle, showRightButton, resetHeader } =
        useHeaderStore()
    const { data, isLoading, error } = useMyMealPlanCards()
    const groups = data ?? emptyGroups

    useEffect(() => {
        hideLeftButton()
        setTitle('내 밥약')
        showRightButton()
        return () => resetHeader()
    }, [hideLeftButton, setTitle, showRightButton, resetHeader])

    return (
        <div className="flex flex-col gap-24 py-20">
            <section className="rounded-24 bg-primary-100 border-primary-300 flex flex-col gap-14 border p-18">
                <div>
                    <h1 className="text-title2-semibold text-gray-8">
                        오늘의 밥약을 이어서 정해요.
                    </h1>
                    <p className="text-body2-medium text-gray-6">
                        정하는 중, 예정, 기록 필요 밥약을 한 곳에서 확인합니다.
                    </p>
                </div>
                <Link
                    to="/meal-plans/start"
                    className="rounded-30 bg-primary-main text-body1-semibold flex justify-center py-12 text-white">
                    오늘 뭐 먹지 시작
                </Link>
            </section>

            {isLoading ? (
                <div className="rounded-20 bg-white p-18 text-caption-regular text-gray-5">
                    내 밥약을 불러오는 중입니다.
                </div>
            ) : error ? (
                <div className="rounded-20 bg-white p-18 text-caption-regular text-red-500">
                    내 밥약을 불러오지 못했습니다.
                </div>
            ) : (
                <>
                    <MyMealPlanSection
                        title="정하는 중"
                        description="추천, 모집, 결정, Ready 상태의 밥약입니다."
                        mealPlans={groups.deciding}
                        emptyText="정하는 중인 밥약이 없습니다."
                    />
                    <MyMealPlanSection
                        title="예정"
                        description="확정되었거나 곧 만나는 밥약입니다."
                        mealPlans={groups.upcoming}
                        emptyText="예정된 밥약이 없습니다."
                    />
                    <MyMealPlanSection
                        title="기록 필요"
                        description="완료 후 기록을 기다리는 밥약입니다."
                        mealPlans={groups.recordNeeded}
                        emptyText="기록이 필요한 밥약이 없습니다."
                    />
                    <MyMealPlanSection
                        title="지난 밥약"
                        mealPlans={groups.past}
                        emptyText="지난 밥약이 없습니다."
                    />
                </>
            )}
        </div>
    )
}
