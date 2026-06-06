import { useEffect, useState } from 'react'
import type {
    MenuPickUpdateResponseDto,
    RestaurantPickUpdateResponseDto
} from '@kimdaegyu/babmukdang-shared'
import type { AppSocket } from './types'

/**
 * 메뉴/식당 픽 도메인 훅.
 * - `menu-pick-updated`: 메뉴 픽 집계
 * - `restaurant-pick-updated`: 식당 픽 집계
 *
 * MenuPage/RestaurantPage는 컨텍스트의 menuPicks/restaurantPicks를 소비한다.
 */
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
