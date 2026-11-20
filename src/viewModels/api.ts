import type {
    ArticleLikeResponse,
    Food,
    OnboardingStatus,
    PageArticleSummaryResponse as DomainPageArticleSummaryResponse
} from '@kimdaegyu/babmukdang-shared/domain'

export interface LocalTimeView {
    hour: number
    minute: number
    second: number
    nano: number
}

export interface RestaurantInputView {
    placeId: string
    placeName: string
    addressName: string
    roadAddressName: string
    phoneNumber: string
    placeUrl: string
    distance?: string
    categoryGroupCode: string
    categoryGroupName: string
    categoryName: string
    x: number
    y: number
}

export interface RestaurantCardView {
    id: string
    place_name: string
    category_name: string
    category_group_name: string
    distance: string
    road_address_name: string
    address_name: string
    phone: string
    selectUsers: string[]
    place_url?: string
}

export interface ArticleSummaryView {
    articleId: number
    authorId: number
    authorUsername: string
    imageUrl: string
    mealDate: string
    mealTime: LocalTimeView
    restaurantName: string
    likeCount: number
    commentCount: number
    likedByMe: boolean
    createdAt: string
    expiresAt: string
    taggedMemberIds: number[]
}

export interface ArticleDetailView extends ArticleSummaryView {
    restaurant: RestaurantInputView
    comments?: CommentView[]
}

export interface CommentView {
    commentId: number
    authorId: number
    authorUsername: string
    parentCommentId: number | null
    content: string
    createdAt: string
    profileImageUrl?: string | null
    distance?: string
    replies?: CommentView[]
}

export interface ArticlePageView {
    items: ArticleSummaryView[]
    content: ArticleSummaryView[]
    meta: DomainPageArticleSummaryResponse['meta']
    totalElements: number
    totalPages: number
    first: boolean
    last: boolean
    size: number
    number: number
    numberOfElements: number
    empty: boolean
}

export type ArticleLikeView = ArticleLikeResponse

export interface ProfileSummaryView {
    memberId: number
    userName: string
    username: string
    profileImageUrl: string
    bio: string
    meetingCount: number
    onboardingStatus: OnboardingStatus
    onboardingCompletedAt: string | null
}

export interface ProfileDetailView {
    memberId: number
    userName: string
    username: string
    profileImageUrl: string
    bio: string
    meetingCount: number
    likes: Food[]
    dislikes: Food[]
    allergies: Food[]
    friendConunt: number
    completedPlans: number
    uncompletedPlans: number
    onboardingStatus: OnboardingStatus
    onboardingCompletedAt: string | null
}

export interface MealPlanParticipantView {
    participantId: string
    memberId: number | null
    guestId: string | null
    name: string
    profileImageUrl: string | null
    role: 'OWNER' | 'FRIEND' | 'GUEST'
    status: string
}

export interface MealPlanCardView {
    mealPlanId: string
    title: string
    status: string
    group: string
    participantCount: number
    scheduleText: string
    placeText: string
    primaryActionLabel: string
    updatedAt: string
}

export type PreferenceMetaView = {
    likes?: Food[]
    dislikes?: Food[]
    allergies?: Food[]
}
