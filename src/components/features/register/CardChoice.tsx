import { cn } from '@/lib/utils'

export function CardChoice({
    label,
    selected,
    onToggle
}: {
    label: string
    selected: boolean
    onToggle: () => void
    className?: string
}) {
    return (
        <button
            className={cn(
                'rounded-12 flex h-110 w-110 flex-col items-center justify-center',
                selected
                    ? 'shadow-drop-1 border-primary-500 border bg-white'
                    : 'bg-gray-2'
            )}
            onClick={onToggle}
            // onTouchEnd={onToggle}
        >
            <span
                className={cn(
                    'text-body1-semibold',
                    selected ? 'text-primary-main' : 'text-black'
                )}>
                {label}
            </span>
        </button>
    )
}
