import { PostResponse, useJoinAnnouncement } from '@/apis'
import { ModalTrigger, MutalButtonSmall } from '@/components'

export function JoinButton({
    disabled,
    announcement,
    setSelectedAnnouncement
}: {
    disabled?: boolean
    announcement: PostResponse
    setSelectedAnnouncement: (announcement: PostResponse) => void
}) {
    const { mutate: joinAnnouncement } = useJoinAnnouncement({
        onSuccess: () => {
            console.log('joinAnnouncement')
        },
        onError: (error: Error) => {
            console.log(error)
        }
    })
    const handleJoinAnnouncement = () => {
        joinAnnouncement(announcement.postId)
        setSelectedAnnouncement(announcement)
    }
    return (
        <ModalTrigger
            forId="join-complete-modal"
            disabled={disabled}>
            <MutalButtonSmall
                onClick={handleJoinAnnouncement}
                text="참여하기"
                className={`${
                    disabled ? 'bg-gray-4 cursor-not-allowed' : 'bg-gray-7'
                }`}
            />
        </ModalTrigger>
    )
}
