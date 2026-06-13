import { useEffect, useState } from 'react'
import { PostCard, CommentList, ChatInput } from '@/components'
import { useNavigate, useParams } from 'react-router-dom'
import {
    useCommentArticle,
    useDeleteArticle,
    useDeleteArticleComment,
    useGetArticleDetail,
    useGetArticleComments,
    CommentPostRequest
} from '@/apis'
import { buildCommentTree } from '@/lib'
import { useBottomNavStore, useHeaderStore } from '@/store'
import { toPostCardView } from '@/viewModels'
type TreeComment = ReturnType<typeof buildCommentTree>[number]
export function CommentPage() {
    const { resetHeader, setTitle } = useHeaderStore()
    const { hideBottomNav, resetBottomNav } = useBottomNavStore()
    const { postId } = useParams()
    const navigate = useNavigate()
    const articleId = Number(postId)
    const [newMessage, setNewMessage] = useState('')
    const [replyCommentId, setReplyCommentId] = useState<number | null>(null)
    const { data: article, refetch: refetchArticle } =
        useGetArticleDetail(articleId)
    const { mutate: sendMessage } = useCommentArticle({
        onSuccess: () => {
            refetch()
            refetchArticle()
        },
        onError: (e: Error) => {
            console.log('error', e)
        }
    })
    const { mutate: deleteArticle, isPending: isDeletingArticle } =
        useDeleteArticle({
            onSuccess: () => {
                navigate('/', { replace: true })
            }
        })
    const { mutate: deleteComment, isPending: isDeletingComment } =
        useDeleteArticleComment({
            onSuccess: () => {
                refetch()
                refetchArticle()
            }
        })
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
    } = useGetArticleComments(articleId)
    const [comments, setComments] = useState<TreeComment[]>([])
    const [totalCommentCount, setTotalCommentCount] = useState(0)
    useEffect(() => {
        if (commentsData) {
            setComments(buildCommentTree(commentsData))
            setTotalCommentCount(commentsData.length)
        }
    }, [commentsData])
    const handleSendMessage = () => {
        if (!Number.isFinite(articleId) || newMessage.trim().length === 0) {
            return
        }
        sendMessage({
            articleId,
            comment: {
                content: newMessage,
                parentCommentId: replyCommentId == null
                    ? null
                    : (replyCommentId as CommentPostRequest['parentCommentId'])
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

    const handleDeleteArticle = () => {
        if (!Number.isFinite(articleId)) return
        deleteArticle({ articleId })
    }

    const handleDeleteComment = (commentId: number) => {
        if (!Number.isFinite(articleId) || isDeletingComment) return
        deleteComment({ articleId, commentId })
    }

    return (
        <div className="flex flex-col gap-48 pt-16">
            {article && (
                <div className="flex flex-col gap-12">
                    <PostCard
                        post={toPostCardView(article)}
                        isComment={true}
                    />
                    <button
                        type="button"
                        disabled={isDeletingArticle}
                        onClick={handleDeleteArticle}
                        className="text-caption-medium self-end rounded-full border border-red-300 px-12 py-6 text-red-500 disabled:opacity-40">
                        {isDeletingArticle ? '삭제 중' : '게시글 삭제'}
                    </button>
                </div>
            )}
            {/* 댓글 영역 */}
            <CommentList
                comments={comments}
                totalCommentCount={totalCommentCount}
                onClickReply={handleReply}
                onClickDelete={handleDeleteComment}
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
