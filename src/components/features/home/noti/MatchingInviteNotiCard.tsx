import { MatchingIcon } from '@/assets/icons'
import { COLORS } from '@/constants/colors'
import { MeetingResponse, PlanType } from '@kimdaegyu/babmukdang-shared'

export function MatchingInviteNotiCard({
    noti,
    onClick
}: {
    noti: MeetingResponse
    onClick: () => void
}) {
    return (
        <div
            className="flex w-full flex-col gap-10 px-20 py-16"
            onClick={onClick}>
            <div className="flex w-full flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-8">
                    <MatchingIcon
                        bgcolor={COLORS.primary100}
                        strokecolor={COLORS.primaryMain}
                    />
                    <span className="text-body1-semibold text-gray-7">
                        {noti.type === PlanType.ANNOUNCEMENT
                            ? '약속이 성사되었어요!'
                            : '초대'}
                    </span>
                </div>
                <span className="text-caption-medium text-gray-3">
                    {new Date(
                        new Date().getTime() -
                            new Date(noti.createdAt).getTimezoneOffset()
                    ).toLocaleString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    })}
                    시간 전
                </span>
            </div>
            <span className="text-caption-medium text-gray-5 w-full">
                {noti.type === PlanType.ANNOUNCEMENT
                    ? `${noti.author.username}님과의 약속을 정해봐요!`
                    : `${noti.author.username}님과의 약속을 정해봐요!`}
            </span>
        </div>
    )
}
