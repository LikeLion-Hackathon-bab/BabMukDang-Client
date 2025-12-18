import { useEffect, useState } from 'react'

import { useSocket } from '@/contexts/SocketContext'
import { TagPerson, OnboardingHeader, ThumbImg } from '@/components'
import { useAuthStore } from '@/store'

interface Menu {
    code: string
    label: string
}
interface ExcludeMenuUpdateItem {
    userId: string
    exclusions: Menu[]
}
type ExcludeMenuUpdate = ExcludeMenuUpdateItem[]

type InitialState = UserRecentMenus[]
interface UserRecentMenus {
    userId: string
    menuList: Menu[]
    excludedMenuList?: Menu[]
}
export function MenuExcludePage() {
    const [userRecentMenus, setUserRecentMenus] = useState<InitialState>([])
    const { initialState, socket } = useSocket()
    useEffect(() => {
        if (initialState && initialState.stage === 'exclude-menu') {
            setUserRecentMenus(initialState.initialState)
            console.log('categories', initialState.initialState)
        }
    }, [initialState])

    useEffect(() => {
        socket?.on('menu-exclusion-updated', (data: ExcludeMenuUpdate) => {
            setUserRecentMenus(prev =>
                prev.map(item => {
                    const updateItem = data.find(
                        update => update.userId === item.userId
                    )
                    console.log('updateItem', updateItem)
                    if (updateItem) {
                        return {
                            ...item,
                            excludedMenuList: updateItem.exclusions
                        }
                    }
                    return item
                })
            )
        })
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
        console.log('menu', menu, excludedMenuList)
        // if (userId === currentUserId) {
        socket?.emit('exclude-menu', menu)
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
