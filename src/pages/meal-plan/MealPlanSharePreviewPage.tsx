import { useEffect, useMemo } from 'react'
import { Link, useParams } from '@/navigation'
import { useMealPlanSharePreview } from '@/apis'

export function MealPlanSharePreviewPage() {
    const { token = '' } = useParams<{ token: string }>()
    const guestSession = useMemo(
        () => window.localStorage.getItem(`mealPlanGuestSession:${token}`),
        [token]
    )
    const { data, isLoading, error } = useMealPlanSharePreview(token, {
        enabled: Boolean(token)
    })

    if (isLoading)
        return (
            <div className="py-40 text-center text-gray-5">
                링크를 확인하는 중입니다.
            </div>
        )
    if (error || !data)
        return (
            <div className="py-40 text-center text-red-500">
                사용할 수 없는 링크입니다.
            </div>
        )

    return (
        <div className="flex flex-col gap-20 py-20">
            <section className="rounded-24 bg-primary-100 border-primary-300 flex flex-col gap-12 border p-18">
                <span className="text-caption-medium text-primary-main">
                    {data.ownerName}님의 밥약
                </span>
                <h1 className="text-title2-semibold text-gray-8">
                    {data.title}
                </h1>
                <p className="text-body2-medium text-gray-6">
                    현재 {data.participantCount}명이 함께 정하고 있습니다.
                </p>
            </section>
            {guestSession && (
                <Link
                    to={`/meal-plan-links/${token}/session`}
                    className="rounded-30 bg-primary-main text-body1-semibold flex justify-center py-14 text-white">
                    이전 게스트 세션으로 다시 들어가기
                </Link>
            )}
            <Link
                to={`/meal-plan-links/${token}/join`}
                className="rounded-30 bg-gray-8 text-body1-semibold flex justify-center py-14 text-white">
                게스트로 참여하기
            </Link>
        </div>
    )
}
