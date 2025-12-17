import { PostCardContent, PostCardHeader, PostCardFooter } from '@/components'
import { useLikeArticle } from '@/query'
import { useNavigate } from 'react-router-dom'
import { MealTimeText } from '@/constants/post'
type Post = {
    articleId: number
    authorId: number
    authorUsername: string
    imageUrl: string
    mealDate: string
    mealTime: string
    restaurantName: RestaurantInfo
    likeCount: number
    commentCount: number
    likedByMe: boolean
    createdAt: string
    expiresAt: string
    taggedMemberIds: number[]
}

type RestaurantInfo = {
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

export function PostCard({
    post,
    isComment = false
}: {
    post: Post
    isComment?: boolean
}) {
    return (
        <div className="flex w-full flex-col gap-12">
            <PostCardHeader
                authorId={post.authorId}
                authorUsername={post.authorUsername}
                tags={post.taggedMemberIds}
                postedAt={post.createdAt}
            />
            <PostCardContent
                postImageUrl={post.imageUrl}
                postId={post.articleId}
                likedByMe={post.likedByMe}
                likeCount={post.likeCount}
                commentCount={post.commentCount}
                mealTime={post.mealTime as MealTimeText}
                isComment={isComment}
            />
            {/* <PostCardFooter restaurantInfo={post.restaurantName} /> */}
        </div>
    )
}
