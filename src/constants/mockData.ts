import { CommentResponse, RestaurantInfo } from '@/apis/dto'
import { MeetingResponse } from '@/apis/meeting'
import { PreferenceItem, ProfileDetailResponse } from '@/apis/profile'

export const MockAnnouncements = [
    {
        id: 1,
        title: '7시 학교 앞에서\n밥 먹을 사람!',
        time: '8월 7일 오후 7시',
        location: '서울과학기술대학교 정문 앞',
        participants: [{ name: '김대규' }, { name: '김성휘' }],
        maxParticipants: 3,
        timeLeft: '30분 후 종료',
        creator: { name: '유가은' }
    },
    {
        id: 2,
        title: '같이 커피 마실 사람\n구해요!',
        time: '8월 8일 오후 3시',
        location: '홍대입구역 2번 출구',
        participants: [{ name: '이민수' }],
        maxParticipants: 4,
        timeLeft: '1시간 후 종료',
        creator: { name: '박소영' }
    },
    {
        id: 3,
        title: '밥 먹을 사람 구해요!',
        time: '8월 8일 오후 8시',
        location: '강남 CGV',
        participants: [
            { name: '최지훈' },
            { name: '김하늘' },
            { name: '정우진' }
        ],
        maxParticipants: 4,
        timeLeft: '2시간 후 종료',
        creator: { name: '이서연' }
    },
    {
        id: 4,
        title: '배달 시켜먹을 사람 구해요!',
        time: '8월 9일 오후 6시',
        location: '국립중앙도서관',
        participants: [{ name: '강민지' }],
        maxParticipants: 5,
        timeLeft: '3시간 후 종료',
        creator: { name: '윤성호' }
    },
    {
        id: 5,
        title: '고독한 미식가 구해요!',
        time: '8월 10일 오전 7시',
        location: '북한산 입구',
        participants: [{ name: '조현우' }, { name: '김태영' }],
        maxParticipants: 6,
        timeLeft: '5시간 후 종료',
        creator: { name: '이동현' }
    },
    {
        id: 6,
        title: '밥 먹을 사람 구해요!',
        time: '8월 8일 오후 7시',
        location: '홍대',
        participants: [{ name: '박준혁' }],
        maxParticipants: 4,
        timeLeft: '4시간 후 종료',
        creator: { name: '최은아' }
    }
]

export const MockCouponList = [
    {
        isUsed: true,
        restaurantName: '동학 주점',
        discount: 2000,
        couponImageUrl: '/test/coupon-restaurant.png',
        expirationDate: '2025년 9월 16일까지',
        couponType: '서비스'
    },
    {
        isUsed: true,
        restaurantName: '동학 주점',
        discount: 2000,
        couponImageUrl: '/test/coupon-restaurant.png',
        expirationDate: '2025년 9월 16일까지',
        couponType: '할인'
    },
    {
        isUsed: false,
        restaurantName: '동학 주점',
        discount: 2000,
        couponImageUrl: '/test/coupon-restaurant.png',
        expirationDate: '2025년 9월 16일까지',
        couponType: '서비스'
    },
    {
        isUsed: false,
        restaurantName: '동학 주점',
        discount: 2000,
        couponImageUrl: '/test/coupon-restaurant.png',
        expirationDate: '2025년 9월 16일까지',
        couponType: '서비스'
    }
]
export const MockMatchingInviteNotis = [
    {
        id: 1,
        type: 'invitation',
        title: '매칭하기 초대장',
        time: '20분 전',
        message: '가은님이 초대장을 보냈어요! 지금 확인해보고, 답장해봐요!',
        period: '',
        imageUrl: '' // TODO: add image if needed
    },
    {
        id: 2,
        type: 'announcement',
        title: '공고 알림',
        time: '20분 전',
        message: '가은님이 초대장을 보냈어요! 지금 확인해보고, 답장해봐요!',
        period: '',
        imageUrl: '' // TODO: add image if needed
    }
]
export const MockLocalNewsNotis = [
    {
        id: 2,
        type: 'school',
        title: '여기 꼬치네 공릉역점',
        time: '20분 전',
        message: '여름 방학 맞이 사장님이 아이스크림 쏜다!',
        period: '~2025.8.31까지 · 진행중',
        imageUrl: '' // TODO: add image if needed
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

type MyProfileData = {
    profileImgUrl: string
    userName: string
    bio: string
    likes: PreferenceItem[]
    dislikes: PreferenceItem[]
    allergies: PreferenceItem[]
    meetingCount: number
}

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
type FriendProfileData = {
    profileImgUrl: string
    name: string
    description: string
    preferredMenus: string[]
    cantEat: string[]
}

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
type Meeting = {
    id: number
    participants: { name: string; userId: number }[]
    location: string
    time: string
    restaurant: string
    isCompleted: boolean
    restaurantType: string
}

export const MockMeetingList: MeetingResponse[] = [
    {
        id: 1,
        participants: [
            { name: '서은우', userId: 1 },
            { name: '유가은', userId: 2 }
        ],
        location: '서울과학기술대학교 정문 앞',
        time: '8월 27일 오후 2:30',
        restaurant: '동학 주점',
        isCompleted: false,
        restaurantType: '한식'
    },
    {
        id: 2,
        participants: [
            { name: '서은우', userId: 1 },
            { name: '유가은', userId: 2 }
        ],
        location: '상상관 1층 앞',
        time: '8월 27일 오후 2:30',
        restaurant: '오하이요',
        isCompleted: false,
        restaurantType: '일식'
    },
    {
        id: 3,
        participants: [
            { name: '서은우', userId: 1 },
            { name: '유가은', userId: 2 }
        ],
        location: '서울과학기술대학교 정문 앞',
        time: '8월 27일 오후 2:30',
        restaurant: '동학 주점',
        isCompleted: true,
        restaurantType: '한식'
    }
]

type Friend = {
    userId: number
    name: string
    lastActive: string
    isHungry: boolean
}
export const MockFriendList = [
    {
        userId: 1,
        name: '유가은',
        lastActive: '2025-01-01 12:00',
        isHungry: true
    },
    {
        userId: 2,
        name: '서은우',
        lastActive: '2025-01-01 12:00',
        isHungry: false
    },
    {
        userId: 3,
        name: '김대규',
        lastActive: '2025-01-01 12:00',
        isHungry: true
    },
    {
        userId: 4,
        name: '김성휘',
        lastActive: '2025-01-01 12:00',
        isHungry: false
    },
    {
        userId: 5,
        name: '이민수',
        lastActive: '2025-01-01 12:00',
        isHungry: true
    },
    {
        userId: 6,
        name: '박소영',
        lastActive: '2025-01-01 12:00',
        isHungry: false
    }
]

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
            },
            {
                commentId: 2,
                authorId: 102,
                authorUsername: 'Bob',
                parentCommentId: 1,
                content: 'Alice님 댓글에 답글 남겨요 😃',
                createdAt: '2025-08-24T10:05:00Z'
            },
            {
                commentId: 3,
                authorId: 103,
                authorUsername: 'Charlie',
                parentCommentId: 1,
                content: '저도 첫 댓글에 의견 남깁니다.',
                createdAt: '2025-08-24T10:07:00Z'
            },
            {
                commentId: 4,
                authorId: 104,
                authorUsername: 'David',
                parentCommentId: 2,
                content: 'Bob님 말씀에 동의합니다!',
                createdAt: '2025-08-24T10:10:00Z'
            },
            {
                commentId: 5,
                authorId: 105,
                authorUsername: 'Eve',
                parentCommentId: 0,
                content: '두 번째 루트 댓글 ✨',
                createdAt: '2025-08-24T11:00:00Z'
            },
            {
                commentId: 6,
                authorId: 106,
                authorUsername: 'Frank',
                parentCommentId: 5,
                content: 'Eve님 댓글에 답글 남깁니다~',
                createdAt: '2025-08-24T11:05:00Z'
            }
        ]
    },
    {
        postId: 2,
        author: '유가은',
        tags: ['김대규', '김성휘', '이민수', '박소영'],
        postedAt: '2025-08-23 12:00',
        postImageUrl: '/test/card-post.png',
        postType: 'lunch',
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
                profileImageUrl: 'https://picsum.photos/200/300',
                authorUsername: '유가은',
                content: '댓글 1',
                createdAt: '2025-01-01 12:00',
                authorId: 1,
                parentCommentId: 0
            }
        ]
    },
    {
        postId: 3,
        author: '유가은',
        tags: ['김대규', '김성휘', '이민수', '박소영'],
        postedAt: '2025-08-23 18:00',
        postImageUrl: '/test/card-post.png',
        postType: 'dinner',
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
                profileImageUrl: 'https://picsum.photos/200/300',
                authorUsername: '유가은',
                content: '댓글 1',
                createdAt: '2025-01-01 12:00',
                authorId: 1,
                parentCommentId: 0
            }
        ]
    },
    {
        postId: 4,
        author: '유가은',
        tags: ['김대규', '김성휘', '이민수', '박소영'],
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
                profileImageUrl: 'https://picsum.photos/200/300',
                authorUsername: '유가은',
                content: '댓글 1',
                createdAt: '2025-01-01 12:00',
                authorId: 1,
                parentCommentId: 0
            }
        ]
    }
]
