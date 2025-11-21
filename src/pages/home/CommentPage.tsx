import { useEffect, useState } from 'react'
import { CommentList, ChatInput } from '@/components'
import { useHeader, useBottomNav } from '@/hooks'
import { useParams } from 'react-router-dom'
import { useCommentArticle, useGetArticleComments } from '@/query'
import { buildCommentTree } from '@/lib'

type TreeComment = ReturnType<typeof buildCommentTree>[number]
export function CommentPage() {
    const { resetHeader, setTitle } = useHeader()
    const { hideBottomNav, resetBottomNav } = useBottomNav()
    const { postId } = useParams()
    const [newMessage, setNewMessage] = useState('')
    const [replyCommentId, setReplyCommentId] = useState<number | null>(null)
    const { mutate: sendMessage } = useCommentArticle(
        () => {
            refetch()
        },
        e => {
            console.log('error', e)
        }
    )
    useEffect(() => {
        setTitle('게시물')
        hideBottomNav()
        return () => {
            resetHeader()
            resetBottomNav()
        }
    }, [])

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSendMessage()
        }
    }

    const {
        data: commentsData,
        error,
        refetch
    } = useGetArticleComments(Number(postId))
    const [comments, setComments] = useState<TreeComment[]>([])
    const [totalCommentCount, setTotalCommentCount] = useState(0)
    useEffect(() => {
        if (commentsData) {
            setComments(buildCommentTree(commentsData))
            setTotalCommentCount(commentsData.length)
        }
    }, [commentsData])
    const handleSendMessage = () => {
        sendMessage({
            articleId: Number(postId),
            comment: {
                content: newMessage,
                parentCommentId: replyCommentId ?? undefined
            }
        })
        setNewMessage('')
        setReplyCommentId(null)
        refetch()
    }

    const handleReply = (commentId: number, authorUsername: string) => {
        setReplyCommentId(commentId)
        setNewMessage(`@${authorUsername} `)
    }

    return (
        <div className="flex flex-col gap-48 pt-16">
            {/* <PostCard
                post={post}
                isComment={true}
            /> */}
            {/* 댓글 영역 */}
            <CommentList
                comments={comments}
                totalCommentCount={totalCommentCount}
                onClickReply={handleReply}
            />
            <ChatInput
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                handleKeyPress={handleKeyPress}
                handleSendMessage={handleSendMessage}
            />
        </div>
    )
}
