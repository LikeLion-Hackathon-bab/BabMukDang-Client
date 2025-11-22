import { MutalButtonSmall } from '@/components'
import {
    useCloseAnnouncement,
    useGetAnnouncements,
    usePostAnnouncement
} from '@/query'
import { Post } from '@/apis/dto'
import { useNavigate } from 'react-router-dom'

export function AddAnnouncementButton({
    announcementAddData
}: {
    announcementAddData: Post
}) {
    const { mutate: postAnnouncement } = usePostAnnouncement(
        () => {
            console.log('Add announcement button clicked')
            refetchAnnouncements()
        },
        error => {
            console.log(error)
        }
    )
    const { refetch: refetchAnnouncements } = useGetAnnouncements()
    const handleAddAnnouncement = () => {
        postAnnouncement(announcementAddData)
    }
    return (
        <MutalButtonSmall
            text="공고 등록하기"
            onClick={handleAddAnnouncement}></MutalButtonSmall>
    )
}
export function CloseAnnouncementButton({
    announcementId
}: {
    announcementId: number | undefined
}) {
    const navigate = useNavigate()
    const { mutate: closeAnnouncement } = useCloseAnnouncement(
        () => {
            console.log('Close announcement button clicked')
        },
        error => {
            console.log(error)
        }
    )
    const handleCloseAnnouncement = () => {
        if (announcementId) {
            closeAnnouncement(announcementId)
            navigate('/announcement/waiting')
        }
    }

    return (
        <MutalButtonSmall
            text="공고 마감하기"
            onClick={handleCloseAnnouncement}></MutalButtonSmall>
    )
}
