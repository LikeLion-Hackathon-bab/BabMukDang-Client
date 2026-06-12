import { BottomSheet } from '../BottomSheet'
import {
    AddRecruitButton,
    CloseRecruitButton
} from './RecruitButton'
import { AddRecruitCard } from './AddRecruitCard'
import { RecruitCard } from './RecruitCard'
import { AddCardButton } from './AddCardButton'
import { Post, PostResponse } from '@/apis'
import { useState, useRef, useCallback } from 'react'

const CARD_WIDTH = 280
const GAP = 16

export function RecruitBottomSheet({
    isAdd,
    myRecruit
}: {
    isAdd: boolean
    myRecruit: PostResponse | null
}) {
    // 단일 AddRecruitCard용 상태 (isAdd=true일 때)
    const [recruitAddData, setRecruitAddData] = useState<Post>({
        location: '',
        message: '',
        targetCount: 0,
        meetingAt: ''
    })

    // 추가 카드 상태 (isAdd=false일 때, 슬라이드로 활성화됨)
    const [additionalCardData, setAdditionalCardData] = useState<Post>({
        location: '',
        message: '',
        targetCount: 0,
        meetingAt: ''
    })

    // 캐러셀 상태
    const [currentIndex, setCurrentIndex] = useState(0)
    const [translateX, setTranslateX] = useState(0)
    const [isDragging, setIsDragging] = useState(false)

    // 드래그 관련 ref
    const dragStartX = useRef(0)
    const dragStartTranslateX = useRef(0)
    const containerRef = useRef<HTMLDivElement>(null)

    // 전체 카드 수: CloseRecruitCard(0) + AddButton/AddRecruitCard(1)
    const totalItems = 2

    // 특정 인덱스로 스냅
    const snapToIndex = useCallback(
        (index: number) => {
            const clampedIndex = Math.max(0, Math.min(index, totalItems - 1))
            setCurrentIndex(clampedIndex)
            setTranslateX(-(clampedIndex * (CARD_WIDTH + GAP)))
        },
        [totalItems]
    )

    // AddButton 클릭 시 (index 1로 이동하며 AddRecruitCard 활성화)
    const handleAddButtonClick = useCallback(() => {
        snapToIndex(1)
    }, [snapToIndex])

    // 터치/마우스 이벤트 핸들러
    const handleDragStart = useCallback(
        (clientX: number) => {
            setIsDragging(true)
            dragStartX.current = clientX
            dragStartTranslateX.current = translateX
        },
        [translateX]
    )

    const handleDragMove = useCallback(
        (clientX: number) => {
            if (!isDragging) return
            const diff = clientX - dragStartX.current
            setTranslateX(dragStartTranslateX.current + diff)
        },
        [isDragging]
    )

    const handleDragEnd = useCallback(() => {
        if (!isDragging) return
        setIsDragging(false)

        const diff = translateX - dragStartTranslateX.current
        const threshold = CARD_WIDTH / 3

        let newIndex = currentIndex
        if (diff < -threshold && currentIndex < totalItems - 1) {
            newIndex = currentIndex + 1
        } else if (diff > threshold && currentIndex > 0) {
            newIndex = currentIndex - 1
        }

        snapToIndex(newIndex)
    }, [isDragging, translateX, currentIndex, totalItems, snapToIndex])

    // 마우스 이벤트
    const handleMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX)
    const handleMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX)
    const handleMouseUp = () => handleDragEnd()
    const handleMouseLeave = () => isDragging && handleDragEnd()

    // 터치 이벤트
    const handleTouchStart = (e: React.TouchEvent) =>
        handleDragStart(e.touches[0].clientX)
    const handleTouchMove = (e: React.TouchEvent) =>
        handleDragMove(e.touches[0].clientX)
    const handleTouchEnd = () => handleDragEnd()

    return (
        <BottomSheet initialExposure={75}>
            <div className="relative flex h-full w-full flex-col items-center justify-baseline gap-35 bg-gradient-to-b from-white to-[#FED9CB] pt-12">
                <span
                    className={`text-body1-semibold ${
                        isAdd ? 'text-gray-5' : 'text-primary-main'
                    }`}>
                    {isAdd ? '공고 추가하기' : '나의 공고'}
                </span>

                {isAdd ? (
                    <div className="flex w-280 flex-col gap-12">
                        <AddRecruitCard
                            recruitAddData={recruitAddData}
                            setRecruitAddData={setRecruitAddData}
                        />
                        <AddRecruitButton
                            recruitAddData={recruitAddData}
                        />
                    </div>
                ) : (
                    /* 캐러셀 레이아웃 */
                    <div
                        ref={containerRef}
                        className="w-full overflow-hidden select-none"
                        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}>
                        <div
                            className="flex flex-row items-start"
                            style={{
                                gap: GAP,
                                transform: `translateX(calc(50% - ${CARD_WIDTH / 2}px + ${translateX}px))`,
                                transition: isDragging
                                    ? 'none'
                                    : 'transform 0.3s ease-out'
                            }}>
                            {/* RecruitCard with Kebab (인덱스 0) */}
                            <div className="flex w-280 shrink-0 flex-col gap-12">
                                <RecruitCard
                                    recruit={
                                        myRecruit || ({} as PostResponse)
                                    }
                                    showKebab={true}
                                />
                                {currentIndex === 0 && (
                                    <CloseRecruitButton
                                        recruitId={myRecruit?.postId}
                                    />
                                )}
                            </div>

                            {/* 인덱스 1: currentIndex가 0이면 AddButton, 1이면 AddRecruitCard */}
                            {currentIndex === 0 ? (
                                <AddCardButton onClick={handleAddButtonClick} />
                            ) : (
                                <div className="flex w-280 shrink-0 flex-col gap-12">
                                    <AddRecruitCard
                                        recruitAddData={additionalCardData}
                                        setRecruitAddData={
                                            setAdditionalCardData
                                        }
                                    />
                                    <AddRecruitButton
                                        recruitAddData={additionalCardData}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </BottomSheet>
    )
}

