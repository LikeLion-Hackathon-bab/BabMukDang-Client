import { useEffect, useState } from 'react'

import { LogoTextIcon } from '@/assets/icons'
import { MockPostList } from '@/constants/mockData'
import { useHeader } from '@/hooks'
import { PostCard, PostEmptyView, UploadButton } from '@/components'
import { useGetHomeArticles } from '@/query'
import { ArticleGetResponseDto } from '@kimdaegyu/babmukdang-shared'
export function HomePage() {
    const { setLeftElement, hideCenterElement, resetHeader, showRightButton } =
        useHeader()
    const { data: postListData } = useGetHomeArticles()
    const postList =
        postListData ?? MockPostList ?? ([] as ArticleGetResponseDto)
    useEffect(() => {
        setLeftElement(<LogoTextIcon fillcolor="black" />)
        hideCenterElement()
        showRightButton()
        return () => {
            resetHeader()
        }
    }, [])
    return (
        <>
            {Array.isArray(postList) && postList.length === 0 ? (
                <PostEmptyView />
            ) : (
                <div className="flex flex-col items-center justify-center gap-48">
                    {Array.isArray(postList) &&
                        postList.map((post, index) => (
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
