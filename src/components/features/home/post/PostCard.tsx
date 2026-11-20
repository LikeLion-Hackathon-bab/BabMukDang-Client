import { PostCardContent, PostCardHeader } from '@/components'
import type { PostCardView } from '@/viewModels'

export function PostCard({
    post,
    isComment = false
}: {
    post: PostCardView
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
                mealTime={post.mealTime}
                isComment={isComment}
            />
        </div>
    )
}
