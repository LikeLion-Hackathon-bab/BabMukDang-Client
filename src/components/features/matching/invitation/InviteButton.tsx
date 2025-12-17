import { AddIcon } from '@/assets/icons'

export function InviteButton() {
    return (
        <button className="rounded-16 flex w-full items-center justify-center bg-white px-16 py-16">
            <div className="flex flex-col items-center justify-center gap-12">
                <div className="bg-primary-200 flex size-60 items-center justify-center rounded-full">
                    <AddIcon />
                </div>
                <span className="text-body2-semibold text-gray-8 text-center">
                    밥 모임 초대하기
                </span>
            </div>
        </button>
    )
}
