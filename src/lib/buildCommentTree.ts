import { Comment } from '@kimdaegyu/babmukdang-shared'

export function buildCommentTree(comments: Comment[]) {
    const map: Record<number, Comment> = {}
    const roots: Comment[] = []

    comments.forEach(comment => {
        map[comment.commentId] = { ...comment, replies: [] }
    })

    comments.forEach(comment => {
        if (comment.parentCommentId !== null) {
            map[comment.parentCommentId]?.replies?.push(map[comment.commentId])
        } else {
            roots.push(map[comment.commentId])
        }
    })

    return roots
}
