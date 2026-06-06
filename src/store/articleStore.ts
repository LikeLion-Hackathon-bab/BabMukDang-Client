import { ArticlePostRequest, FoodAnalysisResultDto, RestaurantInfo } from '@/apis'
import { mapRestaurantInfoToKakaoRestaurant } from '@/apis/mappers/article.mapper'
import { create } from 'zustand'

interface ArticleStore {
    image: File | null
    mealDate: string
    mealTime: string
    restaurant: RestaurantInfo | null
    taggedMemberIds: number[]
    method: 'ALBUM' | 'CAMERA'
    /**
     * 디바이스 음식 분석 결과. 디바이스 ONNX 분석 모듈이 채워 넣으면
     * buildRequest가 ArticlePostRequest의 optional foodAnalysis로 전달한다.
     * (분석 모듈 구현 전까지는 null)
     */
    foodAnalysis: FoodAnalysisResultDto | null
    // setMealDate: (mealDate: string) => void
    setMealTime: (mealTime: string) => void
    setRestaurant: (restaurant: RestaurantInfo) => void
    setTaggedMemberIds: (taggedMemberIds: number[]) => void
    setMethod: (method: 'ALBUM' | 'CAMERA') => void
    setImage: (image: File) => void
    setFoodAnalysis: (foodAnalysis: FoodAnalysisResultDto | null) => void
    buildRequest: ((cdnUrl: string) => ArticlePostRequest) | null
}

export const useArticleStore = create<ArticleStore>(set => ({
    image: null,
    mealDate: new Date().toISOString().split('T')[0],
    mealTime: '',
    restaurant: null,
    taggedMemberIds: [],
    method: 'ALBUM',
    foodAnalysis: null,
    buildRequest: (cdnUrl: string): ArticlePostRequest => {
        const state = useArticleStore.getState()
        const restaurant = state.restaurant as RestaurantInfo

        return {
            imageUrl: cdnUrl,
            mealDate: state.mealDate,
            restaurant: mapRestaurantInfoToKakaoRestaurant(restaurant),
            taggedMembersId: state.taggedMemberIds,
            ...(state.foodAnalysis
                ? { foodAnalysis: state.foodAnalysis }
                : {})
        }
    },
    setImage: image => set({ image }),
    // setMealDate: mealDate => set({ mealDate }),
    setMealTime: mealTime => set({ mealTime }),
    setRestaurant: restaurant => set({ restaurant }),
    setTaggedMemberIds: taggedMemberIds => set({ taggedMemberIds }),
    setMethod: method => set({ method }),
    setFoodAnalysis: foodAnalysis => set({ foodAnalysis })
}))
