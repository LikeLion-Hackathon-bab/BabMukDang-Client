import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStartMealPlanFromGroup } from '@/apis'

export function MealGroupStartMealPlanButton({
    mealGroupId,
    defaultTitle
}: {
    mealGroupId: string
    defaultTitle?: string
}) {
    const navigate = useNavigate()
    const [title, setTitle] = useState(defaultTitle ?? '')
    const start = useStartMealPlanFromGroup({
        onSuccess: data => {
            if (data) navigate(`/meal-plans/${data.mealPlanId}`)
        }
    })

    return (
        <section className="rounded-20 flex flex-col gap-10 bg-white p-16">
            <h2 className="text-body1-semibold text-gray-8">이 그룹으로 새 밥약 시작</h2>
            <input
                data-testid="meal-group-start-title-input"
                value={title}
                onChange={event => setTitle(event.target.value)}
                className="rounded-14 border-gray-2 text-body2-medium border px-12 py-10"
                placeholder="밥약 제목"
            />
            <button
                type="button"
                data-testid="meal-group-start-button"
                disabled={start.isPending}
                onClick={() =>
                    start.mutate({
                        mealGroupId,
                        body: title.trim() ? { title: title.trim() } : {}
                    })
                }
                className="rounded-30 bg-gray-8 text-body1-semibold disabled:bg-gray-3 py-12 text-white">
                {start.isPending ? '시작 중입니다.' : '이 그룹으로 새 밥약 시작'}
            </button>
        </section>
    )
}
