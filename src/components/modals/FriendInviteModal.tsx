import { useState } from 'react'
import { COLORS } from '@/constants/colors'
import { DeleteIcon, ShareIcon } from '@/assets/icons'
import { RandomCouponGraphic } from '@/assets/graphics'

import { BaseModal, type BaseModalChildrenProps } from '@/components'

export function FriendInviteModal({
    id,
    onClose,
    onAccept
}: BaseModalChildrenProps) {
    return (
        <BaseModal
            id={id}
            className="px-0"
            style={{
                top: '100%',
                left: '50%',
                transform: 'translate(-50%, -100%)',
                animation: 'modalSlideIn 300ms ease-out both'
            }}
            onClose={onClose}
            onAccept={onAccept}>
            <FriendInviteModalContent />
        </BaseModal>
    )
}

function FriendInviteModalContent({ onClose }: BaseModalChildrenProps) {
    const [message, setMessage] = useState('')
    const url = new URL('/login', window.location.origin).href
    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(url)
            setMessage('밥먹댕 링크를 복사했어요.')
        } catch {
            setMessage(url)
        }
    }
    const share = async () => {
        if (!navigator.share) return copyLink()
        try {
            await navigator.share({ title: '밥먹댕', url })
        } catch (error) {
            if (!(error instanceof DOMException && error.name === 'AbortError'))
                await copyLink()
        }
    }
    return (
        <div className="rounded-t-16 w-full bg-white px-20 pt-20 pb-40">
            <div className="flex w-full flex-col items-center gap-20">
                <button
                    onClick={onClose}
                    className="self-end"
                    aria-label="닫기">
                    <DeleteIcon strokecolor={COLORS.gray4} />
                </button>
                <div className="flex w-full flex-col items-center gap-23">
                    <span className="text-title1-semibold text-gray-8 text-center">
                        친구에게 밥먹댕을 공유해요
                    </span>
                    <div className="flex w-full flex-col items-center gap-30">
                        <RandomCouponGraphic />
                        <div className="flex w-full flex-col gap-10">
                            <CopyLinkButton onClick={copyLink} />
                            <ShareButton onClick={share} />
                            <p role="status">{message}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function CopyLinkButton({
    className,
    onClick
}: {
    className?: string
    onClick?: () => void
}) {
    return (
        <button
            className={`bg-gray-8 flex w-full cursor-pointer items-center justify-center gap-12 rounded-full py-14 pr-16 pl-17 ${className} `}
            onClick={onClick}>
            <ShareIcon strokecolor={COLORS.white} />
            <span className="text-body1-semibold text-gray-1">
                초대 링크 복사하기
            </span>
        </button>
    )
}

function ShareButton({
    className,
    onClick
}: {
    className?: string
    onClick?: () => void
}) {
    return (
        <button
            className={`flex w-full cursor-pointer items-center justify-center gap-12 rounded-full bg-[#FEDC2C] py-14 pr-16 pl-17 ${className} `}
            onClick={onClick}>
            <ShareIcon strokecolor={COLORS.gray8} />
            <span className="text-body1-semibold text-gray-8">공유하기</span>
        </button>
    )
}
