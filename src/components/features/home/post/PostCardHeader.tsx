import { useAuthStore } from '@/store'
import { KebabButton, TagPerson } from '@/components'
import { ProfileDefaultIcon } from '@/assets/icons'
import { useGetProfiles } from '@/query'

export const PostCardHeader = ({
    authorId,
    authorUsername,
    tags,
    postedAt
}: {
    authorId: number
    authorUsername: string
    tags?: number[]
    postedAt: string
}) => {
    const { userId } = useAuthStore()
    const { data: profiles } = useGetProfiles(tags || [])
    console.log('profiles', profiles)
    return (
        <div className="flex w-full flex-row items-center justify-between">
            {/* 프로필 태그 */}
            <div className="flex flex-row gap-8">
                {/* 프로필 */}
                <div className="flex flex-shrink-0 flex-row items-center gap-10">
                    <ProfileDefaultIcon />
                    <span className="text-body1-bold text-black">
                        {authorUsername}
                    </span>
                </div>
                {/* 태그 */}
                <div className="flex flex-row flex-wrap items-center gap-8">
                    {tags &&
                        profiles
                            ?.map(profile => profile.username)
                            .map(tag => <TagPerson name={tag} />)}
                </div>
            </div>
            {/* 시간 케밥 */}
            <div className="flex flex-row items-end gap-6">
                {/* 시간 */}
                <span className="text-caption-medium text-right text-nowrap text-gray-300">
                    {formatTime(postedAt)}
                </span>
                {/* 케밥 버튼 */}
                {Number(userId) === authorId && (
                    <KebabButton onClick={() => {}} />
                )}
            </div>
        </div>
    )
}

const moreTagged = (tags?: number[]) => {
    if (!tags) return []
    if (tags.length > 2) {
        return [tags[0], `${tags[1]} 외 ${tags.length - 2}명`]
    }
    return tags
}

const formatTime = (time: string) => {
    const date = new Date(time)
    // 24시간 전이 최대
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const diffHours = Math.floor(diff / (1000 * 60 * 60))
    if (diffHours < 24) {
        return `${diffHours}시간 전`
    }
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (diffDays < 30) {
        return `${diffDays}일 전`
    }
    return date.toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit'
    })
}
