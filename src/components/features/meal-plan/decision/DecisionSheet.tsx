/**
 * Context-preserving bottom sheet built on the shared `useBottomSheet` hook.
 * The stage switcher stays visible behind a scrim; the sheet rises from the
 * bottom and can be dragged down to dismiss. Used by every register sheet and
 * the friend-votes sheet.
 */
import { useEffect, type ReactNode } from 'react'
import { useBottomSheet } from '@/hooks'

export function DecisionSheet({
    title,
    hint,
    cta,
    onCta,
    ctaDisabled = false,
    onClose,
    children
}: {
    title: string
    hint?: ReactNode
    cta?: string
    onCta?: () => void
    ctaDisabled?: boolean
    onClose: () => void
    children: ReactNode
}) {
    const {
        containerRef,
        backdropRef,
        translateY,
        isDragging,
        isOpen,
        handleBackdropClick
    } = useBottomSheet({
        snapPoints: [0, 100],
        initialSnapPoint: 1,
        initialExposure: 0,
        enableBackdrop: true
    })

    useEffect(() => {
        if (!isOpen) onClose()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    return (
        <>
            <div
                ref={backdropRef}
                onClick={handleBackdropClick}
                className="chat-overlay"
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(18,18,18,0.34)',
                    zIndex: 20
                }}
            />
            <div
                ref={containerRef}
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 21,
                    transform: `translateY(${100 + translateY}%)`,
                    transition: isDragging ? 'none' : 'transform 280ms ease-out',
                    background: 'var(--color-white)',
                    borderRadius: '20px 20px 0 0',
                    boxShadow: '0 -8px 30px rgba(28,28,28,0.18)',
                    padding: '10px 16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    maxHeight: '86%',
                    touchAction: 'none'
                }}>
                <div
                    style={{
                        width: 40,
                        height: 4,
                        borderRadius: 9999,
                        background: 'var(--color-gray-2)',
                        alignSelf: 'center'
                    }}
                />
                <div>
                    <span
                        style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: 'var(--color-gray-8)'
                        }}>
                        {title}
                    </span>
                    {hint && (
                        <div
                            style={{
                                fontSize: 12,
                                color: 'var(--color-gray-5)',
                                marginTop: 3,
                                lineHeight: 1.45
                            }}>
                            {hint}
                        </div>
                    )}
                </div>
                <div
                    className="no-drag"
                    style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {children}
                </div>
                {cta && (
                    <button
                        type="button"
                        onClick={onCta}
                        disabled={ctaDisabled}
                        style={{
                            width: '100%',
                            height: 48,
                            borderRadius: 9999,
                            border: 'none',
                            background: 'var(--color-primary-main)',
                            color: '#fff',
                            fontSize: 15,
                            fontWeight: 700,
                            opacity: ctaDisabled ? 0.5 : 1
                        }}>
                        {cta}
                    </button>
                )}
            </div>
        </>
    )
}
