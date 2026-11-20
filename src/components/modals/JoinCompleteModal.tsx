import { BellColorIcon, DeleteIcon } from '@/assets/icons'
import { COLORS } from '@/constants/colors'

import {
    BaseModal,
    BaseModalChildrenProps,
    MutalButtonSmall
} from '@/components'

type JoinCompleteModalProps = {
    title: string
    description: string
    acceptText: string
    mealPlanId?: string
}

export function JoinCompleteModal({
    open,
    id,
    onClose,
    onAccept,
    title,
    mealPlanId,
    description,
    acceptText
}: JoinCompleteModalProps & BaseModalChildrenProps) {
    return (
        <BaseModal
            open={open}
            id={id}
            onClose={onClose}
            onAccept={onAccept}>
            <JoinCompleteModalContent
                title={title}
                description={description}
                acceptText={acceptText}
                mealPlanId={mealPlanId}
                onAccept={onAccept}
            />
        </BaseModal>
    )
}

function JoinCompleteModalContent({
    onClose,
    onAccept,
    title,
    description,
    acceptText,
    mealPlanId
}: BaseModalChildrenProps & JoinCompleteModalProps) {
    return (
        <div className="shadow-drop-1 rounded-16 mx-auto w-full max-w-400 bg-white px-20 py-24">
            <div className="flex flex-col items-center gap-20">
                {/* Close icon */}
                <button
                    onClick={onClose}
                    className="self-end"
                    aria-label="닫기">
                    <DeleteIcon strokecolor={COLORS.gray4} />
                </button>

                <div className="flex flex-col items-center gap-8">
                    <span className="text-title2-bold text-center text-black">
                        {title}
                    </span>
                    <span className="text-body2-semibold text-gray-6 text-center">
                        {description}
                    </span>
                </div>

                {/* Illustration */}
                <BellColorIcon className="mb-8" />

                {/* CTA */}
                <MutalButtonSmall
                    text={acceptText}
                    onClick={() => onAccept?.(mealPlanId)}
                />
            </div>
        </div>
    )
}

