import { Link } from '@/navigation'

export function TestPage() {
    const features = [
        {
            path: '/gps',
            title: 'GPS 위치 서비스',
            description: '실시간 위치 추적 및 오프라인 캐싱',
            icon: '📍',
            color: 'bg-green-500'
        },
        {
            path: '/camera',
            title: '카메라 & 갤러리',
            description: '사진 촬영 및 이미지 처리',
            icon: '📷',
            color: 'bg-blue-500'
        },
        {
            path: '/notifications',
            title: '알림 시스템',
            description: '로컬 및 푸시 알림',
            icon: '🔔',
            color: 'bg-yellow-500'
        },
        {
            path: '/push',
            title: '서버 푸시',
            description: 'Push API를 활용한 서버 푸시',
            icon: '📤',
            color: 'bg-orange-500'
        },
        {
            path: '/websocket',
            title: '실시간 통신',
            description: '웹소켓 연결 및 메시징',
            icon: '🔌',
            color: 'bg-purple-500'
        },
        {
            path: '/onboarding',
            title: '온보딩 페이지',
            description: '온보딩 페이지 테스트',
            icon: '🚀',
            color: 'bg-green-500'
        },
        {
            path: '/socket-test/1?userId=userA&username=Alice',
            title: '소켓 게이트웨이 테스트',
            description: '토큰 인증, 룸 조인, 이벤트 송수신',
            icon: '🧪',
            color: 'bg-pink-500'
        },
        {
            path: '/location-selection',
            title: '위치 선택',
            description: '만날 장소 선택 및 투표',
            icon: '🗺️',
            color: 'bg-indigo-500'
        },
        {
            path: 'https://babmuckdang.site/oauth2/authorization/kakao',
            title: '로그인',
            description: '카카오 로그인',
            icon: '�',
            color: 'bg-yellow-500'
        }
    ]

    return (
        <div className="p-4">
            <div className="mb-8 text-center">
                <h1 className="mb-2 text-2xl font-bold text-gray-900">
                    PWA 모바일 기능
                </h1>
                <p className="text-gray-600">
                    모바일 최적화된 Progressive Web App
                </p>
            </div>

            <div className="grid gap-4">
                {features.map(feature => (
                    <Link
                        key={feature.path}
                        to={feature.path}
                        className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center space-x-4">
                            <div
                                className={`h-12 w-12 rounded-lg ${feature.color} flex items-center justify-center text-xl text-white`}>
                                {feature.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="mb-1 font-semibold text-gray-900">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                            <div className="text-gray-400">
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
