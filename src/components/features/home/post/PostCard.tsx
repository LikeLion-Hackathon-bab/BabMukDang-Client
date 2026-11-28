import { PostCardContent, PostCardHeader } from '@/components'
import { MealTimeText } from '@/constants/post'
type Post = {
    articleId: number
    authorId: number
    authorUsername: string
    imageUrl: string
    mealDate: string
    mealTime: string
    restaurantName: string | null
    likeCount: number
    commentCount: number
    likedByMe: boolean
    createdAt: string
    expiresAt: string
    taggedMemberIds: number[]
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
            {post.restaurantName && (
                <p className="text-body2-semibold px-16 py-8">
                    {post.restaurantName}
                </p>
            )}
        </div>
    )
}
