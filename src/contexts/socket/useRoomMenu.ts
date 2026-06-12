import { useEffect, useState } from 'react'
import type {
    MenuPickUpdateResponse,
    RestaurantPickUpdateResponse
} from '@kimdaegyu/babmukdang-shared/domain'
import type { AppSocket } from './types'

export type MenuPickUpdateResponseDto = MenuPickUpdateResponse
export type RestaurantPickUpdateResponseDto = RestaurantPickUpdateResponse

export function useRoomMenu(socket: AppSocket | null) {
    const [menuPicks, setMenuPicks] = useState<MenuPickUpdateResponseDto>([])
    const [restaurantPicks, setRestaurantPicks] =
        useState<RestaurantPickUpdateResponseDto>([])

    useEffect(() => {
        if (!socket) return

        const handleMenuPickUpdated = (data: MenuPickUpdateResponseDto) => {
            setMenuPicks(data)
        }
        const handleRestaurantPickUpdated = (
            data: RestaurantPickUpdateResponseDto
        ) => {
            setRestaurantPicks(data)
        }

        socket.on('menu-pick-updated', handleMenuPickUpdated)
        socket.on('restaurant-pick-updated', handleRestaurantPickUpdated)

        return () => {
            socket.off('menu-pick-updated', handleMenuPickUpdated)
            socket.off('restaurant-pick-updated', handleRestaurantPickUpdated)
        }
    }, [socket])

    return { menuPicks, restaurantPicks }
}
