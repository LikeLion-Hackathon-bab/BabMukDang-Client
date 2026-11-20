// withIconProps.tsx
import * as React from 'react'

type ExtraProps = {
    /** 원하는 커스텀 prop들 */
    strokecolor?: string
    fillcolor?: string
    bgcolor?: string
}

// stroke/fill은 우리가 매핑할 거라 Omit
export type IconProps = Omit<React.SVGProps<SVGSVGElement>, 'stroke' | 'fill'> &
    ExtraProps

/** SVG 컴포넌트를 감싸서 커스텀 prop을 표준 SVG 속성으로 매핑 */
export function withIconProps<
    T extends React.ComponentType<
        React.SVGProps<SVGSVGElement> & { ref?: React.RefObject<SVGSVGElement> }
    >
>(Comp: T) {
    const Wrapped = React.forwardRef<SVGSVGElement, IconProps>(
        (
            { strokecolor, fillcolor, bgcolor, className, style, ...rest },
            ref
        ) => {
            const mergedStyle: React.CSSProperties &
                Record<`--ic-${string}`, string | undefined> = {
                ...style,
                // (선택) CSS 변수도 같이 내려서 CSS로 강제 오버라이드할 수 있게
                '--ic-stroke': strokecolor,
                '--ic-fill': fillcolor,
                '--ic-bg': bgcolor
            }
            // T 의 구체 props 는 제네릭이라 JSX 에서 좁힐 수 없으므로, 매핑 대상 SVG props 로 본다.
            const Svg = Comp as React.ComponentType<
                React.SVGProps<SVGSVGElement> &
                    ExtraProps & { ref?: React.Ref<SVGSVGElement> }
            >

            return (
                <Svg
                    ref={ref}
                    {...rest}
                    bgcolor={bgcolor}
                    strokecolor={strokecolor}
                    fillcolor={fillcolor}
                    className={className ? `icon-svg ${className}` : 'icon-svg'}
                    style={mergedStyle}
                />
            )
        }
    )
    Wrapped.displayName = `WithIconProps(${Comp.displayName || Comp.name || 'Icon'})`
    return Wrapped
}
