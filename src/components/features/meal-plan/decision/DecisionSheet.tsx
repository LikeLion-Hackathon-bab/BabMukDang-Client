/**
 * Context-preserving bottom sheet built on the shared `useBottomSheet` hook.
 * The stage switcher stays visible behind a scrim; the sheet rises from the
 * bottom and can be dragged down to dismiss. Used by every register sheet and
 * the friend-votes sheet.
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
    return (
        <BottomSheetPortal
            open
            onClose={onClose}
            style={{
                zIndex: 1,
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
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    flex: 'none',
                    cursor: 'grab',
                    touchAction: 'none',
                    userSelect: 'none'
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
            </div>
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
