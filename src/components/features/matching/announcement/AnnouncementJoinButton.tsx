import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { PostResponse } from '@/apis/dto'
import { useJoinAnnouncement } from '@/query'

export function JoinButton({
    disabled,
    announcement,
    setSelectedAnnouncement
}: {
    disabled?: boolean
    announcement: PostResponse
    setSelectedAnnouncement: (announcement: PostResponse) => void
}) {
    const cache = useQueryClient()
    const [message, setMessage] = useState('')
    const {
        mutate: join,
        isPending,
        isSuccess
    } = useJoinAnnouncement(
        () => {
            setSelectedAnnouncement(announcement)
            setMessage(
                '참여했어요. 모집이 끝나면 알림에서 대기실에 입장하세요.'
            )
            cache.invalidateQueries({ queryKey: ['announcements'] })
        },
        () => setMessage('참여하지 못했어요. 공고를 다시 확인해 주세요.')
    )
    return (
        <div>
            <button
                type="button"
                disabled={disabled || isPending || isSuccess}
                onClick={() => join(announcement.postId)}
                className="rounded-full bg-black px-16 py-8 text-white disabled:opacity-50">
                {isSuccess ? '참여 완료' : '참여하기'}
            </button>
            {message && <p role="status">{message}</p>}
        </div>
    )
}
