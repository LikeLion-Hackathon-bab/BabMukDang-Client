import { MyMealPlanCard } from './MyMealPlanCard'
import type { MealPlanCardView } from '@/viewModels'

export function MyMealPlanSection({
    title,
    description,
    mealPlans,
    emptyText
}: {
    title: string
    description?: string
    mealPlans: MealPlanCardView[]
    emptyText: string
}) {
    return (
        <section className="flex flex-col gap-12">
            <div className="flex flex-col gap-3">
                <h2 className="text-title2-semibold text-gray-8">{title}</h2>
                {description && (
                    <p className="text-caption-regular text-gray-5">
                        {description}
                    </p>
                )}
            </div>
            {mealPlans.length === 0 ? (
                <div className="rounded-20 bg-white p-18 text-caption-regular text-gray-5">
                    {emptyText}
                </div>
            ) : (
                <div className="flex flex-col gap-12">
                    {mealPlans.map(mealPlan => (
                        <MyMealPlanCard
                            key={mealPlan.mealPlanId}
                            mealPlan={mealPlan}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}
