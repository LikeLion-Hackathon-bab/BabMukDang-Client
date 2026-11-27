import exifr from 'exifr'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { useArticleStore } from '@/store'
import { RestaurantCard, MutalButton, SearchInput } from '@/components'
import { useBottomNav, useKakaoMap } from '@/hooks'
import { useUploadArticle } from '@/query'
import { useAuthStore } from '@/store'
import { RestaurantInfo } from '@/apis/dto'

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

    const { showBottomNav, hideBottomNav } = useBottomNav()
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
                <UploadButton hasRestaurant={Boolean(selectedRestaurant)} />
            </div>
        </div>
    )
}

function UploadButton({ hasRestaurant }: { hasRestaurant: boolean }) {
    const { image, buildRequest } = useArticleStore()
    const { userId } = useAuthStore()
    const navigate = useNavigate()
    const cache = useQueryClient()
    const [message, setMessage] = useState('')
    const { mutate: uploadAndPost, isPending } = useUploadArticle(
        () => { cache.invalidateQueries(); navigate('/', {replace:true}) },
        () => setMessage('사진을 게시하지 못했어요. 다시 시도해 주세요.')
    )
    const submit = () => {
        if (!image || !userId || !buildRequest || !hasRestaurant || isPending) return
        setMessage('')
        uploadAndPost({currentUserId:userId, file:image, buildRequest})
    }
    return <div>{message && <p role="alert">{message}</p>}
        <button disabled={!image || !userId || !buildRequest || !hasRestaurant || isPending} onClick={submit}
            className="w-full rounded-full bg-black p-16 text-white">
            {isPending ? '게시 중…' : '게시물 업로드 하기'}
        </button>
    </div>
}
