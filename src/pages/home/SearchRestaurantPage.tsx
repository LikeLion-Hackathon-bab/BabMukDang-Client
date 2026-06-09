import exifr from 'exifr'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { useArticleStore, useBottomNavStore } from '@/store'
import { RestaurantCard, MutalButton, SearchInput } from '@/components'
import { useKakaoMap } from '@/hooks'
import { useUploadArticle, RestaurantInfo } from '@/apis'
import { useAuthStore } from '@/store'

export function SearchRestaurantPage() {
    const { image, setRestaurant } = useArticleStore()
    const gps = useRef<any>(null)
    const [restaurants, setRestaurants] = useState<any[]>([])
    const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null)
    const { isLoaded, kakao, createPlaces } = useKakaoMap()
    const getGps = async () => {
        try {
            const result = await exifr.parse(image as File, { gps: true })
            gps.current = result
            if (result.latitude && result.longitude && isLoaded) {
                places.current = createPlaces()
                places.current.categorySearch(
                    'FD6',
                    (data: any, status: any, pagination: any) => {
                        setRestaurants(data)
                    },
                    {
                        x: result.longitude,
                        y: result.latitude,
                        radius: 1000,
                        sort: kakao.maps.services.SortBy.DISTANCE
                    }
                )
            }
        } catch (err) {
            console.error('EXIF parsing error:', err)
        }
    }

    const places = useRef<any>(null)
    useEffect(() => {
        if (!image || !isLoaded) return
        getGps()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [image, isLoaded])

    const handleSearch = (searchKeyword: string) => {
        if (!searchKeyword) {
            if (gps.current?.longitude && gps.current?.latitude) {
                getGps()
            } else {
                return
            }
        }
        if (!isLoaded) return
        places.current = createPlaces()
        places.current.keywordSearch(
            searchKeyword,
            (data: any, status: any, pagination: any) => {
                if (status === kakao.maps.services.Status.OK) {
                    setRestaurants(data)
                } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
                    setRestaurants([])
                }
            },
            {
                category_group_code: 'FD6',
                x: gps.current?.longitude ? gps.current?.longitude : null,
                y: gps.current?.latitude ? gps.current?.latitude : null,
                sort:
                    gps.current?.longitude && gps.current?.latitude
                        ? kakao.maps.services.SortBy.DISTANCE
                        : null
            }
        )
    }
    const handleSelectRestaurant = (restaurant: any) => {
        setSelectedRestaurant(restaurant)
        console.log(restaurant)
        setRestaurant({
            addressName: restaurant.address_name,
            roadAddressName: restaurant.road_address_name,
            phoneNumber: restaurant.phone,
            placeUrl: restaurant.place_url,
            categoryName: restaurant.category_name,
            categoryGroupCode: restaurant.category_group_code,
            categoryGroupName: restaurant.category_group_name,
            placeId: restaurant.id,
            placeName: restaurant.place_name,
            x: restaurant.x,
            y: restaurant.y
        })
    }

    const { showBottomNav, hideBottomNav } = useBottomNavStore()
    useEffect(() => {
        hideBottomNav()
        return () => {
            showBottomNav()
        }
    }, [])
    return (
        <div className="relative flex h-full w-full flex-col overflow-y-auto pt-16">
            <div className="fixed top-66 left-0 w-full px-20">
                <SearchInput
                    handleSearch={handleSearch}
                    placeholder="음식점 이름을 검색해 주세요."
                />
            </div>
            {/* 검색 결과 */}
            <div className="mt-53 flex flex-col items-center gap-10">
                {restaurants.map(restaurant => (
                    <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        gps={gps}
                        onClick={() => handleSelectRestaurant(restaurant)}
                        className={`${
                            selectedRestaurant?.id === restaurant.id
                                ? 'bg-primary-100 border-primary-main border-1'
                                : 'bg-white'
                        }`}
                    />
                ))}
            </div>
            <div className="fixed bottom-40 left-0 w-full px-20">
                <UploadButton />
            </div>
        </div>
    )
}

function UploadButton() {
    const { image, buildRequest } = useArticleStore()
    const { userId } = useAuthStore()
    const { mutate: uploadAndPost, isPending } = useUploadArticle({
        onSuccess: () => console.log('업로드 완료'),
        onError: (e: Error) => console.error(e.message)
    })
    const onClickUpload = () => {
        if (buildRequest && image) {
            uploadAndPost({
                currentUserId: userId!,
                file: image,
                buildRequest: buildRequest
            })
        }
    }

    return (
        <Link
            className="w-full"
            replace
            to="/">
            <MutalButton
                text="게시물 업로드 하기"
                onClick={onClickUpload}
                hasArrow={true}
            />
        </Link>
    )
}
