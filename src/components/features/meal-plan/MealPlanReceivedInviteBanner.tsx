import { useNavigate } from 'react-router-dom'
import {
    useAcceptMealPlanInvite,
    useDeclineMealPlanInvite,
    useReceivedMealPlanInvites
} from '@/apis'

export function MealPlanReceivedInviteBanner({
    mealPlanId
}: {
    mealPlanId: string
}) {
    const navigate = useNavigate()
    const { data: receivedInvites } = useReceivedMealPlanInvites()
    const pendingInvite = receivedInvites?.find(
        invite => invite.mealPlanId === mealPlanId && invite.status === 'PENDING'
    )
    const { mutate: acceptInvite, isPending: isAccepting } =
        useAcceptMealPlanInvite({
            onSuccess: mealPlan => {
                if (mealPlan) navigate(`/meal-plans/${mealPlan.mealPlanId}`)
            }
        })
    const { mutate: declineInvite, isPending: isDeclining } =
        useDeclineMealPlanInvite({
            onSuccess: () => navigate('/friend')
        })

    if (!pendingInvite) return null

    return (
        <section className="rounded-20 border-primary-400 bg-primary-100 flex flex-col gap-12 border p-16">
            <div>
                <h2 className="text-body1-semibold text-gray-8">
                    {pendingInvite.inviter.username}님의 밥약 초대
                </h2>
                <p className="text-caption-regular text-gray-6">
                    {pendingInvite.message || '같이 밥 먹자는 초대가 도착했습니다.'}
                </p>
            </div>
            <div className="grid grid-cols-2 gap-8">
                <button
                    type="button"
                    data-testid={`meal-plan-received-invite-accept-${pendingInvite.inviteId}`}
                    disabled={isAccepting || isDeclining}
                    onClick={() => acceptInvite(pendingInvite.inviteId)}
                    className="rounded-30 bg-gray-8 py-10 text-caption-medium text-white disabled:opacity-40">
                    초대 수락
                </button>
                <button
                    type="button"
                    data-testid={`meal-plan-received-invite-decline-${pendingInvite.inviteId}`}
                    disabled={isAccepting || isDeclining}
                    onClick={() => declineInvite(pendingInvite.inviteId)}
                    className="rounded-30 bg-white py-10 text-caption-medium text-gray-7 disabled:opacity-40">
                    거절
                </button>
            </div>
        </section>
    )
}
