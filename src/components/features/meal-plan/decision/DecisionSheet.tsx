/**
 * A decision sheet may remain mounted in a collapsed state, so adding a
 * candidate is always one drag or tap away without a separate CTA in the poll.
 */
import { type ReactNode } from 'react'
import { BottomSheetPortal } from '@/components/shared'

export function DecisionSheet({
    title,
    hint,
    cta,
    onCta,
    ctaDisabled = false,
    onClose,
    onOpen,
    open = true,
    persistent = false,
    children
}: {
    title: string
    hint?: ReactNode
    cta?: string
    onCta?: () => void
    ctaDisabled?: boolean
    onClose: () => void
    onOpen?: () => void
    open?: boolean
    persistent?: boolean
    children: ReactNode
}) {
    return (
        <BottomSheetPortal
            open={open}
            persistent={persistent}
            snapPoints={persistent ? [18, 94] : [0, 100]}
            bottomOffset={0}
            onClose={onClose}
            showBackdrop={open}
            style={{
                zIndex: 100,
                background: 'var(--color-white)',
                borderRadius: '20px 20px 0 0',
                boxShadow: '0 -8px 30px rgba(28,28,28,0.18)',
                padding: '10px 16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                maxHeight: '86%',
                overflow: 'hidden'
            }}>
            <button
                type="button"
                onClick={() => {
                    if (!open) onOpen?.()
                }}
                aria-label={`${title} 열기`}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    flex: 'none',
                    cursor: open ? 'grab' : 'pointer',
                    touchAction: 'none',
                    userSelect: 'none',
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    textAlign: 'left'
                }}>
                <div
                    style={{
                        width: 40,
                        height: 4,
                        borderRadius: 9999,
                        background: 'var(--color-gray-2)',
                        alignSelf: 'center',
                        flex: 'none'
                    }}
                />
                <div style={{ flex: 'none' }}>
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
            </button>
            <div
                className="no-drag"
                style={{
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    minHeight: 0
                }}>
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
                        opacity: ctaDisabled ? 0.5 : 1,
                        flex: 'none'
                    }}>
                    {cta}
                </button>
            )}
        </BottomSheetPortal>
    )
}
