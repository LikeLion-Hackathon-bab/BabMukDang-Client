import { BottomSheet } from '../BottomSheet'
import {
    AddAnnouncementButton,
    CloseAnnouncementButton
} from './AnnouncementButton'
import { AddAnnouncementCard } from './AddAnnouncementCard'
import { CloseAnnouncementCard } from './CloseAnnouncementCard'
import { KebabButton } from '@/components'
import { Post, PostResponse } from '@/apis'
import { useState } from 'react'
import { MockAnnouncements } from '@/constants/mockData'

export function AnnouncementBottomSheet({
    isAdd,
    myAnnouncement
}: {
    isAdd: boolean
    myAnnouncement: PostResponse | null
}) {
    const [announcementAddData, setAnnouncementAddData] = useState<Post>({
        location: '',
        message: '',
        targetCount: 0,
        meetingAt: ''
    })
    return (
        <BottomSheet initialExposure={75}>
            <div className="relative flex h-full w-full flex-col items-center justify-baseline gap-35 bg-gradient-to-b from-white to-[#FED9CB] pt-12">
                {!isAdd && (
                    <KebabButton
                        className="absolute top-8 right-20"
                        onClick={() => {}}
                    />
                )}
                <span
                    className={`text-body1-semibold ${
                        isAdd ? 'text-gray-5' : 'text-primary-main'
                    }`}>
                    {isAdd ? '공고 추가하기' : '나의 공고'}
                </span>
                <div className="flex w-280 flex-col gap-12">
                    {isAdd ? (
                        <>
                            <AddAnnouncementCard
                                announcementAddData={announcementAddData}
                                setAnnouncementAddData={setAnnouncementAddData}
                            />
                            <AddAnnouncementButton
                                announcementAddData={announcementAddData}
                            />
                        </>
                    ) : (
                        <>
                            <CloseAnnouncementCard
                                announcement={
                                    myAnnouncement || ({} as PostResponse)
                                }
                            />
                            <CloseAnnouncementButton
                                announcementId={myAnnouncement?.postId}
                            />
                        </>
                    )}
                </div>
            </div>
        </BottomSheet>
    )
}
