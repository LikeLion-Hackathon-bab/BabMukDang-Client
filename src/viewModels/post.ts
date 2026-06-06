import type { ArticleSummaryResponse } from '@/apis'
import type { MealTimeText } from '@/constants/post'

/**
 * 홈 피드 게시글 카드 화면 view model.
 *
 * API view model(`ArticleSummaryResponse`)에서 카드가 실제로 쓰는 필드만 좁힌다.
 * `mealTime`은 칩 표시용 카테고리(`MealTimeText`)로 노출한다. API는 `LocalTime`을
 * 주므로 식사 시간대 카테고리 매핑이 붙기 전까지는 호출부에서 변환/캐스팅한다.
 */
export type PostCardView = Pick<
    ArticleSummaryResponse,
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
