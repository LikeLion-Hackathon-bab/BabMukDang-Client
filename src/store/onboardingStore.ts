import { create } from 'zustand'
import { persist, PersistOptions } from 'zustand/middleware'
import type { Food } from '@kimdaegyu/babmukdang-shared/domain'

type OnboardingProfileDraft = {
    username: string
    profileImageUrl: string | null
    profileImageFile: File | null
    bio: string | null
}

type OnboardingPreferenceDraft = {
    liked: Food[]
    disliked: Food[]
    allergy: Food[]
}

export type OnboardingDraftState = OnboardingProfileDraft &
    OnboardingPreferenceDraft

type OnboardingStore = OnboardingDraftState & {
    setProfileDraft: (
        profile: Partial<Omit<OnboardingProfileDraft, 'profileImageFile'>>
    ) => void
    setProfileImageFile: (file: File | null) => void
    setLikedFoods: (liked: Food[]) => void
    setDislikedFoods: (disliked: Food[]) => void
    setAllergyFoods: (allergy: Food[]) => void
    resetOnboardingDraft: () => void
}

const initialState: OnboardingDraftState = {
    username: '',
    profileImageUrl: null,
    profileImageFile: null,
    bio: null,
    liked: [],
    disliked: [],
    allergy: []
}

type PersistedOnboardingState = Omit<OnboardingDraftState, 'profileImageFile'>

const persistConfig: PersistOptions<OnboardingStore, PersistedOnboardingState> =
    {
        name: 'onboarding-draft-storage',
        partialize: state => ({
            username: state.username,
            profileImageUrl: state.profileImageUrl,
            bio: state.bio,
            liked: state.liked,
            disliked: state.disliked,
            allergy: state.allergy
        })
    }

export const useOnboardingStore = create<OnboardingStore>()(
    persist(
        set => ({
            ...initialState,
            setProfileDraft: profile =>
                set(state => ({
                    username: profile.username ?? state.username,
                    profileImageUrl:
                        profile.profileImageUrl === undefined
                            ? state.profileImageUrl
                            : profile.profileImageUrl,
                    bio: profile.bio === undefined ? state.bio : profile.bio
                })),
            setProfileImageFile: file =>
                set(state => ({
                    profileImageFile: file,
                    profileImageUrl: file ? null : state.profileImageUrl
                })),
            setLikedFoods: liked => set({ liked }),
            setDislikedFoods: disliked => set({ disliked }),
            setAllergyFoods: allergy => set({ allergy }),
            resetOnboardingDraft: () => set(initialState)
        }),
        persistConfig
    )
)
