/**
 * @fileoverview Mock Data (레거시)
 *
 * @deprecated 이 파일의 데이터는 src/mocks/fixtures로 마이그레이션되었습니다.
 * 새 코드에서는 @/mocks/fixtures를 사용하세요.
 *
 * @example
 * // 기존 (deprecated)
 * import { MockAnnouncements } from '@/constants/mockData'
 *
 * // 새로운 방식
 * import { mockPostResponses } from '@/mocks/fixtures'
 */

// ============================================================================
// 기존 코드 호환성을 위한 re-export
// ============================================================================

// Post (모집글/공지)
export { mockPostResponses as MockAnnouncements } from '@/mocks/fixtures/post.fixtures'

// Coupon (쿠폰)
export { mockCouponResponses as MockCouponList } from '@/mocks/fixtures/coupon.fixtures'

// Meeting (모임) - 화면 view model (mapper 결과)
export { MockMeetingList } from '@/mocks/fixtures/meeting.fixtures'

// Friend (친구)
export { mockFriendMealResponses as MockFriendList } from '@/mocks/fixtures/friend.fixtures'

// ============================================================================
// 마이그레이션되지 않은 레거시 데이터
// (fixtures에 적합하지 않거나 특수 용도)
// ============================================================================

import type {
    CommentResponse,
    RestaurantInfo,
    PreferenceItem,
    ProfileDetailResponse
} from '@/apis'

/**
 * 매칭 초대 알림 mock 데이터
 * @deprecated fixtures로 마이그레이션 예정
 */
export const MockMatchingInviteNotis = [
    {
        id: 1,
        type: 'invitation',
        title: '매칭하기 초대장',
        time: '20분 전',
        message: '가은님이 초대장을 보냈어요! 지금 확인해보고, 답장해봐요!',
        period: '',
        imageUrl: ''
    },
    {
        id: 2,
        type: 'announcement',
        title: '공고 알림',
        time: '20분 전',
        message: '가은님이 초대장을 보냈어요! 지금 확인해보고, 답장해봐요!',
        period: '',
        imageUrl: ''
    }
]

/**
 * 지역 뉴스 알림 mock 데이터
 * @deprecated fixtures로 마이그레이션 예정
 */
export const MockLocalNewsNotis = [
    {
        id: 2,
        type: 'school',
        title: '여기 꼬치네 공릉역점',
        time: '20분 전',
        message: '여름 방학 맞이 사장님이 아이스크림 쏜다!',
        period: '~2025.8.31까지 · 진행중',
        imageUrl: ''
    },
    {
        id: 3,
        type: 'restaurant',
        title: '여기 꼬치네 공릉역점',
        time: '20분 전',
        message: '여름 방학 맞이 사장님이 아이스크림 쏜다!',
        period: '~2025.6.31까지 · 종료',
        imageUrl: ''
    }
]

/**
 * 내 프로필 mock 데이터
 * @deprecated fixtures로 마이그레이션됨 - mockProfileDetail 사용
 */
export const MockMyProfileData: ProfileDetailResponse = {
    memberId: 1,
    profileImageUrl: '/src/assets/icons/icon_profile_default.svg',
    userName: '서은우',
    bio: '기억이 아닌 추억으로',
    likes: [
        { code: '한식', label: '한식' },
        { code: '일식', label: '일식' },
        { code: '양식', label: '양식' },
        { code: '분식', label: '분식' }
    ],
    allergies: [
        { code: '락토', label: '락토' },
        { code: '락토 오보', label: '락토 오보' },
        { code: '락토 오보 오보', label: '락토 오보 오보' }
    ],
    dislikes: [
        { code: '향신료', label: '향신료' },
        { code: '락토', label: '락토' },
        { code: '락토 오보', label: '락토 오보' },
        { code: '락토 오보 오보', label: '락토 오보 오보' }
    ],
    meetingCount: 0
}

/**
 * 친구 프로필 mock 데이터
 * @deprecated fixtures로 마이그레이션 예정
 */
export const MockFriendProfileData = {
    profileImgUrl: '/src/assets/icons/icon_profile_default.svg',
    name: '유가은',
    description: '반갑습니다',
    preferredMenus: ['한식', '일식', '양식', '분식'],
    cantEat: ['향신료', '락토', '락토 오보', '락토 오보 오보'],
    friends: 100,
    completedMeetings: 100,
    uncompletedMeetings: 100,
    posts: [
        {
            id: 1,
            content: '안녕하세요! 서은우입니다.',
            createdAt: '2025-01-01'
        }
    ]
}

/**
 * 게시글 목록 mock 데이터 (상세 정보 포함)
 * @deprecated fixtures의 mockArticleSummaries 사용 권장
 */
export const MockPostList: {
    postId: number
    author: string
    tags: string[]
    postedAt: string
    postImageUrl: string
    postType: string
    restaurantInfo: RestaurantInfo
    comments: CommentResponse[]
}[] = [
    {
        postId: 1,
        author: '유가은',
        tags: ['김대규', '김성휘', '이민수'],
        postedAt: '2025-08-23 12:00',
        postImageUrl: '/test/card-post.png',
        postType: 'mornings',
        restaurantInfo: {
            placeId: '1234567890',
            placeName: '더 맛있는 일식집',
            categoryName: '일식집',
            roadAddressName: '서울시 노원구 공릉동 30-2',
            distance: '300m',
            addressName: '서울시 노원구 공릉동 30-2',
            phoneNumber: '010-1234-5678',
            placeUrl: 'https://www.google.com',
            categoryGroupCode: '1234567890',
            categoryGroupName: '일식집',
            x: 127.06112,
            y: 37.65141
        },
        comments: [
            {
                commentId: 1,
                authorId: 101,
                authorUsername: 'Alice',
                parentCommentId: 0,
                content: '첫 번째 댓글입니다!',
                createdAt: '2025-08-24T10:00:00Z'
            }
        ]
    }
]
