import type { MeetingCardView as ApiMeetingCardView } from './api'

/**
 * 모임 카드 화면 view model.
 * API adapter가 만든 client-side MeetingCardView를 그대로 사용한다.
 */
export type MeetingCardView = ApiMeetingCardView

/**
 * 모임 헤더 화면 view model.
 * 헤더는 참여자/장소/시간만 사용하므로 좁혀서 노출한다.
 */
export type MeetingHeaderView = Pick<
    ApiMeetingCardView,
    'participants' | 'location' | 'time'
>
