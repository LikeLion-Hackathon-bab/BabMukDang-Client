import { CommentResponse } from '@/apis'

export interface Comment {
    commentId: number
    authorId: number
    authorUsername: string
    parentCommentId: number | null
    content: string
    createdAt: string
    profileImageUrl?: string | null
    replies?: Comment[] // 트리 변환 후에만 생김
}

export function buildCommentTree(comments: CommentResponse[]): Comment[] {
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
