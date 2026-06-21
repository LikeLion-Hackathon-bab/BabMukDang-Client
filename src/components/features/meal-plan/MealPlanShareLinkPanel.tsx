import { useState } from 'react'
import { Link } from '@/navigation'
import { useCreateMealPlanShareLink } from '@/apis'
import type { MealPlanShareLinkSummary } from '@kimdaegyu/babmukdang-shared/domain'

export function MealPlanShareLinkPanel({ mealPlanId }: { mealPlanId: string }) {
    const [shareLink, setShareLink] = useState<MealPlanShareLinkSummary | null>(null)
    const { mutate, isPending } = useCreateMealPlanShareLink({
        onSuccess: data => setShareLink(data ?? null)
    })

    return (
        <section className="rounded-20 flex flex-col gap-12 bg-white p-16">
            <div>
                <h2 className="text-body1-semibold text-gray-8">링크 공유</h2>
                <p className="text-caption-regular text-gray-5">
                    앱 밖의 친구는 공유 링크로 게스트 참여할 수 있습니다.
                </p>
            </div>
            <button
                type="button"
                disabled={isPending}
                onClick={() =>
                    mutate({
                        mealPlanId,
                        body: { guestJoinEnabled: true }
                    })
                }
                className="rounded-30 bg-primary-main text-body1-semibold py-12 text-white disabled:opacity-40">
                공유 링크 만들기
            </button>
            {shareLink && (
                <div className="rounded-16 bg-gray-1 flex flex-col gap-8 p-12 text-caption-regular text-gray-7">
                    <span className="break-all">{shareLink.url}</span>
                    <Link
                        to={`/meal-plan-links/${shareLink.token}`}
                        className="text-primary-main text-caption-medium">
                        링크 미리보기 열기
                    </Link>
                </div>
            )}
        </section>
    )
}
