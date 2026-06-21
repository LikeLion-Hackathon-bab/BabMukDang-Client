import {
    HeartIcon,
    CommentIcon,
    HeartFilledIcon,
    HeartWhiteIcon
} from '@/assets/icons'
import { useLikeArticle } from '@/apis'
import type { ArticleLikeView } from '@/viewModels'
import { useState } from 'react'
import { useNavigate } from '@/navigation'
import { COLORS } from '@/constants/colors'
import { mealTimeMapReverse, MealTimeText } from '@/constants/post'

export const PostCardContent = ({
    postImageUrl,
    postId,
    isComment,
    mealTime,
    likedByMe,
    likeCount,
    commentCount
}: {
    postImageUrl: string
    postId: number
    isComment?: boolean
    mealTime: MealTimeText
    likedByMe: boolean
    likeCount: number
    commentCount: number
}) => {
    const [isLiked, setIsLiked] = useState(likedByMe)
    const onSuccess = (data?: ArticleLikeView) => {
        if (!data) return
        if (data.liked) {
            setIsLiked(true)
        } else {
            setIsLiked(false)
        }
    }
    const onError = (e: Error) => {
        setIsLiked(false)
    }
    const { mutate: likeArticle, isPending: isLikePending } = useLikeArticle({
        onSuccess,
        onError
    })
    const onClickLike = () => {
        likeArticle({ articleId: postId })
    }

    const navigate = useNavigate()
    const onClickComment = () => {
        navigate(`/post/${postId}`)
    }
    return (
        <div className="relative -ml-20 aspect-square w-screen bg-gray-200">
            <img
                src={postImageUrl}
                alt="restaurant"
                className="h-full w-full object-cover"
            />
            <PostTypeChip
                mealTime={mealTime}
                className="absolute top-16 left-20 z-10"
            />
            <div className="absolute bottom-16 left-16 flex flex-row items-center gap-14">
                <button
                    type="button"
                    data-testid={`article-like-button-${postId}`}
                    aria-label={isLiked ? '좋아요 취소' : '좋아요'}
                    disabled={isLikePending}
                    onClick={onClickLike}
                    className="flex items-center justify-center rounded-full bg-white/30 px-12 py-12 disabled:opacity-60">
                    <span className="flex items-center gap-8">
                        {isLiked ? (
                            <HeartFilledIcon className="size-16" />
                        ) : (
                            <HeartWhiteIcon className="size-16" />
                        )}
                        {likeCount > 0 && (
                            <span className="text-body2-semibold text-white">
                                {likeCount}
                            </span>
                        )}
                    </span>
                </button>
                {!isComment && (
                    <button
                        type="button"
                        data-testid={`article-comment-button-${postId}`}
                        aria-label="댓글 보기"
                        className="flex size-40 items-center justify-center rounded-full bg-white/30 p-12"
                        onClick={onClickComment}>
                        <CommentIcon
                            strokecolor={COLORS.white}
                            className="size-16"
                        />
                    </button>
                )}
            </div>
        </div>
    )
}

const PostTypeChip = ({
    mealTime,
    className
}: {
    mealTime: MealTimeText
    className?: string
}) => {
    return (
        <div
            className={`flex items-center justify-center rounded-full bg-gray-100 px-12 py-4 ${className}`}>
            <span className="text-caption-medium text-gray-700">
                {mealTimeMapReverse[mealTime]}
            </span>
        </div>
    )
}
