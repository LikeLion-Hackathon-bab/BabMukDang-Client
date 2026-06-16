import { BackIcon } from '@/assets/icons'
import { COLORS } from '@/constants/colors'

export function MutalButton({
    text,
    className,
    onClick,
    hasArrow = false,
    disabled = false
}: {
    text: string
    className?: string
    onClick?: () => void
    hasArrow?: boolean
    disabled?: boolean
}) {
    return (
        <button
            className={`bg-gray-7 relative flex w-full cursor-pointer items-center justify-center rounded-full py-14 pr-16 pl-17 disabled:opacity-40 ${className} `}
            disabled={disabled}
            onClick={onClick}
            onTouchEnd={onClick}>
            <span className="text-title2-semibold text-white">{text}</span>
            {hasArrow && (
                <BackIcon
                    className="absolute right-16 rotate-180"
                    strokecolor={COLORS.gray1}
                />
            )}
        </button>
    )
}

export function MutalButtonSmall({
    text,
    className,
    onClick,
    disabled = false
}: {
    text: string
    className?: string
    onClick?: () => void
    disabled?: boolean
}) {
    return (
        <button
            className={`bg-gray-7 flex w-full cursor-pointer items-center justify-center rounded-full py-10 disabled:opacity-40 ${className} `}
            disabled={disabled}
            onClick={onClick}
            onTouchEnd={onClick}>
            <span className="text-body1-semibold text-white">{text}</span>
        </button>
    )
}
