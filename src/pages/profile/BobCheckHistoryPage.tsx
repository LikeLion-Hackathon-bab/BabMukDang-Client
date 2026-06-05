import { useHeader } from '@/hooks'
import { useEffect } from 'react'
import { ArticleSummaryResponse, useGetMyArticles } from '@/apis'

export function BobCheckHistoryPage() {
    const { setTitle, resetHeader } = useHeader()
    const { data: articles } = useGetMyArticles()
    useEffect(() => {
        setTitle('지난 밥 인증 내역')
        return () => {
            resetHeader()
        }
    }, [])
    return (
        <div className="grid grid-cols-3 justify-items-center gap-12 pt-20">
            {articles?.content.map((article, index) => {
                const date = formatDate(article.createdAt)
                const prevDate =
                    index > 0
                        ? formatDate(articles.content[index - 1].createdAt)
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
                    className="rounded-12 h-full w-full"
                    src={article.imageUrl}
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
