import { useEffect, useState } from 'react'
import type { Menu } from '@kimdaegyu/babmukdang-shared/domain/room'
type MenuInitialState = { initialMenus: Menu[] }

import { useSocket } from '@/contexts/SocketContext'
import { MenuCard } from '@/components'
import { useAuthStore } from '@/store'

export function MenuPage() {
    const { phaseData, categories, commands, menuPicks } = useSocket()
    const { userId } = useAuthStore()
    const [menus, setMenus] = useState<Menu[]>([])
    useEffect(() => {
        if (phaseData && phaseData.phase === 'menu') {
            setMenus((phaseData.data as MenuInitialState).initialMenus)
        }
    }, [phaseData])

    const handleSelectMenu = (menuCode: Menu['code']) => {
        commands?.pickMenu({ menuCode })
    }

    return (
        <>
            <div className="grid grid-cols-3 gap-10">
                {menus.map(menu => (
                    <MenuCard
                        key={menu.code}
                        selectedUsers={
                            menuPicks.find(pick => pick.menuCode === menu.code)
                                ?.selectedMembers.map(String)
                        }
                        menuName={menu.label}
                        category={categories.find(
                            item => item.name === menu.label
                        )}
                        onClick={() => handleSelectMenu(menu.code)}
                        currentUser={userId}
                    />
                ))}
            </div>
        </>
    )
}
