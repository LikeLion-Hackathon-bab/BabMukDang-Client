import { useState } from 'react'
import { TagPerson } from '@/components'
import { MenuIcon, BackIcon, LocationGrayIcon } from '@/assets/icons'
import { COLORS } from '@/constants/colors'
import type { MeetingCardView } from '@/viewModels'
import { formatKoreanDateTime } from '@/lib/dateTime'

export function MeetingCard({
    meeting,
    onClick,
    onCancel
}: {
    meeting: MeetingCardView
    onClick: () => void
    onCancel?: () => void
}) {
    const [isOpen, setIsOpen] = useState(false)
    const formattedTime = formatKoreanDateTime(meeting.time)
    const [dateText, timeText = ''] = formattedTime.split('일 ')
    const handleClick = () => {
        setIsOpen(!isOpen)
        onClick()
    }
    return (
        <>
            {/* Default 버전 카드 */}
            <div
                className="relative w-full"
                onClick={handleClick}>
                {/* 카드 내용 */}
                <div className="rounded-12 flex h-full w-full items-stretch justify-between">
                    {/* 왼쪽: 시간 정보 */}
                    <div className="rounded-12 border-gray-2 shadow-drop-1 w-fit flex-none flex-col justify-baseline overflow-hidden border-r-2 border-dashed bg-white p-16 whitespace-nowrap">
                        <div className="flex h-52 w-fit flex-col justify-between">
                            <span className="text-body2-semibold text-black">
                                {dateText}일
                            </span>
                            <span className="text-body2-semibold text-black">
                                {timeText}
                            </span>
                        </div>
                    </div>

                    {/* 오른쪽: 참여자 태그와 위치 */}
                    <div className="rounded-12 shadow-drop-1 flex w-full items-center justify-between bg-white p-16">
                        <div className="flex w-full flex-col gap-11">
                            {/* 참여자 태그들 */}
                            <div className="flex items-center gap-8">
                                {meeting.participants.map(
                                    (participant, idx) => (
                                        <TagPerson
                                            key={idx}
                                            name={participant.name}
                                            orange={true}
                                        />
                                    )
                                )}
                            </div>

                            {/* 위치 정보 */}
                            <div className="flex items-center gap-4">
                                <LocationGrayIcon />
                                <span className="text-caption-medium text-gray-8">
                                    {meeting.location}
                                </span>
                            </div>

                            {isOpen && (
                                <>
                                    {/* 메뉴 정보 */}
                                    <div className="flex items-center gap-4">
                                        <MenuIcon />
                                        <span className="text-caption-medium text-gray-8">
                                            {meeting.restaurant}
                                        </span>
                                        <span className="text-caption-medium text-gray-4">
                                            · {meeting?.restaurantType}
                                        </span>
                                    </div>

                                    {/* 취소 버튼 */}
                                    {!meeting.isCompleted && (
                                        <button
                                            type="button"
                                            className="bg-gray-1 rounded-5 flex items-center justify-center py-5"
                                            onClick={event => {
                                                event.stopPropagation()
                                                onCancel?.()
                                            }}>
                                            <span className="text-caption-medium text-gray-5">
                                                약속 취소하기
                                            </span>
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        {/* 화살표 아이콘 (아래 방향) */}
                        <div className="flex h-16 w-16 items-center justify-center">
                            <BackIcon
                                strokecolor={COLORS.gray3}
                                className={`${isOpen ? 'rotate-90' : '-rotate-90'} transition-transform duration-300`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
