import { ArticlePostRequest, RestaurantInfo } from '@/apis'
import { mapRestaurantInfoToKakaoRestaurant } from '@/apis/mappers/article.mapper'
import { create } from 'zustand'

interface ArticleStore {
    image: File | null
    mealDate: string
    mealTime: string
    restaurant: RestaurantInfo | null
    taggedMemberIds: number[]
    method: 'ALBUM' | 'CAMERA'
    // setMealDate: (mealDate: string) => void
    setMealTime: (mealTime: string) => void
    setRestaurant: (restaurant: RestaurantInfo) => void
    setTaggedMemberIds: (taggedMemberIds: number[]) => void
    setMethod: (method: 'ALBUM' | 'CAMERA') => void
    setImage: (image: File) => void
    buildRequest: ((cdnUrl: string) => ArticlePostRequest) | null
}

export const useArticleStore = create<ArticleStore>(set => ({
    image: null,
    mealDate: new Date().toISOString().split('T')[0],
    mealTime: '',
    restaurant: null,
    taggedMemberIds: [],
    method: 'ALBUM',
    buildRequest: (cdnUrl: string): ArticlePostRequest => {
        const restaurant = useArticleStore.getState().restaurant as RestaurantInfo

        return {
            imageUrl: cdnUrl,
            mealDate: useArticleStore.getState().mealDate,
            restaurant: mapRestaurantInfoToKakaoRestaurant(restaurant),
            taggedMembersId: useArticleStore.getState().taggedMemberIds
        }
    },
    setImage: image => set({ image }),
    // setMealDate: mealDate => set({ mealDate }),
    setMealTime: mealTime => set({ mealTime }),
    setRestaurant: restaurant => set({ restaurant }),
    setTaggedMemberIds: taggedMemberIds => set({ taggedMemberIds }),
    setMethod: method => set({ method })
}))
