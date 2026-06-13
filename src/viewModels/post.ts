import type { ArticleSummaryView } from './api'
import type { MealTimeText } from '@/constants/post'

/**
 * 홈 피드 게시글 카드 화면 view model.
 *
 * API view model(`ArticleSummaryView`)에서 카드가 실제로 쓰는 필드만 좁힌다.
 * `mealTime`은 칩 표시용 카테고리(`MealTimeText`)로 노출한다. API는 `LocalTime`을
 * 주므로 식사 시간대 카테고리 매핑이 붙기 전까지는 호출부에서 변환/캐스팅한다.
 */
export type PostCardView = Pick<
    ArticleSummaryView,
    | 'articleId'
    | 'authorId'
    | 'authorUsername'
    | 'imageUrl'
    | 'likeCount'
    | 'commentCount'
    | 'likedByMe'
    | 'createdAt'
    | 'taggedMemberIds'
> & {
    mealTime: MealTimeText
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Article 요약 API view model을 PostCard view model로 변환한다.
 * `mealTime`(LocalTime)을 칩 표시용 `HH:mm:ss` 문자열로 포맷한다.
 * (식사 시간대 카테고리 매핑이 붙기 전까지의 표현)
 */
export const toPostCardView = (
    article: ArticleSummaryView
): PostCardView => ({
    articleId: article.articleId,
    authorId: article.authorId,
    authorUsername: article.authorUsername,
    imageUrl: article.imageUrl,
    likeCount: article.likeCount,
    commentCount: article.commentCount,
    likedByMe: article.likedByMe,
    createdAt: article.createdAt,
    taggedMemberIds: article.taggedMemberIds,
    mealTime:
        `${pad(article.mealTime.hour)}:${pad(article.mealTime.minute)}:${pad(article.mealTime.second)}` as MealTimeText
})
