import { useMemo } from 'react'
import { MessageCircle } from 'lucide-react'
import { usePageChrome } from '@/hooks/usePageChrome'
import { navigateToPath, useNavigate } from '@/navigation'

export function useMealPlanDecisionChrome({
    mealPlanId,
    title,
    showChat = true
}: {
    mealPlanId: string
    title: string
    showChat?: boolean
}) {
    const navigate = useNavigate()
    const right = useMemo(() => {
        if (!showChat) {
            return (
                <div
                    className="h-34 w-34"
                    aria-hidden
                />
            )
        }

        return (
            <button
                type="button"
                onClick={() =>
                    navigate(`/meal-plans/${mealPlanId}/decision/chat`)
                }
                className="text-gray-7 grid h-34 w-34 place-items-center rounded-full bg-white"
                aria-label="밥약 채팅">
                <MessageCircle className="h-22 w-22" />
            </button>
        )
    }, [mealPlanId, navigate, showChat])

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
