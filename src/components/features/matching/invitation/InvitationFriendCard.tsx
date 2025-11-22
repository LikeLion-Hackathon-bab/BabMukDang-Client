import { HungryIcon, InviteIcon, NotHungryIcon } from '@/assets/icons'
import { Link } from 'react-router-dom'

type Friend = {
    memberId: number
    userName: string
    profileImageUrl: string
    hungry: boolean
    label: string
}
export function FriendCard({ friend }: { friend: Friend }) {
    return (
        <div className="rounded-12 flex flex-row items-center justify-between bg-white p-12">
            <div className="flex flex-row items-center gap-13">
                {friend.hungry ? <HungryIcon /> : <NotHungryIcon />}
                <div className="flex h-full flex-col gap-8">
                    <span className="text-body1-bold">{friend.userName}</span>
                    <span
                        className={`text-caption-medium ${
                            friend.hungry ? 'text-primary-500' : 'text-gray-4'
                        }`}>
                        {friend.hungry ? `공복이에요` : '식사를 마친 상태예요'}
                    </span>
                </div>
            </div>
            {/* 초대장 아이콘 */}
            <Link to={`/send-invitation/${friend.memberId}`}>
                <InviteIcon />
            </Link>
        </div>
    )
}

const calculateHungryTime = (lastActive: string) => {
    const now = new Date()
    const lastActiveDate = new Date(lastActive)
    const diffTime = Math.abs(now.getTime() - lastActiveDate.getTime())
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
    if (diffHours > 24) {
        return '24시간 이상'
    }
    return `${diffHours}시간`
}
