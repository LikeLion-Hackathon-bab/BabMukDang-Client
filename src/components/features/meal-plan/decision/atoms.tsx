/**
 * Decision-flow primitives — Tailwind/CSS-token port of the redesign's
 * `bm-shared.jsx` atoms. Status-semantic tones use the approved hex palette via
 * inline styles (those colors are not in the app's utility layer).
 */
import type { CSSProperties, ReactNode } from 'react'
import type { MealPlanStatus } from '@kimdaegyu/babmukdang-shared/domain'
import {
    CheckGlyph,
    CrossGlyph,
    Glyph,
    HeartGlyph,
    LockGlyph,
    type GlyphName
} from './glyphs'

export type Tone = 'gray' | 'yellow' | 'orange' | 'blue' | 'green' | 'red'

export const TONE: Record<Tone, { bg: string; fg: string }> = {
    gray: { bg: 'var(--color-gray-2)', fg: 'var(--color-gray-6)' },
    yellow: { bg: '#fff3d6', fg: '#b07000' },
    orange: { bg: 'var(--color-primary-100)', fg: 'var(--color-primary-main)' },
    blue: { bg: '#e6effc', fg: '#1f6fd6' },
    green: { bg: '#e3f5ea', fg: '#1f8a5b' },
    red: { bg: '#fde7e3', fg: '#c0392b' }
}

export const GREEN = '#1f8a5b'

const MEALPLAN_STATUS: Record<MealPlanStatus, { tone: Tone; label: string }> = {
    DRAFT: { tone: 'gray', label: '준비 중' },
    RECOMMENDING: { tone: 'yellow', label: '추천 중' },
    GATHERING: { tone: 'yellow', label: '모으는 중' },
    DECIDING: { tone: 'orange', label: '정하는 중' },
    READY: { tone: 'orange', label: '준비 완료' },
    CONFIRMED: { tone: 'blue', label: '확정됨' },
    LOCKED: { tone: 'blue', label: '확정됨' },
    COMPLETED: { tone: 'green', label: '완료' },
    RECORDED: { tone: 'green', label: '기록됨' },
    CANCELLED: { tone: 'red', label: '취소됨' }
}

/* category → tile color (food/place tile without an image) */
const FOOD_TILE: Record<string, string> = {
    한식: '#ff926d',
    일식: '#5b8def',
    중식: '#e0524a',
    양식: '#e6a23c',
    분식: '#d76fb0',
    카페: '#7a8a99',
    아시안: '#3fae8e',
    고기: '#c0392b',
    default: '#ff926d'
}

export function Card({
    children,
    selected = false,
    tint = false,
    pad = 14,
    style,
    onClick
}: {
    children: ReactNode
    selected?: boolean
    tint?: boolean
    pad?: number
    style?: CSSProperties
    onClick?: () => void
}) {
    return (
        <div
            onClick={onClick}
            style={{
                background: tint
                    ? 'var(--color-primary-100)'
                    : 'var(--color-white)',
                border: selected
                    ? '1px solid var(--color-primary-main)'
                    : tint
                      ? '1px solid var(--color-primary-300)'
                      : '1px solid transparent',
                borderRadius: 'var(--radius-lg)',
                boxShadow: tint ? 'none' : '0 2px 10px rgba(153,153,153,0.1)',
                padding: pad,
                boxSizing: 'border-box',
                ...style
            }}>
            {children}
        </div>
    )
}

export function Pill({
    tone = 'gray',
    children,
    dot = false
}: {
    tone?: Tone
    children: ReactNode
    dot?: boolean
}) {
    const t = TONE[tone]
    return (
        <span
            className="text-caption-medium"
            style={{
                background: t.bg,
                color: t.fg,
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: 9999,
                lineHeight: 1.4,
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
            }}>
            {dot && (
                <span
                    style={{
                        width: 5,
                        height: 5,
                        borderRadius: 9999,
                        background: t.fg
                    }}
                />
            )}
            {children}
        </span>
    )
}

export function RoleChip({ role }: { role: string }) {
    const map: Record<string, string> = {
        OWNER: '소유자',
        FRIEND: '친구',
        GUEST: '게스트',
        LATE: '늦참'
    }
    const tone: Tone =
        role === 'OWNER' ? 'orange' : role === 'GUEST' ? 'yellow' : 'gray'
    const t = TONE[tone]
    return (
        <span
            style={{
                background: t.bg,
                color: t.fg,
                fontSize: 10.5,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 9999
            }}>
            {map[role] ?? role}
        </span>
    )
}

export function StatusBadge({ status }: { status: MealPlanStatus }) {
    const def = MEALPLAN_STATUS[status] ?? MEALPLAN_STATUS.DRAFT
    const t = TONE[def.tone]
    return (
        <span
            style={{
                background: t.bg,
                color: t.fg,
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: 9999,
                whiteSpace: 'nowrap'
            }}>
            {def.label}
        </span>
    )
}

export function SectionLabel({
    children,
    right
}: {
    children: ReactNode
    right?: ReactNode
}) {
    return (
        <div className="flex items-center justify-between px-2">
            <span
                style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: 'var(--color-gray-4)'
                }}>
                {children}
            </span>
            {right}
        </div>
    )
}

export function Segmented({
    tabs,
    active,
    onChange
}: {
    tabs: string[]
    active: string
    onChange?: (tab: string) => void
}) {
    return (
        <div
            className="flex"
            style={{
                background: 'var(--color-gray-1)',
                borderRadius: 'var(--radius-md)',
                padding: 3,
                gap: 3
            }}>
            {tabs.map(tab => {
                const on = tab === active
                return (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => onChange?.(tab)}
                        className="flex-1"
                        style={{
                            textAlign: 'center',
                            fontSize: 12.5,
                            fontWeight: 700,
                            padding: '8px 0',
                            borderRadius: 'var(--radius-sm)',
                            whiteSpace: 'nowrap',
                            border: 'none',
                            background: on ? 'var(--color-white)' : 'transparent',
                            color: on
                                ? 'var(--color-gray-8)'
                                : 'var(--color-gray-4)',
                            boxShadow: on
                                ? '0 2px 10px rgba(153,153,153,0.1)'
                                : 'none'
                        }}>
                        {tab}
                    </button>
                )
            })}
        </div>
    )
}

export function FoodTile({
    category = 'default',
    label,
    size = 44,
    radius = 10,
    excluded = false
}: {
    category?: string
    label?: string
    size?: number
    radius?: number
    excluded?: boolean
}) {
    const color = FOOD_TILE[category] ?? FOOD_TILE.default
    const initial = (label || category || '?')[0] ?? '?'
    return (
        <div
            style={{
                width: size,
                height: size,
                flex: 'none',
                borderRadius: radius,
                display: 'grid',
                placeItems: 'center',
                background: `${color}22`,
                opacity: excluded ? 0.35 : 1
            }}>
            <span style={{ fontSize: size * 0.4, fontWeight: 700, color }}>
                {initial}
            </span>
        </div>
    )
}

const SOURCE_LABEL: Record<string, { t: string; c: string }> = {
    'external-recommendation': { t: 'AI 추천', c: 'var(--color-primary-main)' },
    'prefer-menu': { t: '내 선호', c: GREEN },
    'recent-menu': { t: '최근', c: 'var(--color-gray-5)' },
    'manual-search': { t: '직접 추가', c: 'var(--color-gray-5)' },
    midpoint: { t: '중간 지점', c: 'var(--color-primary-main)' },
    search: { t: '검색', c: 'var(--color-gray-5)' },
    manual: { t: '직접 추가', c: 'var(--color-gray-5)' },
    'recent-place': { t: '최근', c: 'var(--color-gray-5)' },
    fallback: { t: '기본 추천', c: 'var(--color-gray-4)' }
}

export function SourceLabel({ source }: { source?: string }) {
    if (!source) return null
    const s = SOURCE_LABEL[source] ?? SOURCE_LABEL['recent-menu']
    return (
        <span
            style={{
                fontSize: 10,
                fontWeight: 700,
                color: s.c,
                background: 'var(--color-gray-1)',
                padding: '2px 7px',
                borderRadius: 9999
            }}>
            {s.t}
        </span>
    )
}

export type AvatarPerson = {
    name?: string | null
    imageUrl?: string | null
    ready?: boolean
}

export function Avatar({
    person,
    size = 36,
    ring = false
}: {
    person?: AvatarPerson
    size?: number
    ring?: boolean
}) {
    const initial = (person?.name ?? '?').trim()[0] ?? '?'
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: 9999,
                flex: 'none',
                display: 'grid',
                placeItems: 'center',
                background: 'var(--color-gray-2)',
                color: 'var(--color-gray-6)',
                fontSize: size * 0.4,
                fontWeight: 700,
                boxShadow: ring ? `0 0 0 2px var(--color-primary-main)` : 'none',
                overflow: 'hidden'
            }}>
            {person?.imageUrl ? (
                <img
                    src={person.imageUrl}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            ) : (
                initial
            )}
        </div>
    )
}

export function AvatarStack({
    people = [],
    size = 26,
    max = 4
}: {
    people?: AvatarPerson[]
    size?: number
    max?: number
}) {
    const shown = people.slice(0, max)
    return (
        <div className="flex items-center">
            {shown.map((p, i) => (
                <div
                    key={i}
                    style={{
                        marginLeft: i ? -8 : 0,
                        borderRadius: 9999,
                        boxShadow: '0 0 0 2px var(--color-white)',
                        opacity: p.ready === false ? 0.45 : 1,
                        filter: p.ready === false ? 'grayscale(0.4)' : 'none'
                    }}>
                    <Avatar person={p} size={size} ring={p.ready} />
                </div>
            ))}
            {people.length > max && (
                <div
                    style={{
                        marginLeft: -8,
                        width: size,
                        height: size,
                        borderRadius: 9999,
                        background: 'var(--color-gray-2)',
                        display: 'grid',
                        placeItems: 'center',
                        boxShadow: '0 0 0 2px var(--color-white)'
                    }}>
                    <span
                        style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: 'var(--color-gray-6)'
                        }}>
                        +{people.length - max}
                    </span>
                </div>
            )}
        </div>
    )
}

export function ReadyMeter({
    ready,
    total,
    people = [],
    compact = false
}: {
    ready: number
    total: number
    people?: AvatarPerson[]
    compact?: boolean
}) {
    const pct = total ? Math.round((ready / total) * 100) : 0
    return (
        <div className="flex flex-col" style={{ gap: 8 }}>
            <div className="flex items-center justify-between">
                <span
                    style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--color-gray-8)'
                    }}>
                    <span style={{ color: 'var(--color-primary-main)' }}>
                        {ready}
                    </span>
                    /{total}명 준비됨
                </span>
                {!compact && <AvatarStack people={people} size={24} />}
            </div>
            <div
                style={{
                    height: 7,
                    borderRadius: 9999,
                    background: 'var(--color-gray-2)',
                    overflow: 'hidden'
                }}>
                <div
                    style={{
                        width: `${pct}%`,
                        height: '100%',
                        borderRadius: 9999,
                        background: 'var(--color-primary-main)'
                    }}
                />
            </div>
        </div>
    )
}

export type VoteState = 'prefer' | 'pick' | 'excluded' | undefined

/**
 * Vote affordance. `pickOnly` collapses to a single 선택 toggle (date/time/area/
 * restaurant). Otherwise shows 선호(PREFER) / 선택(PICK) / 제외(EXCLUDE) — EXCLUDE
 * is preserved for the menu stage per the redesign decision.
 */
export function VoteControls({
    state,
    size = 'sm',
    pickOnly = false,
    onPick,
    onPrefer,
    onExclude,
    disabled = false
}: {
    state?: VoteState
    size?: 'sm' | 'lg'
    pickOnly?: boolean
    onPick?: () => void
    onPrefer?: () => void
    onExclude?: () => void
    disabled?: boolean
}) {
    const h = size === 'lg' ? 44 : 32
    const fs = size === 'lg' ? 14 : 12
    const baseStyle: CSSProperties = {
        height: h,
        borderRadius: 9999,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        fontSize: fs,
        fontWeight: 700,
        padding: size === 'lg' ? '0 16px' : '0 11px',
        border: 'none',
        opacity: disabled ? 0.5 : 1
    }

    if (pickOnly) {
        const sel = state === 'pick'
        return (
            <button
                type="button"
                disabled={disabled}
                onClick={onPick}
                style={{
                    ...baseStyle,
                    padding: size === 'lg' ? '0 20px' : '0 15px',
                    background: sel
                        ? 'var(--color-primary-main)'
                        : 'var(--color-white)',
                    color: sel ? '#fff' : 'var(--color-gray-6)',
                    border: sel
                        ? '1px solid var(--color-primary-main)'
                        : '1px solid var(--color-gray-2)'
                }}>
                <CheckGlyph
                    size={size === 'lg' ? 17 : 14}
                    color={sel ? '#fff' : 'var(--color-gray-4)'}
                />
                선택
            </button>
        )
    }

    return (
        <div className="flex" style={{ gap: 6 }}>
            <button
                type="button"
                disabled={disabled}
                onClick={onPrefer}
                style={{
                    ...baseStyle,
                    width: size === 'lg' ? 'auto' : h,
                    padding: size === 'lg' ? '0 14px' : 0,
                    background:
                        state === 'prefer'
                            ? 'var(--color-primary-100)'
                            : 'var(--color-gray-1)',
                    color:
                        state === 'prefer'
                            ? 'var(--color-primary-main)'
                            : 'var(--color-gray-5)',
                    border:
                        state === 'prefer'
                            ? '1px solid var(--color-primary-300)'
                            : '1px solid transparent'
                }}>
                <HeartGlyph
                    size={size === 'lg' ? 18 : 15}
                    filled={state === 'prefer'}
                />
                {size === 'lg' && '선호'}
            </button>
            <button
                type="button"
                disabled={disabled}
                onClick={onPick}
                style={{
                    ...baseStyle,
                    background:
                        state === 'pick'
                            ? 'var(--color-primary-main)'
                            : 'var(--color-gray-8)',
                    color: '#fff'
                }}>
                <CheckGlyph size={size === 'lg' ? 17 : 14} color="#fff" />
                선택
            </button>
            <button
                type="button"
                disabled={disabled}
                onClick={onExclude}
                style={{
                    ...baseStyle,
                    width: size === 'lg' ? 'auto' : h,
                    padding: size === 'lg' ? '0 14px' : 0,
                    background:
                        state === 'excluded'
                            ? '#fde7e3'
                            : 'var(--color-gray-1)',
                    color:
                        state === 'excluded' ? '#c0392b' : 'var(--color-gray-4)'
                }}>
                <CrossGlyph size={size === 'lg' ? 17 : 14} />
                {size === 'lg' && '제외'}
            </button>
        </div>
    )
}

export function InlineBanner({
    tone = 'yellow',
    icon = 'time',
    title,
    body,
    action,
    onAction
}: {
    tone?: Tone
    icon?: GlyphName
    title: ReactNode
    body?: ReactNode
    action?: ReactNode
    onAction?: () => void
}) {
    const t = TONE[tone]
    return (
        <div
            className="flex"
            style={{
                gap: 10,
                background: t.bg,
                borderRadius: 'var(--radius-lg)',
                padding: '12px 13px',
                alignItems: 'flex-start'
            }}>
            <div
                style={{
                    flex: 'none',
                    width: 22,
                    height: 22,
                    borderRadius: 9999,
                    background: `${t.fg}22`,
                    display: 'grid',
                    placeItems: 'center',
                    marginTop: 1
                }}>
                <Glyph name={icon} size={14} color={t.fg} />
            </div>
            <div className="min-w-0" style={{ flex: 1 }}>
                <div
                    style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: t.fg,
                        lineHeight: 1.4
                    }}>
                    {title}
                </div>
                {body && (
                    <div
                        style={{
                            fontSize: 12,
                            color: 'var(--color-gray-6)',
                            marginTop: 2,
                            lineHeight: 1.5
                        }}>
                        {body}
                    </div>
                )}
            </div>
            {action && (
                <button
                    type="button"
                    onClick={onAction}
                    style={{
                        flex: 'none',
                        fontSize: 12,
                        fontWeight: 700,
                        color: t.fg,
                        alignSelf: 'center',
                        background: 'none',
                        border: 'none'
                    }}>
                    {action}
                </button>
            )}
        </div>
    )
}

export function DependencyHint({ children }: { children: ReactNode }) {
    return (
        <div
            className="flex items-center"
            style={{
                gap: 8,
                background: 'var(--color-gray-1)',
                borderRadius: 'var(--radius-md)',
                padding: '9px 11px'
            }}>
            <LockGlyph size={13} color="var(--color-gray-4)" />
            <span
                style={{
                    fontSize: 12,
                    color: 'var(--color-gray-5)',
                    fontWeight: 500,
                    lineHeight: 1.45
                }}>
                {children}
            </span>
        </div>
    )
}
