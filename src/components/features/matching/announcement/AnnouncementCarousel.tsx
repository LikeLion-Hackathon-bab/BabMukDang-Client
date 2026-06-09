import { useCarousel } from '@/hooks'
import { PostResponse, useJoinAnnouncement } from '@/apis'
import { AnnouncementCard, EmptyAnnouncementCard } from './AnnouncementCard'
import { JoinButton } from './AnnouncementJoinButton'
import { useAuthStore } from '@/store'
import { useState } from 'react'
import { JoinCompleteModal } from '@/components'

export function AnnouncementCarousel({
    announcements
}: {
    announcements: PostResponse[]
}) {
    // 빈 상태일 때는 캐러셀 없이 EmptyAnnouncementCard만 렌더링
    if (announcements.length === 0) {
        return (
            <div className="flex w-full translate-x-1/2">
                <EmptyAnnouncementCard />
            </div>
        )
    }

    // 공고가 있을 때만 캐러셀 렌더링
    return <AnnouncementCarouselContent announcements={announcements} />
}

// 실제 캐러셀 로직을 포함한 내부 컴포넌트
function AnnouncementCarouselContent({
    announcements
}: {
    announcements: PostResponse[]
}) {
    const {
        containerRef,
        cardRef,
        translateX,
        currentIndex,
        isDragging,
        handleCardClick
    } = useCarousel({
        itemCount: announcements.length,
        threshold: window.innerWidth / 8,
        duration: 300,
        initialPosition: window.innerWidth / 2 - 280 / 2,
        clickThreshold: 5 // 5px 이내 움직임만 클릭으로 인정
    })
    const { userId } = useAuthStore()
    const [selectedAnnouncement, setSelectedAnnouncement] =
        useState<PostResponse | null>(null)
    const { mutate: joinAnnouncement } = useJoinAnnouncement({
        onSuccess: () => {
            console.log('announcemnet 참여하기가 완료되었습니다')
        },
        onError: () => {
            console.log('Announcement join error')
        }
    })

    return (
        <div
            className="flex w-full flex-row overflow-hidden select-none"
            ref={containerRef}
            style={{
                cursor: isDragging ? 'grabbing' : 'grab'
            }}>
            <div
                className="flex flex-row gap-16"
                style={{
                    transform: `translateX(${translateX}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                }}>
                {announcements
                    .filter(
                        //todo 임시 코드
                        announcement =>
                            (announcement as any).authorId !== userId
                    )
                    .map((announcement, index) => {
                        const isActive = index === currentIndex

                        // 중앙 카드와의 거리에 따른 스타일 계산
                        const scale = isActive ? 1 : 0.85
                        const opacity = isActive ? 1 : 0.6
                        const rotate = isActive
                            ? 0
                            : index < currentIndex
                              ? 10
                              : -10
                        const filter = isActive ? 'none' : 'blur(0.5px)'

                        return (
                            <div
                                key={announcement.postId}
                                className="z-100 flex w-280 flex-col gap-16 transition-all duration-300 ease-out"
                                style={{
                                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                                    opacity: opacity,
                                    filter: filter,
                                    pointerEvents: isDragging ? 'none' : 'auto' // 드래그 중에는 클릭 방지
                                }}
                                onClick={e => handleCardClick(index, e)}
                                onTouchStart={e => handleCardClick(index, e)}>
                                <AnnouncementCard
                                    announcement={announcement}
                                    cardRef={
                                        cardRef as React.RefObject<HTMLDivElement>
                                    }
                                    index={index}
                                    currentIndex={currentIndex}
                                    isActive={isActive}
                                />
                                {isActive && (
                                    <JoinButton
                                        disabled={isDragging}
                                        announcement={announcement}
                                        setSelectedAnnouncement={
                                            setSelectedAnnouncement
                                        }
                                    />
                                )}
                                <JoinCompleteModal
                                    announcementId={
                                        selectedAnnouncement?.postId.toString() ||
                                        ''
                                    }
                                    onAccept={() => {
                                        joinAnnouncement(
                                            selectedAnnouncement?.postId || 0
                                        )
                                    }}
                                    id="join-complete-modal"
                                    title="참여하기가 완료되었습니다."
                                    description="최종 매칭이 완료되면 알림을 보내드릴게요."
                                    acceptText="알림 받기"
                                />
                            </div>
                        )
                    })}
            </div>
        </div>
    )
}
