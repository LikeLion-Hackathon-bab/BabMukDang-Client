import { MealGroupCard } from '@/components/features/meal-group'
import { useMealGroups } from '@/apis'

export function MealGroupListPage() {
    const { data, isLoading, error } = useMealGroups()

    return (
        <div className="flex flex-col gap-20 py-20">
            <section className="rounded-20 bg-white p-16">
                <h1 className="text-title2-semibold text-gray-8">
                    반복 식사 그룹
                </h1>
                <p className="text-body2-medium text-gray-5">
                    MealGroup은 전체 개편 마지막 Phase에서 완성됩니다.
                </p>
            </section>
            {isLoading ? (
                <div className="text-caption-regular text-gray-5">
                    불러오는 중입니다.
                </div>
            ) : error ? (
                <div className="text-caption-regular text-red-500">
                    MealGroup을 불러오지 못했습니다.
                </div>
            ) : data?.length ? (
                data.map(group => (
                    <MealGroupCard
                        key={group.mealGroupId}
                        mealGroup={group}
                    />
                ))
            ) : (
                <div className="rounded-20 bg-white p-16 text-caption-regular text-gray-5">
                    아직 MealGroup이 없습니다.
                </div>
            )}
        </div>
    )
}
