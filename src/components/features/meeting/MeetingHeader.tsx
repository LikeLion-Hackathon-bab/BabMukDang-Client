import { CalendarIcon, LocationWhiteIcon } from '@/assets/icons'
import { TagPerson } from '@/components'
import { MeetingResponse } from '@kimdaegyu/babmukdang-shared'
export function MeetingHeader({ meeting }: { meeting: MeetingResponse }) {
    return (
        <div className="absolute top-0 left-0 flex h-287 w-screen flex-col items-center justify-end gap-10 bg-gradient-to-b from-[#FFAE93] to-[#FF7546] px-20 pb-16">
            {/* 상단 섹션 */}
            <div className="flex w-full flex-col gap-32">
                {/* 제목과 참여자 태그, 캘린더 아이콘 */}
                <div className="flex w-full items-center justify-between">
                    {/* 왼쪽: 제목과 참여자 태그 */}
                    <div className="flex flex-col gap-12">
                        {/* 메인 제목 */}
                        <span className="text-title2-semibold text-white">
                            곧 다가오는 약속이에요.
                            <br />
                            잊지말고 참여해주세요!
                        </span>

                        {/* 참여자 태그들 */}
                        <div className="flex items-center gap-8">
                            {meeting.participants.map((participant, idx) => (
                                <TagPerson
                                    key={idx}
                                    name={participant.username}
                                    orange={true}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 오른쪽: 캘린더 아이콘 */}
                    <CalendarIcon />
                </div>

                {/* 하단 섹션 */}
                <div className="flex w-full flex-col gap-12">
                    {/* 위치와 시간 정보 */}
                    <div className="flex w-full items-center justify-between gap-16">
                        {/* 위치 정보 */}
                        <div className="flex items-center gap-4">
                            <LocationWhiteIcon />
                            <span className="text-caption-medium text-gray-1">
                                {meeting.location}
                            </span>
                        </div>

                        {/* 시간 정보 */}
                        <span className="text-caption-medium text-primary-200">
                            {meeting.meetingAt}
                        </span>
                    </div>

                    {/* todo : 진행상태 추가 */}
                    {/* 진행 상태 바 */}
                    <div className="flex w-full flex-col items-end justify-center gap-6">
                        {/* 진행 상태 바 */}
                        <div className="bg-gray-2 rounded-5 flex h-7 w-full items-center">
                            <div className="bg-gray-7 rounded-5 h-9 w-116"></div>
                        </div>
                        <div className="flex w-full justify-between">
                            {/* 진행 상태 텍스트들 */}
                            <span className="text-caption-10 text-gray-7">
                                매칭
                            </span>
                            <span className="text-caption-10 text-gray-7">
                                약속 잡기
                            </span>
                            <span className="text-caption-10 text-primary-200">
                                만남
                            </span>
                            <span className="text-caption-10 text-primary-200">
                                식사 완료
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
