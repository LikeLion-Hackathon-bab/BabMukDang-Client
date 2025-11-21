import { PostCardContent, PostCardHeader, PostCardFooter } from '@/components'
import { useLikeArticle } from '@/query'
import { useNavigate } from 'react-router-dom'
import { MealTimeText } from '@/constants/post'
import { Article } from '@kimdaegyu/babmukdang-shared'

export function PostCard({
    post,
    isComment = false
}: {
    post: Article
    isComment?: boolean
}) {
    return (
        <div className="flex w-full flex-col gap-12">
            <PostCardHeader
                authorId={Number(post.author.userId)}
                authorUsername={post.author.username}
                tags={post.taggedMemberIds?.map(id => Number(id))}
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
            <PostCardFooter restaurantInfo={post.restaurant} />
        </div>
    )
}
