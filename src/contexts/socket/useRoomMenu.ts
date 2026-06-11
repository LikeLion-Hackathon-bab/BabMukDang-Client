import { useEffect, useState } from 'react'
import type { z } from 'zod'
import {
    MenuPickUpdateResponseSchema,
    RestaurantPickUpdateResponseSchema
} from '@kimdaegyu/babmukdang-shared/domain'
import type { AppSocket } from './types'

export type MenuPickUpdateResponseDto = z.infer<
    typeof MenuPickUpdateResponseSchema
>
export type RestaurantPickUpdateResponseDto = z.infer<
    typeof RestaurantPickUpdateResponseSchema
>

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
