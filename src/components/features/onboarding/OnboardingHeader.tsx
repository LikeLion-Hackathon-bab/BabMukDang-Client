import { ProgressBar, TagPerson } from '@/components'
import { useSocket } from '@/contexts/SocketContext'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
    recruitRouteDescriptionMap,
    recruitRouteTitleMap,
    recruitRouteVoteLimitMap,
    invitationRouteDescriptionMap,
    invitationRouteTitleMap,
    invitationRouteVoteLimitMap
} from '@/constants/onboardingRoute'
import { cn } from '@/lib/utils'
export function OnboardingHeader({
    isSkipable = false,
    subTitle = ''
}: {
    isSkipable?: boolean
    subTitle?: string
}) {
    const { participants, finalStateMessage, finalState, stage } = useSocket()
    const [finalTags, setFinalTags] = useState<string[]>([])
    const pathname = useLocation()
    useEffect(() => {
        setFinalTags(
            Object.entries(finalStateMessage)
                .filter(([key, value]) => value !== undefined)
                .filter(
                    ([key, value]) => key !== pathname.pathname.split('/')[2]
                )
                .map(([key, value]) => {
                    if (key === 'exclude-menu') {
                        return (value as string[]).join(', ') + ' 제외'
                    }
                    return value as string
                })
        )
    }, [stage])

    const title = getByMatchType(
        recruitRouteTitleMap,
        invitationRouteTitleMap
    )
    const description = getByMatchType(
        recruitRouteDescriptionMap,
        invitationRouteDescriptionMap
    )

    const voteLimit = getByMatchType(
        recruitRouteVoteLimitMap,
        invitationRouteVoteLimitMap
    )
    return (
        <div className="mt-20 mb-20 -ml-20 flex w-screen flex-col gap-30">
            {/* 프로그레스 바 */}
            <ProgressBar />
            <div className="flex flex-col gap-10 px-20">
                <div className="flex flex-col gap-12">
                    {/* 태그 목록 */}
                    <div className="flex flex-row gap-8">
                        {finalTags.map(tag => finalTag(tag))}
                    </div>
                    {/* 서브 타이틀 */}
                    {subTitle && (
                        <span className="text-body2-medium text-primary-500">
                            {subTitle}
                        </span>
                    )}
                    {/* 메인 타이틀 */}
                    <span className="text-title2-semibold text-black">
                        {title}
                    </span>
                </div>
                <div className="flex flex-col gap-12">
                    {/* 투표 제한 수*/}
                    <span className="text-primary-500 text-body2-medium">
                        {voteLimit}
                    </span>
                    {/* 설명 */}
                    {description && (
                        <span className="text-caption-10 max-w-[80%] break-words text-gray-500">
                            {description}
                        </span>
                    )}
                </div>
            </div>
            {/* 건너뛰기 버튼 */}
            {isSkipable && (
                <div className="bg-gray-5 absolute top-50 right-20 rounded-full px-10 py-3">
                    <span className="text-caption-medium text-gray-200">
                        건너뛰기
                    </span>
                </div>
            )}
        </div>
    )
}

const getText = (map: any, pathname: string) => {
    return map[pathname.split('/')[2] as keyof typeof map]
}
const getByMatchType = (map1: any, map2: any) => {
    const { matchType } = useSocket()
    const { pathname } = useLocation()
    return matchType === 'recruit'
        ? getText(map1, pathname)
        : getText(map2, pathname)
}
const finalTag = (text: string) => {
    return (
        <div
            className={cn('box-border rounded-full bg-white px-6 py-5')}
            style={{
                textBox: 'trim-both cap alphabetic'
            }}>
            <span className="text-caption-medium text-gray-700">{text}</span>
        </div>
    )
}

