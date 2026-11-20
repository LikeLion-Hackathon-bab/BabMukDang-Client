import { TrashIcon } from '@/assets/icons'
import { COLORS } from '@/constants/colors'
import { useEffect, useRef, useState, useCallback } from 'react'
import {
    fromEvent,
    merge,
    scan,
    switchMap,
    takeUntil,
    map,
    throttleTime,
    filter,
    tap,
    first
} from 'rxjs'

interface SwipeableCardProps {
    children: React.ReactNode
    onDelete?: () => void
    threshold?: number
    duration?: number
    deleteButtonWidth?: number
    resistance?: number
    className?: string
    explicitDeleteMode?: boolean
    deleteButtonTestId?: string
}

interface SwipeableCardReturn {
    translateX: number
    isDragging: boolean
    containerRef: React.RefObject<HTMLDivElement>
    handleDelete: () => void
}

export function SwipeableCard({
    children,
    onDelete,
    threshold = 60,
    duration = 300,
    deleteButtonWidth = 90,
    resistance = 0.4,
    className = '',
    explicitDeleteMode = false,
    deleteButtonTestId = 'swipeable-card-delete-button'
}: SwipeableCardProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [translateX, setTranslateX] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const subscriptionRef = useRef<any>(null)

    const SUPPORT_TOUCH = 'ontouchstart' in window
    const EVENTS = {
        start: SUPPORT_TOUCH ? 'touchstart' : 'mousedown',
        move: SUPPORT_TOUCH ? 'touchmove' : 'mousemove',
        end: SUPPORT_TOUCH ? 'touchend' : 'mouseup'
    }

    // 삭제 핸들러
    const handleDelete = useCallback(() => {
        if (onDelete) {
            onDelete()
        }
    }, [onDelete])

    // 애니메이션으로 원위치로 복귀
    const resetPosition = useCallback(() => {
        const startX = translateX
        const startTime = Date.now()

        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const easeOut = 1 - Math.pow(1 - progress, 3) // ease-out cubic

            const newX = startX * (1 - easeOut)
            setTranslateX(newX)

            if (progress < 1) {
                requestAnimationFrame(animate)
            } else {
                setTranslateX(0)
                setIsDragging(false)
            }
        }

        requestAnimationFrame(animate)
    }, [translateX, duration])

    // 스와이프 완료 시 삭제 버튼 표시 또는 원위치
    const handleSwipeComplete = useCallback(
        (distance: number) => {
            if (Math.abs(distance) >= threshold) {
                // 삭제 버튼이 완전히 보이도록 이동
                const targetX =
                    distance < 0 ? -deleteButtonWidth : deleteButtonWidth
                setTranslateX(targetX)
                setIsDragging(false)
            } else {
                // 원위치로 복귀
                resetPosition()
                // setTranslateX(0)
                // setIsDragging(false)
            }
        },
        [threshold, deleteButtonWidth]
    )

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        // 위치 추출 함수
        const toPos = (event: any) => {
            return SUPPORT_TOUCH
                ? event.changedTouches[0].clientX
                : event.clientX
        }

        // 이벤트 스트림 생성
        const start$ = fromEvent(container, EVENTS.start).pipe(
            map((e: any) => {
                return toPos(e)
            })
        )

        const move$ = fromEvent(container, EVENTS.move).pipe(
            map((e: any) => {
                return toPos(e)
            })
        )

        const end$ = fromEvent(container, EVENTS.end).pipe(
            map((e: any) => {
                return toPos(e)
            })
        )

        // 드래그 스트림
        const drag$ = start$.pipe(
            switchMap(start =>
                move$.pipe(
                    throttleTime(16), // 60fps
                    map(move => move - start),
                    takeUntil(end$)
                )
            ),
            map(distance => ({ distance, type: 'drag' }))
        )

        // 드롭 스트림
        const drop$ = start$.pipe(
            switchMap(start =>
                end$.pipe(
                    map(end => end - start),
                    map(distance => ({ distance, type: 'drop' })),
                    first()
                )
            )
        )

        // 스와이프 상태 관리
        const swipe$ = merge(drag$, drop$).pipe(
            scan(
                (state, event) => {
                    const { distance, type } = event
                    let newDistance = distance * resistance
                    if (type === 'drag') {
                        // 드래그 중 - 왼쪽으로만 스와이프 허용
                        let newX = Math.min(0, newDistance)
                        newX = Math.max(newX, -deleteButtonWidth)
                        setIsDragging(true)
                        setTranslateX(newX)
                        return { ...state, currentX: newX }
                    } else if (type === 'drop') {
                        // 드래그 종료
                        let newX = Math.min(0, newDistance)
                        newX = Math.max(newX, -deleteButtonWidth)
                        handleSwipeComplete(newX)
                        return { ...state, currentX: 0 }
                    }

                    return state
                },
                { currentX: 0 }
            )
        )

        // 구독 시작
        subscriptionRef.current = swipe$.subscribe()

        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe()
            }
        }
    }, [handleSwipeComplete])

    return (
        <div className={`relative overflow-hidden ${className} select-none`}>
            {explicitDeleteMode && (
                <button
                    type="button"
                    data-testid={`${deleteButtonTestId}-explicit`}
                    onClick={handleDelete}
                    className="sr-only">
                    테스트 삭제
                </button>
            )}
            {/* 삭제 버튼 */}
            <div
                className="bg-gray-4 absolute top-0 right-0 z-10 flex h-full w-20 items-center justify-center"
                style={{ width: `${deleteButtonWidth}px` }}>
                <button
                    type="button"
                    data-testid={deleteButtonTestId}
                    onClick={handleDelete}
                    className="text-caption-medium flex flex-col items-center justify-center gap-10 text-white">
                    <TrashIcon strokecolor={COLORS.white} />
                    삭제하기
                </button>
            </div>

            {/* 메인 카드 */}
            <div
                ref={containerRef}
                className="relative z-20 cursor-grab bg-white active:cursor-grabbing"
                style={{
                    transform: `translateX(${translateX}px)`,
                    transition: isDragging
                        ? 'none'
                        : `transform ${duration}ms ease-out`
                }}>
                {children}
            </div>
        </div>
    )
}
