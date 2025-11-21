import { client } from './client'
import {
    ArticleGetResponseDto,
    ArticlePostRequestDto,
    CommentResponseDto,
    CommentPostRequestDto,
    LikePostResponseDto,
    PageArticleSummaryResponse
} from '@kimdaegyu/babmukdang-shared'

export const getArticle = async (
    articleId: number
): Promise<ArticleGetResponseDto> => {
    const res = await client.get(
        `${import.meta.env.VITE_BASE_API_URL}/articles/${articleId}`
    )
    return res.data.data as ArticleGetResponseDto
}

export const getArticleComments = async (
    articleId: number
): Promise<CommentResponseDto[]> => {
    const res = await client.get(
        `${import.meta.env.VITE_BASE_API_URL}/articles/${articleId}/comments`
    )
    return res.data.data as CommentResponseDto[]
}

export const getHomeArticles =
    async (): Promise<PageArticleSummaryResponse> => {
        const res = await client.get(
            `${import.meta.env.VITE_BASE_API_URL}/articles/home`
        )
        return res.data.data as PageArticleSummaryResponse
    }

export const getArticlesByAuthor = async (
    authorId: number
): Promise<PageArticleSummaryResponse> => {
    const res = await client.get(
        `${import.meta.env.VITE_BASE_API_URL}/articles/by-author/${authorId}`
    )
    return res.data.data as PageArticleSummaryResponse
}

export const postArticle = async (
    data: ArticlePostRequestDto
): Promise<void> => {
    console.log(data)
    const res = await client.post(
        `${import.meta.env.VITE_BASE_API_URL}/articles`,
        data
    )
    return res.data.data as void
}

export const likeArticle = async (
    articleId: number
): Promise<LikePostResponseDto> => {
    const res = await client.post(
        `${import.meta.env.VITE_BASE_API_URL}/articles/${articleId}/like`
    )
    return res.data.data
}

export const postArticleComment = async (
    articleId: number,
    data: CommentPostRequestDto
): Promise<void> => {
    const res = await client.post(
        `${import.meta.env.VITE_BASE_API_URL}/articles/${articleId}/comments`,
        data
    )
    return res.data.data as void
}

export const deleteArticle = async (articleId: number): Promise<void> => {
    const res = await client.delete(
        `${import.meta.env.VITE_BASE_API_URL}/articles/${articleId}`
    )
    return res.data.data
}

export const deleteArticleComment = async (
    commentId: number
): Promise<void> => {
    const res = await client.delete(
        `${import.meta.env.VITE_BASE_API_URL}/articles/comments/${commentId}`
    )
    return res.data.data as void
}

export const getArticlesByMember = async (
    memberId: number
): Promise<PageArticleSummaryResponse> => {
    const res = await client.get(
        `${import.meta.env.VITE_BASE_API_URL}/members/${memberId}/articles`,
        {
            params: {
                page: 0
            }
        }
    )
    return res.data.data as PageArticleSummaryResponse
}

export const getMyArticles = async (): Promise<PageArticleSummaryResponse> => {
    const res = await client.get(
        `${import.meta.env.VITE_BASE_API_URL}/members/me/articles`,
        {
            params: {
                page: 0
            }
        }
    )
    return res.data.data as PageArticleSummaryResponse
}
