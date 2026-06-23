import { useMemo, type ReactNode } from 'react'
import { MessageCircle } from 'lucide-react'
import { usePageChrome } from '@/hooks/usePageChrome'
import { useNavigate } from '@/navigation'

export function useMealPlanDecisionChrome({
    mealPlanId,
    title,
    showChat = true,
    rightActions,
    chatPath
}: {
    mealPlanId: string
    title: string
    showChat?: boolean
    rightActions?: ReactNode
    chatPath?: string
}) {
    const navigate = useNavigate()
    const right = useMemo(() => {
        if (!showChat && !rightActions) {
            return <div className="h-34 w-34" aria-hidden />
        }

        return (
            <div className="flex items-center gap-4">
                {rightActions}
                {showChat && (
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                chatPath ??
                                    `/meal-plans/${mealPlanId}/decision/chat`
                            )
                        }
                        className="text-gray-7 grid h-34 w-34 place-items-center rounded-full bg-white"
                        aria-label="밥약 채팅">
                        <MessageCircle className="h-22 w-22" />
                    </button>
                )}
            </div>
        )
    }, [chatPath, mealPlanId, navigate, rightActions, showChat])

    const pageChromeConfig = useMemo(
        () => ({
            header: {
                visible: true,
                title,
                showRightButton: true,
                right
            },
            bottomNav: { visible: false }
        }),
        [right, title]
    )

    usePageChrome(pageChromeConfig)
}
