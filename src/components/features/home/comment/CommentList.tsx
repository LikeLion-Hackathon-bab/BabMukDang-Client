import { CommentItem, ReplyCommentItem } from '@/components'
import { Comment } from '@/lib/buildCommentTree'

export function CommentList({
    comments,
    totalCommentCount,
    onClickReply
}: {
    comments: Comment[]
    totalCommentCount: number
    onClickReply: (commentId: number, authorUsername: string) => void
}) {
    console.log(comments)
    return (
        <div className="flex flex-col gap-20">
            <div className="flex flex-row items-center gap-4">
                <span className="text-title2-semibold text-gray-5">댓글</span>
                <span className="text-body2-medium text-gray-3">
                    · {totalCommentCount}
                </span>
            </div>
            <div className="flex flex-col gap-15">
                {comments.map(comment => (
                    <>
                        <CommentItem
                            key={comment.commentId}
                            profileImageUrl={comment?.profileImageUrl}
                            commentAuthorName={comment.authorUsername}
                            comment={comment.content}
                            createdAt={comment.createdAt}
                            authorId={comment.authorId}
                            onClickReply={() =>
                                onClickReply(
                                    comment.commentId,
                                    comment.authorUsername
                                )
                            }
                        />
                        {comment?.replies &&
                            comment.replies.length > 0 &&
                            comment.replies.map(reply => (
                                <ReplyCommentItem
                                    key={reply.commentId}
                                    profileImageUrl={reply?.profileImageUrl}
                                    commentAuthorName={reply.authorUsername}
                                    comment={reply.content}
                                    createdAt={reply.createdAt}
                                    authorId={reply.authorId}
                                    onClickReply={() =>
                                        onClickReply(
                                            reply.commentId,
                                            reply.authorUsername
                                        )
                                    }
                                />
                            ))}
                        <Separator />
                    </>
                ))}
            </div>
        </div>
    )
}

const Separator = () => {
    return <div className="border-gray-2 -ml-20 h-0 w-screen border-b" />
}
