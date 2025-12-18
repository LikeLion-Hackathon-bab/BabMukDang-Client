import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useMatchStore } from '@/store/matchStore'
import { useSocket } from '@/contexts/SocketContext'
import {
    LocationGrayIcon,
    PeopleGrayIcon,
    ProfileDefaultIcon,
    TimeGrayIcon
} from '@/assets/icons'
import { useMemo } from 'react'

export function WaitingPage() {
    const navigate = useNavigate()
    const {
        matchType,
        participants,
        stage,
        locationInitial,
        meetingAtInitial
    } = useSocket()
    const matchedUser = {
        id: '1',
        name: '김사자',
        profileImage: undefined
    }

    const meetingInfo = useMemo(
        () => ({
            location: locationInitial || '',
            time: meetingAtInitial || '',
            maxParticipants: participants?.length ?? 0
        }),
        [locationInitial, meetingAtInitial, participants]
    )
    return (
        <div className="relative flex h-full w-full flex-col items-center justify-baseline pt-100">
            {/* 메인 컨텐츠 */}
            <div className="flex flex-col items-center">
                {/* 매칭 완료 메시지 */}
                <h1 className="text-title1-semibold mb-32 text-center text-black">
                    {matchType === 'announcement'
                        ? '오늘의 한끼 멤버'
                        : '한끼 제안,'}
                    <br />
                    {matchType === 'announcement'
                        ? '모집 완료!🎉'
                        : '약속이 성사됐어요🎉'}
                </h1>

                {/* 프로필 이미지 */}
                <div className="ml-10 flex items-center justify-center">
                    {/* {stage === 'waiting' &&
                        participants.length > 0 &&
                        participants?.map(participant => (
                            <div
                                key={participant.userId}
                                className="shadow-drop-1 mb-20 -ml-10 size-120 overflow-hidden rounded-full">
                                {participant?.userProfileImageURL ? (
                                    <img
                                        src={participant.userProfileImageURL}
                                        alt={`${participant.username} 프로필`}
                                        className="bg-gray-3 h-full w-full object-cover"
                                    />
                                ) : (
                                    <ProfileDefaultIcon className="size-full" />
                                )}
                            </div>
                        ))} */}
                </div>

                {/* 사용자 이름 */}
                {/* <h2 className="text-title1-semibold mb-32 text-black">
                        {participants
                            .map(participant => participant.username)
                            .join(', ')}{' '}
                        님
                    </h2> */}

                {/* Time and Location Info */}
                <div className="rounded-12 border-primary-400 mb-14 border p-16">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <TimeGrayIcon />
                            <span className="text-body2-semibold text-black">
                                {meetingInfo?.time &&
                                    formatTime(meetingInfo.time)}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <LocationGrayIcon />
                            <span className="text-body2-semibold text-black">
                                {meetingInfo?.location}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <PeopleGrayIcon />
                            <span className="text-body2-semibold text-black">
                                {meetingInfo?.maxParticipants}명
                            </span>
                        </div>
                    </div>
                </div>

                {/* 매칭 취소하기 */}
                <button
                    // onClick={handleCancelMatching}
                    className="text-body1-medium text-gray-4">
                    매칭 취소하기
                </button>
            </div>
        </div>
    )
}

function formatTime(meetingAt: string) {
    // 2025-08-08T22:30 -> 8월 7일 오후 7시 30분
    const date = new Date(meetingAt)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours()
    const minutes = date.getMinutes()

    const ampm = date.getHours() >= 12 ? '오후' : '오전'
    const timeString = `${month}월 ${day}일 ${ampm} ${hours}시 ${minutes}분`
    return timeString
}
