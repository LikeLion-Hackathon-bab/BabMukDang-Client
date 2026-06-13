import { useCarousel } from '@/hooks'
import type { RecruitCardView } from '@/viewModels'
import { RecruitCard, EmptyRecruitCard } from './RecruitCard'
import { JoinButton } from './RecruitJoinButton'
import { useState } from 'react'
import { JoinCompleteModal } from '@/components'

export function RecruitCarousel({
    recruits,
    currentUserId,
    onJoinRecruit
}: {
    recruits: RecruitCardView[]
    currentUserId?: string | null
    onJoinRecruit: (recruitId: number) => void
}) {
    // 빈 상태일 때는 캐러셀 없이 EmptyRecruitCard만 렌더링
    if (recruits.length === 0) {
        return (
            <div className="flex w-full translate-x-1/2">
                <EmptyRecruitCard />
            </div>
        )
    }

    // 공고가 있을 때만 캐러셀 렌더링
    return <RecruitCarouselContent recruits={recruits} currentUserId={currentUserId} onJoinRecruit={onJoinRecruit} />
}

// 실제 캐러셀 로직을 포함한 내부 컴포넌트
function RecruitCarouselContent({
    recruits,
    currentUserId,
    onJoinRecruit
}: {
    recruits: RecruitCardView[]
    currentUserId?: string | null
    onJoinRecruit: (recruitId: number) => void
}) {
    const {
        containerRef,
        cardRef,
        translateX,
        currentIndex,
        isDragging,
        handleCardClick
    } = useCarousel({
        itemCount: recruits.length,
        threshold: window.innerWidth / 8,
        duration: 300,
        initialPosition: window.innerWidth / 2 - 280 / 2,
        clickThreshold: 5 // 5px 이내 움직임만 클릭으로 인정
    })
    const [selectedRecruit, setSelectedRecruit] =
        useState<RecruitCardView | null>(null)

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
                {recruits
                    .filter(
                        //todo 임시 코드
                        recruit =>
                            recruit.author.authorId !== Number(currentUserId)
                    )
                    .map((recruit, index) => {
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
                                key={recruit.postId}
                                className="z-100 flex w-280 flex-col gap-16 transition-all duration-300 ease-out"
                                style={{
                                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                                    opacity: opacity,
                                    filter: filter,
                                    pointerEvents: isDragging ? 'none' : 'auto' // 드래그 중에는 클릭 방지
                                }}
                                onClick={e => handleCardClick(index, e)}
                                onTouchStart={e => handleCardClick(index, e)}>
                                <RecruitCard
                                    recruit={recruit}
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
                                        recruit={recruit}
                                        setSelectedRecruit={
                                            setSelectedRecruit
                                        }
                                        onJoinRecruit={onJoinRecruit}
                                    />
                                )}
                                <JoinCompleteModal
                                    recruitId={
                                        selectedRecruit?.postId.toString() ||
                                        ''
                                    }
                                    onAccept={() => {
                                        if (selectedRecruit) {
                                            onJoinRecruit(selectedRecruit.postId)
                                        }
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

