import { useEffect, useState } from 'react'

import { useSocket } from '@/contexts/SocketContext'
import { TagPerson, OnboardingHeader, ThumbImg } from '@/components'
import { useAuthStore } from '@/store'
import type {
    ExcludeMenuInitialState,
    ExcludeMenuUpdateResponseDto,
    Menu
} from '@kimdaegyu/babmukdang-shared'

interface UserRecentMenus {
    userId: string
    menuList: Menu[]
    excludedMenuList?: Menu[]
}
export function MenuExcludePage() {
    const [userRecentMenus, setUserRecentMenus] = useState<UserRecentMenus[]>(
        []
    )
    const { phaseData, socket } = useSocket()
    useEffect(() => {
        if (phaseData && phaseData.phase === 'exclude-menu') {
            const data = phaseData.data as ExcludeMenuInitialState
            const excluded = data.excludedMenuList ?? []
            setUserRecentMenus(
                data.recentMenus.map(recent => ({
                    userId: recent.userId,
                    menuList: recent.menuList,
                    excludedMenuList: excluded.find(
                        item => item.userId === recent.userId
                    )?.exclusions
                }))
            )
        }
    }, [phaseData])

    useEffect(() => {
        const handleExcludeUpdated = (data: ExcludeMenuUpdateResponseDto) => {
            setUserRecentMenus(prev =>
                prev.map(item => {
                    const updateItem = data.find(
                        update => update.userId === item.userId
                    )
                    if (updateItem) {
                        return {
                            ...item,
                            excludedMenuList: updateItem.exclusions
                        }
                    }
                    return item
                })
            )
        }
        socket?.on('exclude-menu-updated', handleExcludeUpdated)
        return () => {
            socket?.off('exclude-menu-updated', handleExcludeUpdated)
        }
    }, [socket])
    return (
        <>
            <div className="flex flex-col gap-30">
                {userRecentMenus.length > 0 &&
                    userRecentMenus.map((user: UserRecentMenus, index) => (
                        <MenuExcludeList
                            key={index}
                            menuList={user.menuList}
                            userId={user.userId}
                            excludedMenuList={user.excludedMenuList}
                        />
                    ))}
            </div>
        </>
    )
}

// 유저 한명의 메뉴 목록
const MenuExcludeList = ({
    menuList,
    userId,
    excludedMenuList
}: {
    menuList: Menu[]
    userId: string
    excludedMenuList?: Menu[]
}) => {
    const { categories, socket } = useSocket()
    const { userId: currentUserId } = useAuthStore()
    const handleClick = (menu: Menu) => {
        // if (userId === currentUserId) {
        socket?.emit('exclude-menu', { menu })
        // }
    }
    return (
        <div className="flex flex-col gap-10">
            <TagPerson
                name={userId}
                className="w-fit px-18"
            />
            <div className="-ml-20 flex h-fit w-screen gap-10 overflow-x-auto pl-20">
                {menuList.map((menu, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-center gap-8">
                        <div
                            key={index}
                            className="h-120 w-120 flex-shrink-0">
                            <ThumbImg
                                item={categories.find(
                                    category => category.id === menu.code
                                )}
                                size={120}
                                onClick={() => handleClick(menu)}
                                isExcluded={excludedMenuList?.some(
                                    excluded => excluded.code === menu.code
                                )}
                            />
                        </div>
                        <span className="text-caption-medium text-gray-8">
                            {menu.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
