import {
    ArticlePostRequestDto,
    RestaurantInfo
} from '@kimdaegyu/babmukdang-shared'
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
    buildRequest: ((cdnUrl: string) => ArticlePostRequestDto) | null
}

export const useArticleStore = create<ArticleStore>(set => ({
    image: null,
    mealDate: new Date().toISOString().split('T')[0],
    mealTime: '',
    restaurant: null,
    taggedMemberIds: [],
    method: 'ALBUM',
    buildRequest: (cdnUrl: string): ArticlePostRequestDto => {
        return {
            imageUrl: cdnUrl,
            method: useArticleStore.getState().method,
            mealDate: useArticleStore.getState().mealDate,
            mealTime: useArticleStore.getState().mealTime,
            restaurant: useArticleStore.getState().restaurant as RestaurantInfo,
            taggedMemberIds: useArticleStore.getState().taggedMemberIds
        } as ArticlePostRequestDto
    },
    setImage: image => set({ image }),
    // setMealDate: mealDate => set({ mealDate }),
    setMealTime: mealTime => set({ mealTime }),
    setRestaurant: restaurant => set({ restaurant }),
    setTaggedMemberIds: taggedMemberIds => set({ taggedMemberIds }),
    setMethod: method => set({ method })
}))
