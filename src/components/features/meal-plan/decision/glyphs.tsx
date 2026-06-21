/**
 * Decision-flow glyph set — compact, uniform inline SVGs with full color/size
 * control. The redesign relies on precise small mono-icons, so we keep our own
 * set here instead of the app's mixed decorative icon components.
 */

type GlyphProps = {
    size?: number
    color?: string
    className?: string
}

const base = (size: number): React.SVGProps<SVGSVGElement> => ({
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    style: { display: 'block', flex: 'none' }
})

export function CheckGlyph({ size = 14, color = 'currentColor' }: GlyphProps) {
    return (
        <svg {...base(size)}>
            <path
                d="M5 12.5l4.2 4.3L19 7"
                fill="none"
                stroke={color}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export function CrossGlyph({ size = 14, color = 'currentColor' }: GlyphProps) {
    return (
        <svg {...base(size)}>
            <path
                d="M7 7l10 10M17 7L7 17"
                fill="none"
                stroke={color}
                strokeWidth="2.2"
                strokeLinecap="round"
            />
        </svg>
    )
}

export function LockGlyph({ size = 13, color = 'currentColor' }: GlyphProps) {
    return (
        <svg {...base(size)}>
            <rect
                x="5"
                y="10.5"
                width="14"
                height="9"
                rx="2.4"
                fill="none"
                stroke={color}
                strokeWidth="1.8"
            />
            <path
                d="M8 10.5V8a4 4 0 0 1 8 0v2.5"
                fill="none"
                stroke={color}
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    )
}

export function HeartGlyph({
    size = 16,
    color = 'currentColor',
    filled = false
}: GlyphProps & { filled?: boolean }) {
    return (
        <svg {...base(size)}>
            <path
                d="M12 20s-7-4.4-7-9.3A3.7 3.7 0 0 1 12 7.8 3.7 3.7 0 0 1 19 10.7C19 15.6 12 20 12 20z"
                fill={filled ? color : 'none'}
                stroke={color}
                strokeWidth="1.7"
                strokeLinejoin="round"
            />
        </svg>
    )
}

const stroke = (color: string) => ({
    fill: 'none',
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const
})

export type GlyphName =
    | 'calendar'
    | 'time'
    | 'location'
    | 'dish'
    | 'meeting'
    | 'people'
    | 'search'
    | 'add'
    | 'comment'
    | 'send'
    | 'modify'
    | 'up'
    | 'down'
    | 'arrow'
    | 'back'

export function Glyph({
    name,
    size = 18,
    color = 'currentColor'
}: GlyphProps & { name: GlyphName }) {
    const s = stroke(color)
    switch (name) {
        case 'calendar':
            return (
                <svg {...base(size)}>
                    <rect x="4" y="5.5" width="16" height="15" rx="2.5" {...s} />
                    <path d="M4 9.5h16M8 3.5v4M16 3.5v4" {...s} />
                </svg>
            )
        case 'time':
            return (
                <svg {...base(size)}>
                    <circle cx="12" cy="12" r="8" {...s} />
                    <path d="M12 7.5V12l3 2" {...s} />
                </svg>
            )
        case 'location':
            return (
                <svg {...base(size)}>
                    <path
                        d="M12 21c4.5-4.2 7-7.4 7-10.6A7 7 0 0 0 5 10.4C5 13.6 7.5 16.8 12 21z"
                        {...s}
                    />
                    <circle cx="12" cy="10.3" r="2.4" {...s} />
                </svg>
            )
        case 'dish':
            return (
                <svg {...base(size)}>
                    <circle cx="12" cy="12" r="8" {...s} />
                    <circle cx="12" cy="12" r="3.2" {...s} />
                </svg>
            )
        case 'meeting':
            return (
                <svg {...base(size)}>
                    <path d="M6 3.5v7M9 3.5v7M7.5 10.5V21M6 3.5h3" {...s} />
                    <path d="M16.5 3.5c-1.5 0-2.5 2-2.5 5s1 4 2.5 4V21" {...s} />
                </svg>
            )
        case 'people':
            return (
                <svg {...base(size)}>
                    <circle cx="9" cy="8.5" r="3" {...s} />
                    <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" {...s} />
                    <path d="M16 6.2a3 3 0 0 1 0 5.6M17 14.2c2.2.5 3.8 2.3 3.8 4.8" {...s} />
                </svg>
            )
        case 'search':
            return (
                <svg {...base(size)}>
                    <circle cx="11" cy="11" r="6" {...s} />
                    <path d="M15.5 15.5L20 20" {...s} />
                </svg>
            )
        case 'add':
            return (
                <svg {...base(size)}>
                    <path d="M12 5v14M5 12h14" {...s} />
                </svg>
            )
        case 'comment':
            return (
                <svg {...base(size)}>
                    <path
                        d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H10l-4 3.5V16.5H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5z"
                        {...s}
                    />
                </svg>
            )
        case 'send':
            return (
                <svg {...base(size)}>
                    <path d="M5 12l15-7-7 15-2.5-5.5L5 12z" {...s} />
                </svg>
            )
        case 'modify':
            return (
                <svg {...base(size)}>
                    <path d="M5 19h3l10-10-3-3L5 16v3z" {...s} />
                    <path d="M14 6l3 3" {...s} />
                </svg>
            )
        case 'up':
            return (
                <svg {...base(size)}>
                    <path d="M6 15l6-6 6 6" {...s} />
                </svg>
            )
        case 'down':
            return (
                <svg {...base(size)}>
                    <path d="M6 9l6 6 6-6" {...s} />
                </svg>
            )
        case 'arrow':
            return (
                <svg {...base(size)}>
                    <path d="M5 12h14M13 6l6 6-6 6" {...s} />
                </svg>
            )
        case 'back':
            return (
                <svg {...base(size)}>
                    <path d="M19 12H5M11 6l-6 6 6 6" {...s} />
                </svg>
            )
        default:
            return null
    }
}
