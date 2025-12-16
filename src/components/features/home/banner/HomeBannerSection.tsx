import { MenuSuggestSection } from '@/components/features/home/banner/MenuSuggestSection'
import { HomeMeetingBanner } from './HomeMeetingBanner'

export const HomeBannerSection = () => {
    return (
        <div className="-mx-[20px] mb-[30px] flex flex-col gap-[16px]">
            <MenuSuggestSection />
            <HomeMeetingBanner />
        </div>
    )
}
