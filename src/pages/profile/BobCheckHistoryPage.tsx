import { useEffect, useMemo, useState, type UIEvent } from 'react'
import { useGetMyArticles } from '@/apis'
import type { ArticleSummaryResponse } from '@/apis'

const ARTICLE_BATCH_SIZE = 15

export function BobCheckHistoryPage() {
    return <BobCheckHistorySection className="pt-20" />
}

export function BobCheckHistorySection({
    className = ''
}: {
    className?: string
}) {
    const { data: articles } = useGetMyArticles()
    const [visibleCount, setVisibleCount] = useState(ARTICLE_BATCH_SIZE)
    const articleList = articles?.content ?? []
    const visibleArticles = useMemo(
        () => articleList.slice(0, visibleCount),
        [articleList, visibleCount]
    )
    const hasMoreArticles = visibleCount < articleList.length

    useEffect(() => {
        setVisibleCount(ARTICLE_BATCH_SIZE)
    }, [articleList.length])

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        if (!hasMoreArticles) return

        const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
        if (scrollHeight - scrollTop - clientHeight > 80) return

        setVisibleCount(current =>
            Math.min(current + ARTICLE_BATCH_SIZE, articleList.length)
        )
    }

    return (
        <section className={`flex flex-col gap-12 ${className}`}>
            <h2 className="text-body1-semibold text-gray-8">
                지난 밥 인증 내역
            </h2>
            <div
                onScroll={handleScroll}
                className="max-h-[430px] overflow-y-auto overscroll-contain pr-2">
                {visibleArticles.length ? (
                    <div className="grid grid-cols-3 justify-items-center gap-12">
                        {visibleArticles.map((article, index) => {
                            const date = formatDate(article.createdAt)
                            const prevDate =
                                index > 0
                                    ? formatDate(
                                          visibleArticles[index - 1].createdAt
                                      )
                                    : ''
                            return (
                                <BobCheckHistoryItem
                                    key={article.articleId}
                                    article={article}
                                    showDate={date !== prevDate}
                                />
                            )
                        })}
                    </div>
                ) : (
                    <div className="rounded-12 flex min-h-110 items-center justify-center bg-white px-16 py-18">
                        <span className="text-caption-regular text-gray-5">
                            지난 밥 인증 내역이 없습니다.
                        </span>
                    </div>
                )}
                {hasMoreArticles ? (
                    <div className="flex justify-center py-12">
                        <span className="text-caption-regular text-gray-5">
                            더 불러오는 중입니다.
                        </span>
                    </div>
                ) : null}
            </div>
        </section>
    )
}

function BobCheckHistoryItem({
    article,
    showDate
}: {
    article: ArticleSummaryResponse
    showDate: boolean
}) {
    const date = formatDate(article.createdAt)
    return (
        <div className="rounded-12 bg-gary-3 relative h-110 w-110 overflow-hidden">
            {article.imageUrl && (
                <img
                    className="rounded-12 h-full w-full object-cover"
                    src={article.imageUrl}
                    alt=""
                />
            )}
            {/* badge_date */}
            {showDate && (
                <div className="bg-gray-1 absolute top-10 left-10 flex items-center justify-center rounded-full px-8 py-3">
                    <span className="text-caption-10 text-gary-7">{date}</span>
                </div>
            )}
        </div>
    )
}

const formatDate = (date: string) => {
    const [_, month, day] = date.split('T')[0].split('-')
    return `${month}/${day}`
}
