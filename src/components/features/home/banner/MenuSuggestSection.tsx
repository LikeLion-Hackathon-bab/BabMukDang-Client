export const MenuSuggestSection = ({
    menu = '크림파스타'
}: {
    menu?: string
}) => {
    return (
        <h1 className="text-body1-semibold flex h-[61px] items-center justify-center gap-[20px] bg-[linear-gradient(90deg,#FFB399_7.03%,#FF8359_30.09%,#FF7343_49.96%,#FF7B4E_71.58%,#FFA485_91.21%)] text-white">
            <span>오늘은</span>
            <span className="text-body1-medium">[</span>
            <span className="text-title1-bold">{menu}</span>
            <span className="text-body1-medium">]</span>
            <span>어때요?</span>
        </h1>
    )
}
