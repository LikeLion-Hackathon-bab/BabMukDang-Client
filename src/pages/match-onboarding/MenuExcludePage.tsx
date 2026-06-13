import { useEffect, useState } from 'react'

import { useSocket } from '@/contexts/SocketContext'
import { TagPerson, OnboardingHeader, ThumbImg } from '@/components'
import type { Menu, Participant } from '@kimdaegyu/babmukdang-shared/domain/room'
type MemberId = Participant['memberId']
type ExcludeMenuInitialState = {
    recentMenus: { userId: string; menuList: Menu[] }[]
    excludedMenuList?: { memberId: MemberId; exclusions: Menu[] }[]
}

interface UserRecentMenus {
    memberId: number
    menuList: Menu[]
    excludedMenuList?: Menu[]
}
export function MenuExcludePage() {
    const [userRecentMenus, setUserRecentMenus] = useState<UserRecentMenus[]>(
        []
    )
    const { phaseData, excludeMenuPicks } = useSocket()
    useEffect(() => {
        if (phaseData && phaseData.phase === 'exclude-menu') {
            const data = phaseData.data as ExcludeMenuInitialState
            const excluded = data.excludedMenuList ?? []
            setUserRecentMenus(
                data.recentMenus.map(recent => ({
                    memberId: Number(recent.userId),
                    menuList: recent.menuList,
                    excludedMenuList: excluded.find(
                        item => Number(item.memberId) === Number(recent.userId)
                    )?.exclusions
                }))
            )
        }
    }, [phaseData])

    useEffect(() => {
        setUserRecentMenus(prev =>
            prev.map(item => {
                const updateItem = excludeMenuPicks.find(
                    update => Number(update.memberId) === Number(item.memberId)
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
    }, [excludeMenuPicks])
    return (
        <>
            <div className="flex flex-col gap-30">
                {userRecentMenus.length > 0 &&
                    userRecentMenus.map((user: UserRecentMenus, index) => (
                        <MenuExcludeList
                            key={index}
                            menuList={user.menuList}
                            memberId={user.memberId}
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
    memberId,
    excludedMenuList
}: {
    menuList: Menu[]
    memberId: number
    excludedMenuList?: Menu[]
}) => {
    const { categories, commands } = useSocket()
    const handleClick = (menu: Menu) => {
        commands?.excludeMenu({ menu })
    }
    return (
        <div className="flex flex-col gap-10">
            <TagPerson
                name={String(memberId)}
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
