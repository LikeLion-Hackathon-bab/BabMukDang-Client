import { useState } from 'react'
import { useNavigate } from '@/navigation'
import { useCreateMealGroup } from '@/apis'
import type { MealPlanResponse } from '@kimdaegyu/babmukdang-shared/domain'

export function MealGroupCreateFromMealPlanButton({
    mealPlan
}: {
    mealPlan: MealPlanResponse
}) {
    const navigate = useNavigate()
    const [name, setName] = useState(() => `${mealPlan.title ?? '밥약'} 멤버`)
    const memberIds = mealPlan.participants
        .filter(participant => ['JOINED', 'READY'].includes(participant.status))
        .map(participant => participant.member?.memberId)
        .filter((memberId): memberId is NonNullable<typeof memberId> => typeof memberId === 'number')
        .map(memberId => Number(memberId))
    const canCreate = mealPlan.status === 'RECORDED' && memberIds.length > 0
    const createGroup = useCreateMealGroup({
        onSuccess: group => {
            if (group) navigate(`/meal-groups/${group.mealGroupId}`)
        }
    })

    if (!canCreate) return null

    return (
        <section className="rounded-20 flex flex-col gap-12 bg-white p-16">
            <div>
                <h2 className="text-body1-semibold text-gray-8">
                    이 멤버로 MealGroup 만들기
                </h2>
                <p className="text-caption-regular mt-4 text-gray-5">
                    기록된 밥약 참여자 묶음을 반복 식사 그룹으로 저장합니다.
                </p>
            </div>
            <input
                value={name}
                onChange={event => setName(event.target.value)}
                className="rounded-14 border-gray-2 text-body2-medium border px-12 py-10"
                placeholder="그룹 이름"
            />
            <button
                type="button"
                disabled={createGroup.isPending || name.trim().length === 0}
                onClick={() =>
                    createGroup.mutate({
                        name: name.trim(),
                        memberIds,
                        sourceMealPlanId: mealPlan.mealPlanId
                    })
                }
                className="rounded-30 bg-gray-8 text-body1-semibold disabled:bg-gray-3 py-12 text-white">
                {createGroup.isPending ? '생성 중입니다.' : 'MealGroup 만들기'}
            </button>
        </section>
    )
}
