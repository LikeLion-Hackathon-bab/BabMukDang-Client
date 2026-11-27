import { useEffect, useState } from 'react'

import { LogoTextIcon } from '@/assets/icons'
import { useHeader } from '@/hooks'
import { PostCard, PostEmptyView, UploadButton } from '@/components'
import { useGetHomeArticles } from '@/query'

export function HomePage() {
    const { setLeftElement, hideCenterElement, resetHeader, showRightButton } =
        useHeader()
    const { data: postListData } = useGetHomeArticles()
    const postList = postListData?.content ?? []
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
            {postList.length === 0 ? (
                <PostEmptyView />
            ) : (
                <div className="flex flex-col items-center justify-center gap-48">
                    {postList.map((post, index) => (
                        <PostCard
                            key={index}
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
