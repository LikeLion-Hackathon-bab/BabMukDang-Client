import { BottomSheet } from '../BottomSheet'
import {
    AddAnnouncementButton,
    CloseAnnouncementButton
} from './AnnouncementButton'
import { AddAnnouncementCard } from './AddAnnouncementCard'
import { CloseAnnouncementCard } from './CloseAnnouncementCard'
import { KebabButton } from '@/components'
import { Recruit, RecruitResponseDto } from '@kimdaegyu/babmukdang-shared'
import { useState } from 'react'
import { useCloseAnnouncement, useGetAnnouncements } from '@/query'

export function AnnouncementBottomSheet({
    isAdd,
    myAnnouncement
}: {
    isAdd: boolean
    myAnnouncement: RecruitResponseDto | null
}) {
    const [announcementAddData, setAnnouncementAddData] = useState<Recruit>({
        location: '',
        message: '',
        targetCount: 0,
        meetingAt: ''
    })
    const { refetch: refetchAnnouncements } = useGetAnnouncements()
    const { mutate: closeAnnouncement } = useCloseAnnouncement(
        () => {
            console.log('deleteAnnouncement')
            refetchAnnouncements()
        },
        error => {
            console.log('deleteAnnouncement error')
        }
    )
    return (
        <BottomSheet initialExposure={75}>
            <div className="relative flex h-full w-full flex-col items-center justify-baseline gap-35 bg-gradient-to-b from-white to-[#FED9CB] pt-12">
                {!isAdd && (
                    <KebabButton
                        className="absolute top-8 right-20"
                        onClick={() => {
                            console.log('closeAnnouncement', myAnnouncement?.id)
                            closeAnnouncement(myAnnouncement?.id!)
                        }}
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
                                onSuccess={() => {
                                    setAnnouncementAddData({
                                        location: '',
                                        message: '',
                                        targetCount: 0,
                                        meetingAt: ''
                                    })
                                }}
                            />
                        </>
                    ) : (
                        <>
                            <CloseAnnouncementCard
                                announcement={
                                    myAnnouncement || ({} as RecruitResponseDto)
                                }
                            />
                            <CloseAnnouncementButton
                                announcementId={myAnnouncement?.id}
                            />
                        </>
                    )}
                </div>
            </div>
        </BottomSheet>
    )
}
