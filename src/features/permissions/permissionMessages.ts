import type { PermissionStatus } from '@/apis/types'

export const permissionStatusMessages: Record<PermissionStatus, string> = {
    GRANTED: '권한이 허용되었습니다.',
    DENIED: '기기 설정에서 권한을 다시 허용해야 사용할 수 있습니다.',
    PROMPT: '권한 요청 창에서 허용을 선택해 주세요.',
    LIMITED: '일부 기능만 허용된 상태입니다.',
    UNKNOWN: '권한 상태를 확인하지 못했습니다. 다시 시도해 주세요.',
    UNSUPPORTED: '현재 환경에서는 이 권한을 사용할 수 없습니다.'
}

export const nearbyExposureRequirementMessages: Record<string, string> = {
    LOCATION_PERMISSION: '기기 위치 권한을 허용해야 합니다.',
    SERVICE_LOCATION_CONSENT: '서비스 위치 기반 밥약 동의가 필요합니다.',
    NEARBY_EXPOSURE_TOGGLE: '근처 친구 노출 허용을 켜야 합니다.',
    MEAL_SUGGESTION_TOGGLE: '식사 제안 수신 허용을 켜야 합니다.',
    LAST_KNOWN_LOCATION: '현재 위치를 한 번 저장해야 합니다.'
}

export const locationPermissionErrorMessage = (status: PermissionStatus) =>
    permissionStatusMessages[status] ?? permissionStatusMessages.UNKNOWN
