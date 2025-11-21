import { RecruitResponseDto } from '@kimdaegyu/babmukdang-shared'
import { ModalTrigger, MutalButtonSmall } from '@/components'
import { useJoinAnnouncement } from '@/query'

export function JoinButton({
    disabled,
    announcement,
    setSelectedAnnouncement
}: {
    disabled?: boolean
    announcement: RecruitResponseDto
    setSelectedAnnouncement: (announcement: RecruitResponseDto) => void
}) {
    const { mutate: joinAnnouncement } = useJoinAnnouncement(
        () => {
            console.log('joinAnnouncement')
        },
        error => {
            console.log(error)
        }
    )
    const handleJoinAnnouncement = () => {
        console.log('handleJoinAnnouncement', announcement)
        joinAnnouncement(announcement.id)
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
