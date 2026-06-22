import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode
} from 'react'
import { createPortal } from 'react-dom'
import { useBottomSheet } from '@/hooks'

const DEFAULT_DURATION = 280

type BottomSheetPortalProps = {
    open: boolean
    onClose: () => void
    children: ReactNode
    className?: string
    style?: CSSProperties
    backdropClassName?: string
    backdropStyle?: CSSProperties
    snapPoints?: number[]
    bottomOffset?: number
    openBottomOffset?: number
    dragLimitOverflow?: number
    duration?: number
    persistent?: boolean
    showBackdrop?: boolean
    closeOnBackdrop?: boolean
    interactiveWhenClosed?: boolean
    zIndex?: number
    openZIndex?: number
    portalContainerId?: string
    renderInline?: boolean
}

export function BottomSheetPortal({
    open,
    onClose,
    children,
    className,
    style,
    backdropClassName,
    backdropStyle,
    snapPoints = [0, 100],
    bottomOffset = 0,
    openBottomOffset = 0,
    dragLimitOverflow,
    duration = DEFAULT_DURATION,
    persistent = false,
    showBackdrop = true,
    closeOnBackdrop = true,
    interactiveWhenClosed = true,
    zIndex = 1000,
    openZIndex,
    portalContainerId,
    renderInline = false
}: BottomSheetPortalProps) {
    const [mounted, setMounted] = useState(open || persistent)
    const [portalNode, setPortalNode] = useState<HTMLElement | null>(null)
    const hasOpenedRef = useRef(false)
    const isClosingRef = useRef(false)
    const closeTimerRef = useRef<number | null>(null)
    const animationFrameRef = useRef<number | null>(null)
    const {
        setSheetRef,
        derivedValue: { translatePercent, isDragging, isOpen },
        snapTo
    } = useBottomSheet({
        snapPoints,
        initialSnapPoint: 0,
        initialExposure: 0,
        openingDragLimit: persistent
            ? {
                  bottomOffset,
                  overflow: dragLimitOverflow ?? bottomOffset
              }
            : undefined
    })

    const openSnapIndex = snapPoints.length - 1

    const clearScheduledWork = useCallback(() => {
        if (closeTimerRef.current !== null) {
            window.clearTimeout(closeTimerRef.current)
            closeTimerRef.current = null
        }
        if (animationFrameRef.current !== null) {
            window.cancelAnimationFrame(animationFrameRef.current)
            animationFrameRef.current = null
        }
    }, [])

    const requestClose = useCallback(() => {
        if (isClosingRef.current) return
        isClosingRef.current = true
        clearScheduledWork()
        snapTo(0)
        closeTimerRef.current = window.setTimeout(() => {
            closeTimerRef.current = null
            onClose()
            if (!persistent) setMounted(false)
        }, duration)
    }, [clearScheduledWork, duration, onClose, persistent, snapTo])

    useEffect(() => {
        if (!portalContainerId) {
            setPortalNode(document.body)
            return
        }

        setPortalNode(
            document.getElementById(portalContainerId) ?? document.body
        )
    }, [portalContainerId])

    useEffect(() => {
        if (open) {
            setMounted(true)
            isClosingRef.current = false
            clearScheduledWork()
            animationFrameRef.current = window.requestAnimationFrame(() => {
                animationFrameRef.current = null
                snapTo(openSnapIndex)
            })
            return
        }

        if (persistent) {
            isClosingRef.current = false
            clearScheduledWork()
            snapTo(0)
            return
        }

        if (mounted) {
            isClosingRef.current = false
            clearScheduledWork()
            snapTo(0)
            closeTimerRef.current = window.setTimeout(() => {
                closeTimerRef.current = null
                setMounted(false)
            }, duration)
        }
    }, [
        clearScheduledWork,
        duration,
        mounted,
        open,
        openSnapIndex,
        persistent,
        snapTo
    ])

    useEffect(() => {
        if (isOpen) {
            hasOpenedRef.current = true
            isClosingRef.current = false
            return
        }

        if (!open || !hasOpenedRef.current || isDragging) return

        requestClose()
    }, [isDragging, isOpen, open, requestClose])

    useEffect(
        () => () => {
            clearScheduledWork()
        },
        [clearScheduledWork]
    )

    if (!mounted || (!renderInline && !portalNode)) return null

    const shouldShowBackdrop = showBackdrop && isOpen
    const shouldHandleSheetEvents = open || interactiveWhenClosed
    const activeZIndex = isOpen ? (openZIndex ?? zIndex) : zIndex
    const currentBottomOffset =
        persistent && isOpen ? openBottomOffset : bottomOffset

    const bottomSheetElement = (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: activeZIndex,
                pointerEvents: 'none'
            }}>
            {showBackdrop && (
                <div
                    className={backdropClassName}
                    onClick={closeOnBackdrop ? requestClose : undefined}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(18,18,18,0.34)',
                        opacity: shouldShowBackdrop ? 1 : 0,
                        transition: `opacity ${duration}ms ease-out`,
                        pointerEvents: shouldShowBackdrop ? 'auto' : 'none',
                        ...backdropStyle
                    }}
                />
            )}
            <section
                ref={setSheetRef}
                className={className}
                style={{
                    position: 'fixed',
                    right: 0,
                    bottom: currentBottomOffset,
                    left: 0,
                    transform: `translateY(${translatePercent}%)`,
                    transition: isDragging
                        ? 'none'
                        : [
                              `transform ${duration}ms ease-out`,
                              `bottom ${duration}ms ease-out`
                          ].join(', '),
                    touchAction: 'none',
                    pointerEvents: shouldHandleSheetEvents ? 'auto' : 'none',
                    ...style
                }}>
                {children}
            </section>
        </div>
    )

    if (renderInline) return bottomSheetElement
    if (!portalNode) return null

    return createPortal(bottomSheetElement, portalNode)
}
