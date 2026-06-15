import { useSocket } from '@/contexts/SocketContext'
import { MenuCard } from '@/components'
import { useAuthStore } from '@/store'

export function MenuPage() {
    const { categories, commands, menuPicks, menuCandidates } = useSocket()
    const { userId } = useAuthStore()
    const menus = menuCandidates

    const handleSelectMenu = (menuCandidateId: (typeof menus)[number]['id']) => {
        commands?.pickMenu({ menuCandidateId })
    }

    return (
        <>
            <div className="grid grid-cols-3 gap-10">
                {menus.map(candidate => (
                    <MenuCard
                        key={candidate.id}
                        selectedUsers={
                            menuPicks.find(pick => pick.menuCandidateId === candidate.id)
                                ?.selectedMembers.map(String)
                        }
                        menuName={candidate.menu.label}
                        category={categories.find(
                            item => item.name === candidate.menu.label
                        )}
                        onClick={() => handleSelectMenu(candidate.id)}
                        currentUser={userId}
                    />
                ))}
            </div>
        </>
    )
}
