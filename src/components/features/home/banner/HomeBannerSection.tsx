import { MenuSuggestSection } from './MenuSuggestSection'
import { HomeMeetingBanner } from './HomeMeetingBanner'

interface HomeBannerSectionProps {
    menu: string
    pullPosition: number
}

export const HomeBannerSection = ({
    menu,
    pullPosition,
}: HomeBannerSectionProps) => {
    return (
        <div className="-mx-[20px] mb-[30px] flex flex-col gap-[16px]">
            <MenuSuggestSection menu={menu} pullPosition={pullPosition} />
            <HomeMeetingBanner />
        </div>
    )
}