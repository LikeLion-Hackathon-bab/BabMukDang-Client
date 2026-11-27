import { MutalButtonSmall } from '@/components'
import {
    useCloseAnnouncement,
    useGetAnnouncements,
    usePostAnnouncement
} from '@/query'
import {useState} from 'react'
import { Post } from '@/apis/dto'
import { useNavigate } from 'react-router-dom'

export function AddAnnouncementButton({
    announcementAddData
}: {
    announcementAddData: Post
}) {
    const [error, setError] = useState('')
    const { refetch } = useGetAnnouncements()
    const { mutate, isPending } = usePostAnnouncement(
        () => { setError(''); refetch() },
        () => setError('공고를 등록하지 못했어요. 다시 시도해 주세요.')
    )
    const valid = announcementAddData.location.trim() && announcementAddData.meetingAt && announcementAddData.targetCount > 0
    return <div><button className="rounded-full bg-black px-16 py-8 text-white disabled:opacity-50"
        disabled={!valid || isPending} onClick={() => mutate(announcementAddData)}>공고 등록하기</button>
        {error && <p role="alert">{error}</p>}</div>
}
export function CloseAnnouncementButton({
    announcementId
}: {
    announcementId: number | undefined
}) {
    const navigate = useNavigate()
    const { mutate: closeAnnouncement } = useCloseAnnouncement(
        () => {
            navigate('/noti')
        },
        error => {
            console.log(error)
        }
    )
    const handleCloseAnnouncement = () => {
        if (announcementId) {
            closeAnnouncement(announcementId)
        }
    }

    return (
        <MutalButtonSmall
            text="공고 마감하기"
            onClick={handleCloseAnnouncement}></MutalButtonSmall>
    )
}
