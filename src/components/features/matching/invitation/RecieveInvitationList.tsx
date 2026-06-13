import { Link } from 'react-router-dom'

import { ProfileDefaultIcon } from '@/assets/icons'
import type { InvitationResponse } from '@kimdaegyu/babmukdang-shared/domain'

export function RecieveInvitationList({
    invitations
}: {
    invitations: InvitationResponse[]
}) {
    return (
        <div className="rounded-12 shadow-drop-1 flex w-full flex-col gap-16 bg-white py-16">
            {/* 상단 */}
            <div className="flex flex-row items-center justify-between px-16">
                <span className="text-body1-semibold text-gray-8">
                    받은 초대장
                </span>
                {/* <span className="text-caption-medium text-right text-gray-300">
                    더보기 +
                </span> */}
            </div>
            {/* 하단 */}
            <div className="flex flex-row justify-start gap-20 overflow-x-auto px-16">
                {invitations.map(invitation => (
                    <Link
                        to={`/read-invitation/${invitation.invitationId}`}
                        className="flex flex-col items-center justify-center gap-4">
                        <ProfileDefaultIcon className="size-50" />
                        <span className="text-caption-medium text-gray-5 text-center">
                            {invitation.inviterName}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    )
}
