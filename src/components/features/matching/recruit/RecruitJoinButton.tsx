import { PostResponse, useJoinRecruit } from '@/apis'
import { ModalTrigger, MutalButtonSmall } from '@/components'

export function JoinButton({
    disabled,
    recruit,
    setSelectedRecruit
}: {
    disabled?: boolean
    recruit: PostResponse
    setSelectedRecruit: (recruit: PostResponse) => void
}) {
    const { mutate: joinRecruit } = useJoinRecruit({
        onSuccess: () => {
            console.log('joinRecruit')
        },
        onError: (error: Error) => {
            console.log(error)
        }
    })
    const handleJoinRecruit = () => {
        joinRecruit(recruit.postId)
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

