import type { RecruitCardView } from '@/viewModels'
import { ModalTrigger, MutalButtonSmall } from '@/components'

export function JoinButton({
    disabled,
    recruit,
    setSelectedRecruit,
    onJoinRecruit
}: {
    disabled?: boolean
    recruit: RecruitCardView
    setSelectedRecruit: (recruit: RecruitCardView) => void
    onJoinRecruit: (recruitId: number) => void
}) {
    const handleJoinRecruit = () => {
        onJoinRecruit(recruit.postId)
        setSelectedRecruit(recruit)
    }
    return (
        <ModalTrigger
            forId="join-complete-modal"
            disabled={disabled}>
            <MutalButtonSmall
                onClick={handleJoinRecruit}
                text="참여하기"
                className={`${
                    disabled ? 'bg-gray-4 cursor-not-allowed' : 'bg-gray-7'
                }`}
            />
        </ModalTrigger>
    )
}

