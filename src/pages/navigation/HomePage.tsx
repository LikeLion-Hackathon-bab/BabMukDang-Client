import { useEffect } from 'react'

import { LogoTextIcon } from '@/assets/icons'
import { MockPostList } from '@/constants/mockData'
import { useHeader, usePullToRefresh } from '@/hooks'
import {
    PostCard,
    PostEmptyView,
    UploadButton,
    HomeBannerSection
} from '@/components'
import { useGetHomeArticles } from '@/query'
import { COLORS } from '@/constants/colors'

export function HomePage() {
    const { setLeftElement, hideCenterElement, resetHeader, showRightButton } =
        useHeader()
    const { data: postListData } = useGetHomeArticles()
    const postList = postListData?.content ?? MockPostList ?? []

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
                            // @ts-ignore: MockPostList may not strictly match Post type; safe for UI mock rendering
                            post={post as any}
                            isComment={false}
                        />
                    ))}
                </div>
            )}
            <UploadButton />
        </>
    )
}
