import { useEffect, useRef, useState, useCallback } from 'react'
import {
    fromEvent,
    merge,
    scan,
    switchMap,
    takeUntil,
    map,
    share,
    first,
    withLatestFrom,
    startWith,
    throttleTime,
    interval,
    takeWhile,
    of,
    concat,
    defer,
    animationFrameScheduler,
    filter,
    tap
} from 'rxjs'

interface UseCarouselOptions {
    itemCount: number
    threshold?: number
    duration?: number
    autoPlay?: boolean
    autoPlayInterval?: number
    gap?: number
    initialPosition?: number
    clickThreshold?: number // 클릭으로 인정할 최대 이동 거리
}

interface UseCarouselReturn {
    currentIndex: number
    translateX: number
    goToNext: () => void
    goToPrev: () => void
    goToIndex: (index: number) => void
    isDragging: boolean
    containerRef: React.RefObject<HTMLDivElement | null>
    cardRef: React.RefObject<HTMLDivElement | null>
    handleCardClick: (
        index: number,
        event: React.MouseEvent | React.TouchEvent
    ) => void
}

export function useCarousel({
    itemCount,
    threshold = 30,
    duration = 300,
    autoPlay = false,
    autoPlayInterval = 3000,
    gap = 16,
    initialPosition = 0,
    clickThreshold = 10 // 10px 이내 움직임은 클릭으로 처리
}: UseCarouselOptions): UseCarouselReturn {
    const containerRef = useRef<HTMLDivElement>(null)
    const cardRef = useRef<HTMLDivElement>(null)

    // containerWidth와 cardWidth를 state로 관리
    const [containerWidth, setContainerWidth] = useState(0)
    const [cardWidth, setCardWidth] = useState(0)

    const totalCardWidth = cardWidth + gap
    const totalWidth = totalCardWidth * itemCount
    const [translateX, setTranslateX] = useState(initialPosition)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const autoPlayRef = useRef<number>(0)
    const subscriptionRef = useRef<any>(null)

    // 드래그/클릭 상태 추적
    const dragStateRef = useRef({
        startX: 0,
        totalDistance: 0,
        isDragIntent: false
    })

    const SUPPORT_TOUCH = 'ontouchstart' in window
    const EVENTS = {
        start: SUPPORT_TOUCH ? 'touchstart' : 'mousedown',
        move: SUPPORT_TOUCH ? 'touchmove' : 'mousemove',
        end: SUPPORT_TOUCH ? 'touchend' : 'mouseup'
    }

    // RxJS 애니메이션 함수
    const createAnimation = (from: number, to: number) => {
        return defer(() => {
            const scheduler = animationFrameScheduler
            const start = scheduler.now()
            let animation$ = interval(0, scheduler).pipe(
                map(() => (scheduler.now() - start) / duration),
                takeWhile(progress => progress <= 1)
            )
            animation$ = concat(animation$, of(1)).pipe(
                map(rate => from + (to - from) * rate)
            )
            return animation$
        })
    }
    // 카드 클릭 핸들러
    const handleCardClick = (
        index: number,
        event: React.MouseEvent | React.TouchEvent
    ) => {
        if (!event) return
        // 이벤트 전파 방지
        // event.stopPropagation()

        if (index === currentIndex) {
            // 현재 활성화된 카드를 클릭한 경우
        } else {
            // 다른 카드를 클릭한 경우 - 해당 카드로 이동
            goToIndex(index)
        }
    }

    // 특정 인덱스로 이동 (중앙 정렬)
    const goToIndex = useCallback(
        (index: number) => {
            const clampedIndex = Math.max(0, Math.min(index, itemCount - 1))
            const targetTranslateX =
                -(clampedIndex * totalCardWidth) +
                (containerWidth / 2 - totalCardWidth / 2)

            setCurrentIndex(clampedIndex)
            setTranslateX(targetTranslateX)
        },
        [itemCount, containerWidth, cardWidth, gap]
    )

    // 다음으로 이동
    const goToNext = useCallback(() => {
        if (currentIndex < itemCount - 1) {
            goToIndex(currentIndex + 1)
        }
    }, [currentIndex, itemCount, goToIndex])

    // 이전으로 이동
    const goToPrev = useCallback(() => {
        if (currentIndex > 0) {
            goToIndex(currentIndex - 1)
        }
    }, [currentIndex, goToIndex])

    // RxJS 기반 이벤트 스트림 설정
    const streamFactory = useCallback(
        (container: HTMLDivElement) => {
            // 위치 추출 함수
            const toPos = (event: any) => {
                return SUPPORT_TOUCH
                    ? event.changedTouches[0].clientX
                    : event.clientX
            }

            // 이벤트 스트림 생성
            const start$ = fromEvent(container, EVENTS.start).pipe(
                map((e: any) => {
                    e.preventDefault()
                    const startX = toPos(e)
                    dragStateRef.current = {
                        startX,
                        totalDistance: 0,
                        isDragIntent: false
                    }
                    return startX
                })
            )

            const move$ = fromEvent(container, EVENTS.move).pipe(
                map((e: any) => {
                    e.preventDefault()
                    return toPos(e)
                })
            )

            const end$ = fromEvent(container, EVENTS.end).pipe(
                map((e: any) => {
                    e.preventDefault()
                    return toPos(e)
                })
            )

            // 드래그 스트림
            const drag$ = start$.pipe(
                switchMap(start =>
                    move$.pipe(
                        throttleTime(16), // 60fps
                        map(move => {
                            const distance = move - start
                            const totalDistance = Math.abs(distance)

                            // 드래그 의도 판단
                            if (totalDistance > clickThreshold) {
                                dragStateRef.current.isDragIntent = true
                            }

                            dragStateRef.current.totalDistance = totalDistance

                            return distance
                        }),
                        takeUntil(end$)
                    )
                ),
                map(distance => ({ distance }))
            )

            // 윈도우 리사이즈 스트림
            const size$ = fromEvent(window, 'resize').pipe(
                throttleTime(100),
                map(() => containerRef.current?.offsetWidth || 0),
                startWith(containerRef.current?.offsetWidth || 0)
            )

            // 드롭 스트림 - 드래그와 클릭을 구분
            const drop$ = start$.pipe(
                switchMap(start =>
                    end$.pipe(
                        map(end => ({
                            distance: end - start,
                            totalDistance: dragStateRef.current.totalDistance,
                            isDragIntent: dragStateRef.current.isDragIntent
                        })),
                        first()
                    )
                ),
                withLatestFrom(size$, (drop, size) => {
                    return { ...drop, size }
                })
            )

            return { start$, move$, end$, drag$, size$, drop$ }
        },
        [clickThreshold]
    )

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const { drag$, drop$ } = streamFactory(container)

        // containerWidth와 cardWidth 상태 업데이트
        const currentContainerWidth = containerRef.current?.offsetWidth || 0
        const currentCardWidth = cardRef.current?.offsetWidth || 0

        if (currentContainerWidth !== containerWidth) {
            setContainerWidth(currentContainerWidth)
        }
        if (currentCardWidth !== cardWidth) {
            setCardWidth(currentCardWidth)
        }

        // 컨테이너 너비 업데이트
        const updateContainerWidth = () => {
            if (containerRef.current && cardRef.current) {
                const newContainerWidth = containerRef.current.offsetWidth
                const newCardWidth = cardRef.current.offsetWidth
                const newTotalCardWidth = newCardWidth + gap

                setContainerWidth(newContainerWidth)
                setCardWidth(newCardWidth)

                const targetTranslateX =
                    -(currentIndex * newTotalCardWidth) +
                    (newContainerWidth / 2 - newCardWidth / 2)
                setTranslateX(targetTranslateX)
            }
        }
        updateContainerWidth()

        // 캐러셀 상태 관리 - 드래그만 처리
        const carousel$ = merge(
            drag$.pipe(map(event => ({ ...event, type: 'drag' }))),
            drop$.pipe(
                filter(event => event.isDragIntent), // 드래그 의도가 있었던 경우만 처리
                map(event => ({ ...event, type: 'drop' }))
            )
        ).pipe(
            scan(
                (store, event) => {
                    const { distance, type } = event
                    const size = 'size' in event ? event.size : undefined

                    const updateStore: any = {
                        from:
                            -(store.index * totalCardWidth) +
                            (containerWidth / 2 - totalCardWidth / 2) +
                            distance
                    }

                    if (type === 'drag') {
                        // 드래그 중
                        updateStore.to = updateStore.from
                        setIsDragging(true)
                        setTranslateX(updateStore.from)
                    } else if (type === 'drop') {
                        // 드래그 종료
                        setIsDragging(false)
                        let tobeIndex = store.index

                        if (Math.abs(distance) >= threshold) {
                            tobeIndex =
                                distance < 0
                                    ? Math.min(tobeIndex + 1, itemCount - 1)
                                    : Math.max(tobeIndex - 1, 0)
                        }

                        updateStore.index = tobeIndex
                        updateStore.to =
                            -(tobeIndex * totalCardWidth) +
                            ((size || 0) / 2 - totalCardWidth / 2)
                        updateStore.size = size

                        setCurrentIndex(tobeIndex)
                        setTranslateX(updateStore.to)
                    }

                    return { ...store, ...updateStore }
                },
                {
                    to: 0,
                    from: 0,
                    index: currentIndex,
                    size: totalCardWidth * itemCount
                }
            )
        )

        // 클릭 이벤트 처리 (별도 스트림)
        const click$ = drop$.pipe(
            filter(event => !event.isDragIntent), // 드래그 의도가 없었던 경우만 클릭으로 처리
            tap(() => {
                setIsDragging(false)
                // 컨테이너 클릭 시에는 별도 처리하지 않음
                // 개별 카드 클릭은 onCardClick으로 처리
            })
        )

        // 구독 시작
        subscriptionRef.current = merge(carousel$, click$).subscribe()

        // 리사이즈 옵저버
        const resizeObserver = new ResizeObserver(() => {
            updateContainerWidth()
        })
        resizeObserver.observe(container)

        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe()
            }
            resizeObserver.disconnect()
        }
    }, [
        itemCount,
        cardWidth,
        currentIndex,
        containerWidth,
        streamFactory,
        threshold
    ])

    // 자동재생 설정
    useEffect(() => {
        if (autoPlay) {
            autoPlayRef.current = window.setInterval(goToNext, autoPlayInterval)
        }

        return () => {
            if (autoPlayRef.current) {
                window.clearInterval(autoPlayRef.current)
            }
        }
    }, [autoPlay, autoPlayInterval, goToNext])

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe()
            }
            if (autoPlayRef.current) {
                window.clearInterval(autoPlayRef.current)
            }
        }
    }, [])

    return {
        currentIndex,
        translateX,
        goToNext,
        goToPrev,
        goToIndex,
        isDragging,
        containerRef,
        cardRef,
        handleCardClick
    }
}

