import { useNavigate, useSearchParams } from '@/navigation'
import { MealPlanCreateSheet } from '@/components/features/meal-plan'

export function MealPlanStartPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    return (
        <div className="min-h-full py-20">
            <section className="rounded-24 bg-primary-100 border-primary-300 flex flex-col gap-10 border p-18">
                <h1 className="text-title2-semibold text-gray-8">
                    오늘 뭐 먹지 시작
                </h1>
                <p className="text-body2-medium text-gray-6">
                    내 밥약 화면과 같은 생성 바텀시트에서 친구 초대와 초기
                    조건을 함께 설정합니다.
                </p>
            </section>
            <MealPlanCreateSheet
                open
                onClose={() => navigate('/meeting')}
                initialInviteeId={searchParams.get('inviteeId')}
                initialMealGroupId={searchParams.get('mealGroupId')}
            />
        </div>
    )
}
