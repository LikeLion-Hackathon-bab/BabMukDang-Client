import { useEffect, useState } from 'react'

import { useSocket } from '@/contexts/SocketContext'
import { MenuCard, OnboardingHeader } from '@/components'
import { useAuthStore } from '@/store'
import {
    MenuInitialState,
    MenuPickUpdateResponseDto
} from '@kimdaegyu/babmukdang-shared'

function isMenuPickInitialState(
    x: MenuInitialState | MenuPickUpdateResponseDto
): x is MenuInitialState {
    return x != null && typeof x === 'object' && 'initialMenus' in x
}
export function MenuPage() {
    const service = useSocket()
    const { userId } = useAuthStore()
    const [menuRecommendations, setMenuRecommendations] =
        useState<MenuInitialState>({
            initialMenus: [],
            menuPick: []
        })
    useEffect(() => {
        if (!service) return
        service.menuInitialState$.subscribe(data => {
            console.log('menuInitialState', data)
            setMenuRecommendations(data)
        })
        service.menuUpdated$.subscribe(data => {
            setMenuRecommendations(prev => ({
                ...prev,
                menuPick: data
            }))
        })
    }, [service])

    const handleSelectPeople = (index: number) => {
        console.log('menuRecommendations', menuRecommendations)
        service?.emit('pick-menu', {
            menuCode: menuRecommendations.initialMenus[index].code
        })
    }
    return (
        <>
            <div className="grid grid-cols-3 gap-10">
                {menuRecommendations.initialMenus.map((menu, index) => (
                    <MenuCard
                        key={index}
                        selectedUsers={menuRecommendations
                            .menuPick!.find(item => item.menuCode === menu.code)
                            ?.selectedUsers.map(String)}
                        menuName={menu.label}
                        category={service!.menuManifest.find(
                            item => item.id === menu.code
                        )}
                        onClick={() => handleSelectPeople(index)}
                        currentUser={userId}
                    />
                ))}
            </div>
        </>
    )
}
