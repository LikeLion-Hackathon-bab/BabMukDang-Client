import exifr from 'exifr'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from '@/navigation'

import { useArticleStore, useAuthStore } from '@/store'
import { MutalButton } from '@/components'
import { useUploadArticle, type RestaurantInfo } from '@/apis'
import { PlaceSearchField } from '@/components/features/search'
import type { PlaceSearchResult, SearchContext } from '@/services/search'

const toRestaurantInfo = (place: PlaceSearchResult): RestaurantInfo => ({
    addressName: place.addressName ?? '',
    roadAddressName: place.roadAddressName ?? '',
    phoneNumber: place.phoneNumber ?? '',
    placeUrl: place.placeUrl ?? '',
    categoryName: place.categoryName ?? '',
    categoryGroupCode: place.categoryGroupCode ?? '',
    categoryGroupName: place.categoryGroupName ?? '',
    placeId: place.placeId,
    placeName: place.placeName,
    x: place.longitude,
    y: place.latitude,
    distance: place.distance == null ? undefined : String(place.distance)
})

export function SearchRestaurantPage() {
    const [searchParams] = useSearchParams()
    const mealPlanId = searchParams.get('mealPlanId')
    const { image, setRestaurant, setMealPlanId } = useArticleStore()
    const [selectedRestaurant, setSelectedRestaurant] =
        useState<PlaceSearchResult | null>(null)
    const [searchContext, setSearchContext] = useState<
        SearchContext | undefined
    >()
    const gps = useRef<{ latitude?: number; longitude?: number } | null>(null)

    useEffect(() => {
        let cancelled = false
        const readGps = async () => {
            if (!image) return
            try {
                const result = await exifr.parse(image as File, { gps: true })
                if (cancelled) return
                gps.current = result
                if (result?.latitude && result?.longitude) {
                    setSearchContext({
                        latitude: result.latitude,
                        longitude: result.longitude,
                        radius: 1000,
                        sort: 'distance'
                    })
                }
            } catch (err) {
                console.error('EXIF parsing error:', err)
            }
        }
        readGps()
        return () => {
            cancelled = true
        }
    }, [image])

    const handleSelectRestaurant = (place: PlaceSearchResult) => {
        setSelectedRestaurant(place)
        setRestaurant(toRestaurantInfo(place))
    }

    useEffect(() => {
        setMealPlanId(mealPlanId)
        return () => {
            setMealPlanId(null)
        }
    }, [setMealPlanId, mealPlanId])

    return (
        <div className="relative flex h-full w-full flex-col overflow-y-auto px-20 pt-16 pb-120">
            <div className="rounded-20 bg-white p-16">
                <PlaceSearchField
                    label="식당 검색"
                    placeholder="음식점 이름을 검색해 주세요."
                    helperText="카카오 지도 검색을 사용합니다. 사진 GPS가 있으면 가까운 식당을 거리순으로 찾습니다."
                    context={searchContext}
                    selectedName={selectedRestaurant?.placeName}
                    onSelect={handleSelectRestaurant}
                />
            </div>
            {selectedRestaurant && (
                <div className="mt-14 rounded-20 bg-primary-100 p-14">
                    <p className="text-body1-semibold text-primary-main">
                        {selectedRestaurant.placeName}
                    </p>
                    <p className="text-caption-regular text-gray-6">
                        {selectedRestaurant.roadAddressName ||
                            selectedRestaurant.addressName}
                    </p>
                </div>
            )}
            <div className="fixed bottom-40 left-0 w-full px-20">
                <UploadButton mealPlanId={mealPlanId} />
            </div>
        </div>
    )
}

function UploadButton({ mealPlanId }: { mealPlanId: string | null }) {
    const navigate = useNavigate()
    const { image, buildRequest, restaurant } = useArticleStore()
    const { userId } = useAuthStore()
    const { mutate: uploadAndPost, isPending } = useUploadArticle({
        onSuccess: () => {
            navigate(mealPlanId ? `/meal-plans/${mealPlanId}` : '/', {
                replace: true
            })
        },
        onError: (e: Error) => console.error(e.message)
    })
    const onClickUpload = () => {
        if (buildRequest && image && userId && restaurant) {
            uploadAndPost({
                currentUserId: userId,
                file: image,
                buildRequest
            })
        }
    }

    return (
        <MutalButton
            text={
                mealPlanId ? 'MealPlan 기록 업로드 하기' : '게시물 업로드 하기'
            }
            onClick={onClickUpload}
            disabled={isPending || !image || !restaurant}
            hasArrow={true}
        />
    )
}
