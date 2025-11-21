import { useEffect, useState } from 'react'

import { RestaurantCard } from '@/components'
import { useSocket } from '@/contexts/SocketContext'
import { RestaurantPickUpdateResponseDto } from '@kimdaegyu/babmukdang-shared'
import { RestaurantInitialState } from '@kimdaegyu/babmukdang-shared'

export function RestaurantPage() {
    const [restaurantList, setRestaurantList] =
        useState<RestaurantInitialState>({
            initialRestaurants: [],
            restaurantUserList: []
        })
    const service = useSocket()
    useEffect(() => {
        service!.restaurantInitialState$.subscribe(data => {
            setRestaurantList(data)
        })
        service!.restaurantUpdated$.subscribe(data => {
            setRestaurantList(prev => ({
                ...prev,
                restaurantUserList: data
            }))
        })
    }, [service])
    const onClickRestaurant = (restaurant: any) => {
        service?.emit('pick-restaurant', { restaurantId: restaurant.id })
    }

    return (
        <>
            <div className="flex flex-col gap-10">
                {restaurantList.initialRestaurants.map((restaurant, index) => (
                    <RestaurantCard
                        key={index}
                        restaurant={restaurant}
                        selectedUsers={
                            restaurantList.restaurantUserList?.find(
                                item => item.restaurantId === restaurant.id
                            )?.selectedUsers
                        }
                        onClick={onClickRestaurant}
                    />
                ))}
            </div>
        </>
    )
}
