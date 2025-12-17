import { ArrowForwardIcon } from '@/assets/icons'
import { ModalTrigger } from '@/components/shared'
import { cn } from '@/lib'

export function FriendInviteButton({ className }: { className?: string }) {
    return (
        <ModalTrigger
            forId="friend-invite-notify-modal"
            className={cn(
                'rounded-12 bg-primary-100 border-primary-400 flex items-center justify-between border px-16 py-18',
                className
            )}>
            <span className="text-body1-semibold text-gray-8">
                친구 초대하기
            </span>
            <div className="flex items-center gap-4">
                <span className="text-caption-10 text-gray-4">
                    초대 받은 친구가 가입시, 랜덤 쿠폰 증정!
                </span>
                <ArrowForwardIcon />
            </div>
        </ModalTrigger>
    )
}
