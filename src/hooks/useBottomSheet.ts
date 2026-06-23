import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface UseBottomSheetOptions {
    snapPoints?: number[] // 0-100 사이의 퍼센트 값들 (0: 완전 닫힘, 100: 완전 열림)
    initialSnapPoint?: number // 초기 스냅 포인트 인덱스
    initialExposure?: number // 최상단 스냅에서 남겨둘 숨김 비율
    threshold?: number // 스냅 전환을 위한 최소 드래그 거리(px)
    dragResistance?: number // 닫힘/열림 경계를 넘길 때 적용할 저항
    clickThreshold?: number // 클릭으로 인정할 최대 이동 거리(px)
    openingDragLimit?: {
        bottomOffset: number
        overflow: number
    } // 닫힌 offset 상태에서 열기 드래그 중 화면 아래 기준으로 허용할 추가 노출 높이(px)
}

interface BottomSheetDerivedValue {
    isOpen: boolean
    currentSnapPoint: number
    exposurePercent: number
    translatePercent: number
    isDragging: boolean
}

interface UseBottomSheetReturn {
    derivedValue: BottomSheetDerivedValue
    open: () => void
    close: () => void
    snapTo: (index: number) => void
    setSheetRef: React.RefCallback<HTMLElement>
}

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max)

const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return false
    if (target.closest('[data-sheet-drag-handle]')) return false

    return !!target.closest(
        'input, textarea, select, button, a, label, [contenteditable="true"], [data-no-drag], .no-drag'
    )
}

const getAdjustedSnapPoints = (snapPoints: number[], initialExposure: number) =>
    snapPoints.map((snapPoint, index) =>
        index === snapPoints.length - 1
            ? clamp(snapPoint - initialExposure, 0, 100)
            : clamp(snapPoint, 0, 100)
    )

export function useBottomSheet({
    snapPoints = [0, 50, 100],
    initialSnapPoint = 0,
    initialExposure = 0,
    threshold = 50,
    dragResistance = 0.8,
    clickThreshold = 3,
    openingDragLimit
}: UseBottomSheetOptions): UseBottomSheetReturn {
    const snapPointsKey = snapPoints.join(',')
    const normalizedSnapPoints = useMemo(
        () => snapPointsKey.split(',').map(Number),
        [snapPointsKey]
    )
    const adjustedSnapPoints = useMemo(
        () => getAdjustedSnapPoints(normalizedSnapPoints, initialExposure),
        [initialExposure, normalizedSnapPoints]
    )
    const initialIndex = clamp(
        initialSnapPoint,
        0,
        adjustedSnapPoints.length - 1
    )
    const initialTranslateY = -adjustedSnapPoints[initialIndex]

    const sheetRef = useRef<HTMLElement | null>(null)
    const [containerElement, setContainerElement] =
        useState<HTMLElement | null>(null)
    const [translateY, setTranslateY] = useState(initialTranslateY)
    const [currentSnapPoint, setCurrentSnapPoint] = useState(initialIndex)
    const [isDragging, setIsDragging] = useState(false)

    const translateYRef = useRef(initialTranslateY)
    const currentSnapPointRef = useRef(initialIndex)
    const snapPointsRef = useRef(adjustedSnapPoints)
    const pointerRef = useRef<{
        id: number
        startY: number
        startTranslateY: number
        sheetHeight: number
        moved: boolean
    } | null>(null)

    const minTranslateY = -adjustedSnapPoints[adjustedSnapPoints.length - 1]
    const maxTranslateY = -adjustedSnapPoints[0]
    const isOpen = currentSnapPoint > 0
    const openingDragLimitBottomOffset = openingDragLimit?.bottomOffset
    const openingDragLimitOverflow = openingDragLimit?.overflow

    const setSheetRef = useCallback((node: HTMLElement | null) => {
        sheetRef.current = node
        setContainerElement(node)
    }, [])

    const setPosition = useCallback((index: number) => {
        const points = snapPointsRef.current
        const clampedIndex = clamp(index, 0, points.length - 1)
        const nextTranslateY = -points[clampedIndex]

        currentSnapPointRef.current = clampedIndex
        translateYRef.current = nextTranslateY
        setCurrentSnapPoint(clampedIndex)
        setTranslateY(nextTranslateY)
    }, [])

    const snapTo = useCallback(
        (index: number) => {
            setPosition(index)
        },
        [setPosition]
    )

    const open = useCallback(() => {
        snapTo(snapPointsRef.current.length - 1)
    }, [snapTo])

    const close = useCallback(() => {
        snapTo(0)
    }, [snapTo])

    const findClosestSnapPoint = useCallback((currentExposure: number) => {
        const points = snapPointsRef.current
        return points.reduce(
            (closestIndex, snapPoint, index) => {
                const distance = Math.abs(currentExposure - snapPoint)
                return distance < closestIndex.distance
                    ? { index, distance }
                    : closestIndex
            },
            { index: 0, distance: Infinity }
        ).index
    }, [])

    useEffect(() => {
        snapPointsRef.current = adjustedSnapPoints

        const clampedIndex = clamp(
            currentSnapPointRef.current,
            0,
            adjustedSnapPoints.length - 1
        )
        setPosition(clampedIndex)
    }, [adjustedSnapPoints, setPosition])

    useEffect(() => {
        const container = containerElement
        if (!container) return

        const onPointerDown = (event: PointerEvent) => {
            if (!event.isPrimary || isInteractiveTarget(event.target)) return

            const rect = container.getBoundingClientRect()
            pointerRef.current = {
                id: event.pointerId,
                startY: event.clientY,
                startTranslateY: translateYRef.current,
                sheetHeight: Math.max(rect.height, 1),
                moved: false
            }
            container.setPointerCapture(event.pointerId)
        }

        const onPointerMove = (event: PointerEvent) => {
            const pointer = pointerRef.current
            if (!pointer || pointer.id !== event.pointerId) return

            const distancePx = event.clientY - pointer.startY
            const distancePercent = (distancePx / pointer.sheetHeight) * 100
            const dragMinTranslateY =
                openingDragLimitBottomOffset != null &&
                openingDragLimitOverflow != null &&
                currentSnapPointRef.current === 0
                    ? Math.max(
                          minTranslateY,
                          -clamp(
                              100 +
                                  ((openingDragLimitOverflow -
                                      openingDragLimitBottomOffset) /
                                      pointer.sheetHeight) *
                                      100,
                              adjustedSnapPoints[0],
                              adjustedSnapPoints[adjustedSnapPoints.length - 1]
                          )
                      )
                    : minTranslateY
            const nextTranslateY = applyResistance(
                pointer.startTranslateY + distancePercent,
                dragMinTranslateY,
                maxTranslateY,
                dragResistance
            )

            if (Math.abs(distancePx) > clickThreshold) {
                pointer.moved = true
                setIsDragging(true)
            }

            event.preventDefault()
            translateYRef.current = nextTranslateY
            setTranslateY(nextTranslateY)
        }

        const onPointerUp = (event: PointerEvent) => {
            const pointer = pointerRef.current
            if (!pointer || pointer.id !== event.pointerId) return

            const distancePx = event.clientY - pointer.startY
            pointerRef.current = null
            setIsDragging(false)

            if (container.hasPointerCapture(event.pointerId)) {
                container.releasePointerCapture(event.pointerId)
            }

            if (!pointer.moved) {
                setPosition(currentSnapPointRef.current)
                return
            }

            if (Math.abs(distancePx) >= threshold) {
                const nextIndex =
                    distancePx > 0
                        ? currentSnapPointRef.current - 1
                        : currentSnapPointRef.current + 1
                setPosition(nextIndex)
                return
            }

            setPosition(findClosestSnapPoint(Math.abs(translateYRef.current)))
        }

        const onPointerCancel = (event: PointerEvent) => {
            if (pointerRef.current?.id !== event.pointerId) return

            pointerRef.current = null
            setIsDragging(false)
            setPosition(currentSnapPointRef.current)
        }

        container.addEventListener('pointerdown', onPointerDown)
        container.addEventListener('pointermove', onPointerMove)
        container.addEventListener('pointerup', onPointerUp)
        container.addEventListener('pointercancel', onPointerCancel)

        return () => {
            container.removeEventListener('pointerdown', onPointerDown)
            container.removeEventListener('pointermove', onPointerMove)
            container.removeEventListener('pointerup', onPointerUp)
            container.removeEventListener('pointercancel', onPointerCancel)
        }
    }, [
        clickThreshold,
        adjustedSnapPoints,
        containerElement,
        dragResistance,
        findClosestSnapPoint,
        maxTranslateY,
        minTranslateY,
        openingDragLimitBottomOffset,
        openingDragLimitOverflow,
        setPosition,
        threshold
    ])

    const exposurePercent = Math.abs(translateY)
    const translatePercent = 100 + translateY

    return {
        derivedValue: {
            isOpen,
            currentSnapPoint,
            exposurePercent,
            translatePercent,
            isDragging
        },
        open,
        close,
        snapTo,
        setSheetRef
    }
}

function applyResistance(
    value: number,
    min: number,
    max: number,
    resistance: number
) {
    if (value < min) return min
    if (value > max) return max + (value - max) * (1 - resistance)
    return value
}
