import { ThumbImg } from '@/components'
import { FriendProfileList } from './FriendProfileList'
import { useEffect } from 'react'

export const MenuCard = ({
    selectedUsers,
    menuName,
    category,
    currentUser,
    onClick
}: {
    selectedUsers?: string[]
    menuName: string
    category: any
    currentUser: string | null
    onClick: () => void
}) => {
    return (
        <div
            className="flex flex-col items-center justify-center gap-2"
            onClick={onClick}>
            {/* 이미지 */}
            <div
                className={`bg-gray-2 rounded-12 relative flex w-full flex-col items-center justify-center overflow-hidden ${selectedUsers && currentUser && selectedUsers.includes(currentUser) ? 'border-primary-main border-2' : ''}`}>
                <div className="-gap-4 absolute top-8 left-8 z-100 flex h-full w-full flex-row flex-wrap">
                    {/* 사람 프로필 */}
                    <FriendProfileList selectedUsers={selectedUsers || []} />
                </div>
                <ThumbImg
                    item={category}
                    size={120}
                    className="rounded-12"
                    aspectRatio={'6/7'}
                    onClick={() => {}}
                />
            </div>
            {/* 이름 */}
            <div className="text-body2-medium text-gray-7">{menuName}</div>
        </div>
    )
}
