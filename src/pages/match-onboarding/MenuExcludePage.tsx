import { useEffect, useMemo, useState } from 'react'

import { useSocket } from '@/contexts/SocketContext'
import { TagPerson, OnboardingHeader, ThumbImg } from '@/components'
import { useAuthStore } from '@/store'
import {
    ExcludeMenuInitialState,
    ExcludeMenuUpdateResponseDto,
    Menu,
    MenuCode,
    UserId
} from '@kimdaegyu/babmukdang-shared'
import { startWith, scan, tap } from 'rxjs'
function isExcludeMenuInitialState(
    x: ExcludeMenuInitialState | ExcludeMenuUpdateResponseDto
): x is ExcludeMenuInitialState {
    return x != null && typeof x === 'object' && 'recentMenus' in x
}

export function MenuExcludePage() {
    const [menuExcludeState, setMenuExcludeState] =
        useState<ExcludeMenuInitialState>({
            recentMenus: [],
            excludedMenuList: []
        })
    const service = useSocket()
    useEffect(() => {
        if (!service) return
        const sub = service.excludeMenuInitialState$.subscribe(data => {
            console.log('menuExcludeInitialState', data)
            setMenuExcludeState(data)
        })
        const sub2 = service.excludeMenuUpdated$.subscribe(data => {
            console.log('menuExcludeUpdated', data)
            setMenuExcludeState(prev => ({
                ...prev,
                excludedMenuList: data
            }))
        })
        return () => {
            sub.unsubscribe()
            sub2.unsubscribe()
        }
    }, [service])
    return (
        <>
            <div className="flex flex-col gap-30">
                {menuExcludeState &&
                    menuExcludeState.recentMenus &&
                    menuExcludeState.recentMenus.map(
                        (
                            userUp: { userId: UserId; menuList: Menu[] },
                            index
                        ) => (
                            <MenuExcludeList
                                key={index}
                                menuList={userUp.menuList}
                                userId={userUp.userId}
                                excludedMenuList={
                                    menuExcludeState.excludedMenuList
                                }
                            />
                        )
                    )}
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
    userId: UserId
    excludedMenuList?: ExcludeMenuUpdateResponseDto
}) => {
    const service = useSocket()
    const { userId: currentUserId } = useAuthStore()
    const handleClick = (menu: Menu) => {
        if (userId === currentUserId) {
            service?.emit('exclude-menu', { menu: menu })
        }
    }
    const myExcludedMenuList = useMemo(
        () =>
            excludedMenuList?.find(
                user => String(user.userId) === String(userId)
            ),
        [excludedMenuList, userId]
    )
    return (
        <div className="flex flex-col gap-10">
            <TagPerson
                name={userId}
                className="w-fit px-18"
            />
            <div className="-ml-20 flex h-fit w-screen gap-10 overflow-x-auto pl-20">
                {menuList.map((menu: Menu, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-center gap-8">
                        <div
                            key={index}
                            className="h-120 w-120 flex-shrink-0">
                            <ThumbImg
                                item={service!.menuManifest.find(
                                    category => category.id === menu.code
                                )}
                                size={120}
                                onClick={() => handleClick(menu)}
                                isExcluded={myExcludedMenuList?.exclusions?.some(
                                    excludedMenu =>
                                        excludedMenu.code === menu.code
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
