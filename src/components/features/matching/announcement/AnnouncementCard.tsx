import { PostResponse } from '@/apis'
import {
    ProfileDefaultIcon,
    EmptyViewIcon,
    LocationWhiteIcon,
    TimeWhiteIcon,
    PeopleWhiteIcon
} from '@/assets/icons'
import { useState } from 'react'

export function AnnouncementCard({
    announcement,
    cardRef,
    index,
    currentIndex,
    isActive
}: {
    announcement: PostResponse
    cardRef: React.RefObject<HTMLDivElement>
    index: number
    currentIndex: number
    isActive: boolean
}) {
    return (
        <div
            ref={currentIndex === index ? cardRef : null}
            className={`shadow-drop-1 rounded-16 flex h-353 w-full flex-col items-center justify-between bg-white px-12 py-8 transition-all duration-200 ${
                isActive ? 'cursor-pointer hover:shadow-lg' : 'cursor-pointer'
            }`}>
            {/* Header with creator info and time left */}
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-8">
                    {announcement.author.profileImageUrl ? (
                        <img
                            src={announcement.author.profileImageUrl}
                            alt="profile"
                            className="size-20 rounded-full"
                        />
                    ) : (
                        <ProfileDefaultIcon className="size-20" />
                    )}
                    <span className="text-body1-semibold">
                        {announcement.author.name}
                    </span>
                </div>
                <span className="text-caption-medium text-gray-5">
                    {calculateTimeLeft(announcement.createdAt)}
                </span>
            </div>

            {/* Title */}
            <div className="flex w-218 flex-col gap-20">
                <div className="text-center">
                    <span className="text-title1-bold whitespace-pre-line">
                        {announcement.message}
                    </span>
                </div>

                {/* Time and Location Info */}
                <div className="rounded-12 bg-primary-500 p-16">
                    <div className="flex flex-col gap-8">
                        <div className="flex items-center gap-4">
                            <TimeWhiteIcon />
                            <span className="text-body2-semibold text-white">
                                {formatTime(announcement.meetingAt)}
                                {/* 2025-08-08T22:30 */}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <LocationWhiteIcon />
                            <span className="text-body2-semibold text-white">
                                {announcement.location}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <PeopleWhiteIcon />
                            <span className="text-body2-semibold text-white">
                                {announcement.targetCount}명
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex w-full flex-col gap-8">
                {/* Participants */}
                <span className="text-caption-medium text-gray-4">
                    함께 하는 친구
                </span>

                <div className="rounded-50 border-primary-200 h-40 border p-8">
                    <div className="flex flex-row gap-8">
                        {announcement.participants.map((participant, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-8">
                                {participant.profileImageUrl ? (
                                    <img
                                        src={participant.profileImageUrl}
                                        alt="profile"
                                        className="size-20 rounded-full"
                                    />
                                ) : (
                                    <ProfileDefaultIcon className="size-20" />
                                )}
                                <span className="text-body2-medium">
                                    {participant.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export function EmptyAnnouncementCard() {
    return (
        <div className="shadow-drop-1 rounded-16 h-353 w-280 origin-center translate-x-[-50%] bg-white px-12 py-8">
            <div className="flex h-full flex-col items-center justify-center gap-16">
                <div className="flex w-136 flex-col items-center gap-16">
                    <EmptyViewIcon />
                    <span className="text-body1-semibold text-gray-4 text-center whitespace-pre-line">
                        {'오늘은 아직 올라온\n공고가 없어요'}
                    </span>
                </div>
            </div>
        </div>
    )
}

function calculateTimeLeft(createdAt: string) {
    // 2025-08-08T22:30 ->1시간 30분 후 종료
    // GMT+0 기준
    const now = new Date()
    const GMTNow = now.getTime() + now.getTimezoneOffset() * 60 * 1000
    const createdAtDate = new Date(createdAt)
    const expiresAtDate = new Date(createdAtDate.getTime() + 2 * 60 * 60 * 1000)
    const expiresAtGMT = expiresAtDate.getTime()
    const timeLeft = expiresAtGMT - GMTNow
    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    const timeLeftString = `${hours}시간 ${minutes}분 후 종료`
    return timeLeftString
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
