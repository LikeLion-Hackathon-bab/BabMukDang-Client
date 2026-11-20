import { useState } from 'react'
import { useCreateMealPlanShareLink } from '@/apis'
import type { MealPlanShareLinkSummary } from '@kimdaegyu/babmukdang-shared/domain'

const copyShareLink = async (url: string) => {
    if (!navigator.clipboard) {
        throw new Error('클립보드를 사용할 수 없습니다.')
    }
    await navigator.clipboard.writeText(url)
}

export function MealPlanShareLinkPanel({ mealPlanId }: { mealPlanId: string }) {
    const [shareLink, setShareLink] = useState<MealPlanShareLinkSummary | null>(
        null
    )
    const [copyMessage, setCopyMessage] = useState<string | null>(null)
    const { mutate, isPending } = useCreateMealPlanShareLink({
        onSuccess: data => {
            setShareLink(data ?? null)
            if (!data) return
            copyShareLink(data.url)
                .then(() => setCopyMessage('링크를 복사했어요.'))
                .catch(error =>
                    setCopyMessage(
                        error instanceof Error
                            ? error.message
                            : '링크를 복사하지 못했습니다.'
                    )
                )
        }
    })

    const copyExistingLink = () => {
        if (!shareLink) return
        copyShareLink(shareLink.url)
            .then(() => setCopyMessage('링크를 복사했어요.'))
            .catch(error =>
                setCopyMessage(
                    error instanceof Error
                        ? error.message
                        : '링크를 복사하지 못했습니다.'
                )
            )
    }

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
                onClick={() => {
                    setCopyMessage(null)
                    mutate({
                        mealPlanId,
                        body: { guestJoinEnabled: true }
                    })
                }}
                className="rounded-30 bg-primary-main text-body1-semibold py-12 text-white disabled:opacity-40">
                공유 링크 만들기
            </button>
            {shareLink && (
                <div className="rounded-16 bg-gray-1 text-caption-regular text-gray-7 flex flex-col gap-8 p-12">
                    <span className="break-all">{shareLink.url}</span>
                    <button
                        type="button"
                        onClick={copyExistingLink}
                        className="text-primary-main text-caption-medium w-fit">
                        복사
                    </button>
                </div>
            )}
            {copyMessage && (
                <p className="text-caption-regular text-gray-5">
                    {copyMessage}
                </p>
            )}
        </section>
    )
}
