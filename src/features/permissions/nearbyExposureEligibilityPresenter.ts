import type { NearbyFriendExposureEligibility } from '@/apis/types'

type MissingRequirement =
    NearbyFriendExposureEligibility['missingRequirements'][number]

export type MissingRequirementCta = {
    requirement: MissingRequirement
    title: string
    description: string
    ctaLabel: string
    action:
        | 'REQUEST_LOCATION_PERMISSION'
        | 'ENABLE_SERVICE_CONSENT'
        | 'ENABLE_NEARBY_EXPOSURE'
        | 'ENABLE_MEAL_SUGGESTION'
        | 'SYNC_LOCATION'
}

const ctaByRequirement: Record<
    MissingRequirement,
    Omit<MissingRequirementCta, 'requirement'>
> = {
    LOCATION_PERMISSION: {
        title: '기기 위치 권한이 필요합니다.',
        description:
            '근처 친구에게만 노출하려면 현재 위치를 확인할 수 있어야 합니다.',
        ctaLabel: '위치 권한 허용하기',
        action: 'REQUEST_LOCATION_PERMISSION'
    },
    SERVICE_LOCATION_CONSENT: {
        title: '서비스 위치 동의가 필요합니다.',
        description: '밥먹당 안에서 위치 기반 밥약 기능 사용에 동의해 주세요.',
        ctaLabel: '위치 기반 기능 동의하기',
        action: 'ENABLE_SERVICE_CONSENT'
    },
    NEARBY_EXPOSURE_TOGGLE: {
        title: '근처 친구 노출 허용이 꺼져 있습니다.',
        description: '내 밥약을 조건에 맞는 친구에게 보여주도록 허용해 주세요.',
        ctaLabel: '노출 허용 켜기',
        action: 'ENABLE_NEARBY_EXPOSURE'
    },
    MEAL_SUGGESTION_TOGGLE: {
        title: '식사 제안 수신 허용이 꺼져 있습니다.',
        description:
            '친구의 밥약 제안을 주고받으려면 식사 제안 수신이 필요합니다.',
        ctaLabel: '식사 제안 켜기',
        action: 'ENABLE_MEAL_SUGGESTION'
    },
    LAST_KNOWN_LOCATION: {
        title: '현재 위치를 아직 저장하지 않았습니다.',
        description:
            '한 번만 현재 위치를 저장하면 반경 조건을 계산할 수 있습니다.',
        ctaLabel: '현재 위치 저장하기',
        action: 'SYNC_LOCATION'
    }
}

export const presentNearbyExposureMissingRequirements = (
    eligibility: NearbyFriendExposureEligibility | null | undefined
): MissingRequirementCta[] => {
    if (!eligibility?.missingRequirements.length) return []
    return eligibility.missingRequirements.map(requirement => ({
        requirement,
        ...ctaByRequirement[requirement]
    }))
}
