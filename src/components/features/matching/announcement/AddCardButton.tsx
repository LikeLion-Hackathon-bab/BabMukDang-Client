import { AddIcon } from '@/assets/icons'

interface AddCardButtonProps {
    onClick: () => void
}

export function AddCardButton({ onClick }: AddCardButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="rounded-16 flex h-353 w-280 items-center justify-start bg-white pl-12"
            aria-label="공고 추가">
            <AddIcon />
        </button>
    )
}
