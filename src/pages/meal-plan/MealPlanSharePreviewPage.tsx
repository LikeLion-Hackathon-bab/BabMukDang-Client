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
            <div className="text-gray-5 py-40 text-center">
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
        <div className="flex min-h-full flex-col gap-18 py-20">
            <section className="rounded-24 overflow-hidden bg-white shadow-sm">
                <div className="bg-primary-100 flex flex-col gap-10 p-16">
                    <span className="text-caption-medium text-primary-main w-fit rounded-full bg-white px-10 py-5">
                        링크 초대
                    </span>
                    <h1 className="text-title2-semibold text-gray-8">
                        {data.title}
                    </h1>
                    <div className="flex items-center gap-9">
                        <div className="text-caption-medium text-primary-main grid h-28 w-28 place-items-center rounded-full bg-white">
                            {data.ownerName[0] ?? '밥'}
                        </div>
                        <span className="text-caption-medium text-gray-6">
                            {data.ownerName}님이 초대했어요
                        </span>
                    </div>
                </div>
                <div className="text-caption-medium text-gray-7 flex gap-16 p-13">
                    <span>참여자 {data.participantCount}명</span>
                    <span>
                        {data.guestJoinEnabled
                            ? '게스트 참여 가능'
                            : '게스트 참여 닫힘'}
                    </span>
                </div>
            </section>
            <section className="rounded-20 bg-gray-1 p-14">
                <h2 className="text-body2-semibold text-gray-8">
                    닉네임만 있으면 같이 정할 수 있어요
                </h2>
                <p className="text-caption-regular text-gray-5 mt-4 leading-5">
                    앱 회원이 아니어도 메뉴·시간·장소 결정에 참여할 수 있습니다.
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
