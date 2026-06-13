import { MatchingIcon } from '@/assets/icons'
import { COLORS } from '@/constants/colors'
import type { MatchingInviteNoti } from '@/viewModels'
export function MatchingInviteNotiCard({
    noti,
    onClick
}: {
    noti: MatchingInviteNoti
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
                        {noti.title}
                    </span>
                </div>
                <span className="text-caption-medium text-gray-3">
                    {noti.createdAt}
                </span>
            </div>
            <span className="text-caption-medium text-gray-5 w-full">
                {noti.message}
            </span>
        </div>
    )
}
