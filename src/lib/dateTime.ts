const KOREA_TIME_ZONE = 'Asia/Seoul'
const EXPLICIT_TIME_ZONE_PATTERN = /(Z|[+-]\d{2}:?\d{2})$/i

export const parseKoreanDateTime = (value: string): Date => {
    const normalized = EXPLICIT_TIME_ZONE_PATTERN.test(value)
        ? value
        : `${value}+09:00`

    return new Date(normalized)
}

export const formatKoreanDateTime = (value: string): string => {
    const date = parseKoreanDateTime(value)
    const parts = new Intl.DateTimeFormat('ko-KR', {
        timeZone: KOREA_TIME_ZONE,
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).formatToParts(date)

    const part = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find(item => item.type === type)?.value ?? ''

    return `${part('month')}월 ${part('day')}일 ${part('dayPeriod')} ${part('hour')}시 ${Number(part('minute'))}분`
}

export const formatRelativeKoreanTime = (value: string): string => {
    const diffMs = Date.now() - parseKoreanDateTime(value).getTime()
    const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))

    if (diffMinutes < 1) return '방금 전'
    if (diffMinutes < 60) return `${diffMinutes}분 전`

    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}시간 전`

    return `${Math.floor(diffHours / 24)}일 전`
}

export const formatRecruitExpiresIn = (
    createdAt: string,
    durationMs = 2 * 60 * 60 * 1000
): string => {
    const expiresAt = parseKoreanDateTime(createdAt).getTime() + durationMs
    const timeLeft = expiresAt - Date.now()

    if (timeLeft <= 0) return '종료됨'

    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

    if (hours <= 0) return `${minutes}분 후 종료`
    return `${hours}시간 ${minutes}분 후 종료`
}

export const getKoreanDatePart = (value: string | Date = new Date()) => {
    const date = typeof value === 'string' ? parseKoreanDateTime(value) : value
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: KOREA_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(date)

    const part = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find(item => item.type === type)?.value ?? ''

    return `${part('year')}-${part('month')}-${part('day')}`
}

export const buildKoreanOffsetDateTime = ({
    datePart,
    period,
    hour,
    minute
}: {
    datePart: string
    period: '오전' | '오후'
    hour: number
    minute: number
}) => {
    const normalizedHour = ((hour - 1 + 12) % 12) + 1
    const hour24 =
        period === '오전'
            ? normalizedHour === 12
                ? 0
                : normalizedHour
            : normalizedHour === 12
              ? 12
              : normalizedHour + 12

    return `${datePart}T${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+09:00`
}
