/**
 * @fileoverview View Model 통합 진입점 (Barrel File)
 *
 * 컴포넌트 prop에는 API 응답 DTO를 직접 노출하지 않고,
 * 화면에 필요한 필드만 좁힌 view model 타입을 사용한다.
 */

export type { MeetingCardView, MeetingHeaderView } from './meeting'
export type { PostCardView } from './post'
export { toPostCardView } from './post'
