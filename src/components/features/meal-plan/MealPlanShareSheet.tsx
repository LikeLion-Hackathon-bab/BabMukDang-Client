import { useState } from 'react'
import { Link } from '@/navigation'
import { useCreateMealPlanShareLink } from '@/apis'
import { useNearbyFriendExposureWorkflow } from './useNearbyFriendExposureWorkflow'
import type { MealPlanShareLinkSummary } from '@kimdaegyu/babmukdang-shared/domain'

export function MealPlanShareSheet({
    mealPlanId,
    onClose
}: {
    mealPlanId: string
    onClose: () => void
}) {
    const [shareLink, setShareLink] = useState<MealPlanShareLinkSummary | null>(
        null
    )
    const [copyMessage, setCopyMessage] = useState<string | null>(null)
    const createShareLink = useCreateMealPlanShareLink({
        onSuccess: data => setShareLink(data ?? null)
    })
    const nearby = useNearbyFriendExposureWorkflow(mealPlanId)
    const isNearbyOn =
        Boolean(nearby.lastResult) ||
        Boolean(
            nearby.eligibility?.nearbyMealPlanExposureAllowed &&
            nearby.eligibility.locationConsentStatus === 'GRANTED'
        )

    const createOrShare = async () => {
        setCopyMessage(null)
        const link =
            shareLink ??
            (await createShareLink.mutateAsync({
                mealPlanId,
                body: { guestJoinEnabled: true }
            }))
        setShareLink(link)

        if (navigator.share) {
            await navigator.share({
                title: '밥먹댕 밥약 초대',
                text: '같이 밥약을 정해요.',
                url: link.url
            })
            return
        }

        await navigator.clipboard?.writeText(link.url)
        setCopyMessage('링크를 복사했어요.')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
            <button
                type="button"
                className="absolute inset-0"
                aria-label="닫기"
                onClick={onClose}
            />
            <section className="relative w-full rounded-t-[22px] bg-white px-16 pt-10 pb-18 shadow-2xl">
                <div className="bg-gray-2 mx-auto h-4 w-40 rounded-full" />
                <div className="mt-13">
                    <h2 className="text-title2-semibold text-gray-8">
                        함께 정할 사람 더 부르기
                    </h2>
                    <p className="text-caption-regular text-gray-5 mt-3 leading-5">
                        친구 초대 외에 링크와 근처 노출로 참여자를 받을 수
                        있어요.
                    </p>
                </div>

                <div className="mt-13 flex flex-col gap-12">
                    <article className="rounded-20 border border-transparent bg-white p-14 shadow-sm">
                        <div className="flex gap-11">
                            <div className="bg-gray-1 text-primary-main grid h-40 w-40 shrink-0 place-items-center rounded-full">
                                ↗
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-body1-semibold text-gray-8">
                                    링크로 같이 정하기
                                </h3>
                                <p className="text-caption-regular text-gray-5 mt-2 leading-5">
                                    앱이 없는 사람도 링크로 들어와 게스트로 함께
                                    정해요.
                                </p>
                            </div>
                        </div>
                        <div className="mt-12 flex items-center gap-8">
                            <div className="border-gray-2 text-caption-medium text-gray-6 min-w-0 flex-1 rounded-full border px-14 py-10">
                                <span className="block truncate">
                                    {shareLink?.url ?? '공유 링크를 만들어요'}
                                </span>
                            </div>
                            <button
                                type="button"
                                disabled={createShareLink.isPending}
                                onClick={() => void createOrShare()}
                                className="bg-primary-main text-caption-medium h-40 rounded-full px-18 text-white disabled:opacity-40">
                                공유
                            </button>
                        </div>
                        {shareLink && (
                            <Link
                                to={`/meal-plan-links/${shareLink.token}`}
                                className="text-caption-medium text-primary-main mt-8 inline-flex">
                                링크 미리보기 열기
                            </Link>
                        )}
                        {copyMessage && (
                            <p className="text-caption-regular text-gray-5 mt-8">
                                {copyMessage}
                            </p>
                        )}
                    </article>

                    <article
                        className={`rounded-20 border p-14 shadow-sm ${
                            isNearbyOn
                                ? 'border-primary-300 bg-primary-100'
                                : 'border-transparent bg-white'
                        }`}>
                        <div className="flex gap-11">
                            <div className="text-primary-main grid h-40 w-40 shrink-0 place-items-center rounded-full bg-white">
                                ◎
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-body1-semibold text-gray-8">
                                    근처 친구에게 노출
                                </h3>
                                <p className="text-caption-regular text-gray-5 mt-2 leading-5">
                                    이 밥약을 근처에 있는 친구에게만 보여주고
                                    참여 요청을 받아요.
                                </p>
                            </div>
                        </div>
                        <div className="mt-12 flex items-center gap-10">
                            <span className="border-primary-300 text-caption-medium text-primary-main rounded-full border bg-white px-12 py-6">
                                500m 이내
                            </span>
                            <span className="text-caption-medium text-gray-5">
                                {isNearbyOn ? '지금 켜짐' : '꺼짐'}
                            </span>
                            <button
                                type="button"
                                disabled={nearby.isPreparing}
                                onClick={() =>
                                    void nearby.startExposure({
                                        radiusMeters: 500
                                    })
                                }
                                className="bg-gray-8 text-caption-medium ml-auto rounded-full px-16 py-9 text-white disabled:opacity-40">
                                {nearby.isPreparing ? '준비 중' : '켜기'}
                            </button>
                        </div>
                        {nearby.errorMessage && (
                            <p className="text-caption-regular mt-8 text-red-500">
                                {nearby.errorMessage}
                            </p>
                        )}
                    </article>
                </div>
            </section>
        </div>
    )
}
