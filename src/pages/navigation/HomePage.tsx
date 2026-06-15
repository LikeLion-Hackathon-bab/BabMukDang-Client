import { useEffect } from 'react'

import { LogoTextIcon } from '@/assets/icons'

import { usePullToRefresh } from '@/hooks'
import {
    PostCard,
    PostEmptyView,
    UploadButton,
    HomeBannerSection
} from '@/components'

import { COLORS } from '@/constants/colors'
import { useGetHomeArticles } from '@/apis'
import { toPostCardView } from '@/viewModels'
import { useHeaderStore } from '@/store'

export function HomePage() {
    const { setLeftElement, hideCenterElement, resetHeader, showRightButton } =
        useHeaderStore()
    const { data: postListData } = useGetHomeArticles()
    const postList = (postListData?.items ?? []).map(toPostCardView)

    const { pullPosition, menu } = usePullToRefresh()

    useEffect(() => {
        setLeftElement(<LogoTextIcon fillcolor={COLORS.primary500} />)
        hideCenterElement()
        showRightButton()
        return () => {
            resetHeader()
        }
    }, [setLeftElement, hideCenterElement, showRightButton, resetHeader])
    return (
        <>
            <HomeBannerSection
                menu={menu}
                pullPosition={pullPosition}
            />
            {postList.length === 0 ? (
                <PostEmptyView />
            ) : (
                <div className="flex flex-col items-center justify-center gap-48">
                    {postList.map((post, index) => (
                        <PostCard
                            key={index}
                            post={post}
                            isComment={false}
                        />
                    ))}
                </div>
            )}
            <UploadButton />
        </>
    )
}
