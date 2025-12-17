import { Link } from 'react-router-dom'

import { ProfileDefaultIcon } from '@/assets/icons'
import { InvitationResponse } from '@/apis'

export function RecieveInvitationList({
    invitations
}: {
    invitations: InvitationResponse[]
}) {
    return (
        <div className="rounded-12 shadow-drop-1 flex w-full flex-col gap-16 bg-white p-16">
            {/* 상단 */}
            <div className="flex flex-row items-center justify-between">
                <span className="text-body1-semibold text-gray-8">
                    받은 초대장
                </span>
                {/* <span className="text-caption-medium text-right text-gray-300">
                    더보기 +
                </span> */}
            </div>
            {/* 하단 */}
            <div className="flex flex-row justify-between gap-18 overflow-x-auto">
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
