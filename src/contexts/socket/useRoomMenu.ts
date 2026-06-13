import type {
    MenuPickUpdateResponse,
    RestaurantPickUpdateResponse
} from '@kimdaegyu/babmukdang-shared/domain/room'

import { useMatchStore } from '@/store/matchStore'

export type MenuPickUpdateResponseDto = MenuPickUpdateResponse
export type RestaurantPickUpdateResponseDto = RestaurantPickUpdateResponse

export function useRoomMenu() {
    const menuPicks = useMatchStore(state => state.menuPicks)
    const restaurantPicks = useMatchStore(state => state.restaurantPicks)

    return { menuPicks, restaurantPicks }
}
