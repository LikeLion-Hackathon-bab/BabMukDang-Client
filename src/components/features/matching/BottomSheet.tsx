import React from 'react'
import { useBottomSheet } from '@/hooks'
import { BOTTOM_NAVIGATION_HEIGHT } from '@/constants/bottomNav'

interface BottomSheetProps {
    children: React.ReactNode
    snapPoints?: number[]
    initialSnapPoint?: number
    initialExposure?: number
    threshold?: number
    duration?: number
    dragResistance?: number
    enableBackdrop?: boolean
    className?: string
    backdropClassName?: string
    height?: number
}
const HEIGHT = 644

export function BottomSheet({
    children,
    snapPoints = [0, HEIGHT - BOTTOM_NAVIGATION_HEIGHT],
    initialSnapPoint = 0,
    initialExposure = 30,
    threshold = 200,
    duration = 300,
    dragResistance = 0.2,
    enableBackdrop = true,
    className = '',
    backdropClassName = '',
    height = HEIGHT
}: BottomSheetProps) {
    const {
        isOpen,
        open,
        close,
        translateY,
        containerRef,
        backdropRef,
        handleBackdropClick
    } = useBottomSheet({
        snapPoints,
        initialSnapPoint,
        threshold,
        duration,
        dragResistance,
        enableBackdrop,
        initialExposure
    })

    return (
        <>
            {/* 배경 오버레이 */}
            {isOpen && (
                <div
                    ref={backdropRef}
                    className={`bg-opacity-50 fixed inset-0 z-40 bg-black transition-opacity duration-300 ${
                        isOpen ? 'opacity-30' : 'opacity-0'
                    } ${backdropClassName}`}
                    onClick={handleBackdropClick}
                />
            )}

            {/* 바텀시트 컨테이너 */}
            <div
                ref={containerRef}
                className={`fixed right-0 left-0 z-50 origin-top transform rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ease-out ${className}`}
                style={{
                    transform: `translateY(${translateY}px)`,
                    bottom: `${-height + BOTTOM_NAVIGATION_HEIGHT + initialExposure}px`,
                    height: `${height}px`
                }}>
                {/* 드래그 핸들 */}
                <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-label={isOpen ? '공고 패널 닫기' : '공고 패널 열기'}
                    onClick={isOpen ? close : open}
                    className="flex w-full justify-center pt-14 pb-2">
                    <div className="bg-gray-5 h-3 w-76 rounded-full" />
                </button>

                {/* 컨텐츠 */}
                <div className="h-full w-full flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </>
    )
}
