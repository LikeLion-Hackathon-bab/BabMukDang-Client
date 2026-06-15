export const recruitRouteMap = {
    active: 4,
    location: 1,
    'location-vote': 2,
    'exclude-menu': 3,
    menu: 4,
    restaurant: 5
}
export const invitationRouteMap = {
    active: 5,
    date: 1,
    time: 2,
    location: 3,
    'location-vote': 4,
    'exclude-menu': 5,
    menu: 6,
    restaurant: 7
}

export const recruitRouteTitleMap = {
    active: '각자 가능한 선택을 동시에 정해보아요.',
    location: '만날 장소를 더 구체화 해봐요.',
    'location-vote': '만날 장소를 정해보아요.',
    'exclude-menu': '최근에 먹은 메뉴예요.\n또 먹어도 괜찮아요?',
    menu: '오늘의 메뉴를 골라보아요.',
    restaurant: '만남 장소 근처 맛집 중 골라보아요.'
}

export const invitationRouteTitleMap = {
    active: '날짜, 장소, 메뉴를 함께 정해보아요.',
    date: '만날 날짜를 정해보아요.',
    time: '만날 시간을 정해보아요.',
    location: '만날 장소를 정해보아요.',
    'location-vote': '만날 장소를 정해보아요.',
    'exclude-menu': '최근에 먹은 메뉴예요.\n또 먹어도 괜찮아요?',
    menu: '오늘의 메뉴를 골라보아요.',
    restaurant: '만남 장소 근처 맛집 중 골라보아요.'
}

export const recruitRouteDescriptionMap = {
    active: '열려 있는 항목은 바로 선택할 수 있고, 결과는 실시간으로 반영돼요.',
    location:
        '지도에 위치를 클릭하거나, 장소 검색을 통해 장소를 추가 할 수 있어요.\n장소 추가 후 투표해보아요! '
}

export const invitationRouteDescriptionMap = {
    active: '날짜와 시간, 장소와 메뉴를 기다리지 않고 병렬로 선택할 수 있어요.',
    date: '함께 시간을 보낼 수 있는 날짜를 모두 골라주세요!',
    time: '가능한 시간대를 모두 선택해주세요.',
    location:
        '지도에 위치를 클릭하거나, 장소 검색을 통해 장소를 추가 할 수 있어요.\n장소 추가 후 투표해보아요! '
}

export const recruitRouteVoteLimitMap = {
    active: '작업별 선택',
    location: '1인 최대 2개 추가',
    'location-vote': '1인 1투표',
    'exclude-menu': '중복 투표',
    menu: '중복 투표',
    restaurant: '1인 1투표'
}

export const invitationRouteVoteLimitMap = {
    active: '작업별 선택',
    date: '중복 투표',
    time: '1인 1투표',
    location: '1인 최대 2개 추가',
    'location-vote': '1인 1투표',
    'exclude-menu': '중복 투표',
    menu: '중복 투표',
    restaurant: '1인 1투표'
}

