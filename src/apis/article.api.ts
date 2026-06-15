/**
 * @fileoverview Article(게시글) API 모듈
 *
 * 게시글 관련 모든 API 함수와 TanStack Query hooks를 제공합니다.
 *
 * @example
 * // 게시글 상세 조회
 * const { data, isLoading } = useArticle(articleId)
 *
 * // 게시글 삭제
 * const { mutate: deleteArticle } = useDeleteArticle({
 *   onSuccess: () => console.log('삭제 완료')
 * })
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contractClient } from './client'
import { apiContract } from '@kimdaegyu/babmukdang-shared/domain'
import { domainId } from '@/domain/factories'
import { queryKeys } from './keys'
import {
    mapArticleDetail,
    mapArticlePage,
    mapComment
} from './mappers/article.mapper'
import type {
    ArticleDetailView,
    ArticlePostRequest,
    CommentPostRequest,
    CommentView,
    ArticleLikeView,
    MutationOptions,
    NoContent,
    CreatedEntityIdResponse,
    ArticlePageView
} from './types'
import { useUploadArticlePhoto } from '@/apis/upload.api'

// ============================================================================
// API 함수
// ============================================================================

/**
 * Article API 함수 모음
 *
 * @example
 * // 직접 API 호출이 필요한 경우
 * const response = await articleApi.getById(123)
 */
const articleApi = {
    /**
     * 게시글 상세 조회
     * @param articleId - 게시글 ID
     * @returns 게시글 상세 정보
     */
    getById: async (articleId: number): Promise<ArticleDetailView> => {
        const data = await contractClient.get(apiContract.articles.detail, {
            pathParams: { articleId: domainId.article(articleId) }
        })
        return mapArticleDetail(data)
    },

    /**
     * 게시글 댓글 목록 조회
     * @param articleId - 게시글 ID
     * @returns 댓글 목록
     */
    getComments: async (articleId: number): Promise<CommentView[]> => {
        const detail = await contractClient.get(apiContract.articles.detail, {
            pathParams: { articleId: domainId.article(articleId) }
        })
        return (detail.comments ?? []).map(mapComment)
    },

    /**
     * 홈 피드 게시글 조회
     * @returns 홈 피드 게시글 페이지
     */
    getHome: async (): Promise<ArticlePageView> => {
        const data = await contractClient.get(apiContract.articles.list)
        return mapArticlePage(data)
    },

    /**
     * 특정 작성자의 게시글 조회
     * @param authorId - 작성자 ID
     * @returns 게시글 페이지
     */
    getByAuthor: async (authorId: number): Promise<ArticlePageView> => {
        const data = await contractClient.get(apiContract.articles.byMember, {
            pathParams: { memberId: domainId.member(authorId) }
        })
        return mapArticlePage(data)
    },

    /**
     * 특정 멤버의 게시글 조회
     * @param memberId - 멤버 ID
     * @returns 게시글 페이지
     */
    getByMember: async (memberId: number): Promise<ArticlePageView> => {
        const data = await contractClient.get(apiContract.articles.byMember, {
            pathParams: { memberId: domainId.member(memberId) },
            query: { page: 0 }
        })
        return mapArticlePage(data)
    },

    /**
     * 내 게시글 조회
     * @returns 내 게시글 페이지
     */
    getMy: async (): Promise<ArticlePageView> => {
        const data = await contractClient.get(apiContract.articles.my)
        return mapArticlePage(data)
    },

    /**
     * 게시글 생성
     * @param data - 게시글 작성 데이터
     */
    create: async (data: ArticlePostRequest) => {
        return contractClient.post(apiContract.articles.create, { body: data })
    },

    /**
     * 게시글 좋아요 토글
     * @param articleId - 게시글 ID
     * @returns 좋아요 상태
     */
    like: async (articleId: number): Promise<ArticleLikeView> => {
        return contractClient.post(apiContract.articles.like, {
            pathParams: { articleId: domainId.article(articleId) }
        })
    },

    /**
     * 댓글 작성
     * @param articleId - 게시글 ID
     * @param data - 댓글 데이터
     */
    createComment: async (
        articleId: number,
        data: CommentPostRequest
    ): Promise<CreatedEntityIdResponse> => {
        return contractClient.post(apiContract.articles.createComment, {
            pathParams: { articleId: domainId.article(articleId) },
            body: data
        })
    },

    /**
     * 게시글 삭제
     * @param articleId - 게시글 ID
     */
    delete: async (articleId: number): Promise<NoContent> => {
        return contractClient.delete(apiContract.articles.delete, {
            pathParams: { articleId: domainId.article(articleId) }
        })
    },

    /**
     * 댓글 삭제
     * @param commentId - 댓글 ID
     */
    deleteComment: async (
        articleId: number,
        commentId: number
    ): Promise<NoContent> => {
        return contractClient.delete(apiContract.articles.deleteComment, {
            pathParams: {
                commentId: domainId.comment(commentId)
            }
        })
    }
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 게시글 상세 조회 Hook
 * @param articleId - 게시글 ID
 * @returns Query 결과 (data, isLoading, error)
 *
 * @example
 * const { data: article, isLoading } = useGetArticle(123)
 */
export const useGetArticleDetail = (articleId: number) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: queryKeys.articles.detail(articleId),
        queryFn: () => articleApi.getById(articleId)
    })
    return { data, isLoading, error, refetch }
}

/**
 * 게시글 댓글 목록 조회 Hook
 * @param articleId - 게시글 ID
 * @returns Query 결과 및 refetch 함수
 */
export const useGetArticleComments = (articleId: number) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: queryKeys.articles.comments(articleId),
        queryFn: () => articleApi.getComments(articleId)
    })
    return { data, isLoading, error, refetch }
}

/**
 * 홈 피드 게시글 조회 Hook
 * @returns 홈 피드 게시글 목록
 *
 * @example
 * const { data: homeArticles } = useGetHomeArticles()
 */
export const useGetHomeArticles = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: queryKeys.articles.home,
        queryFn: articleApi.getHome
    })
    return { data, isLoading, error }
}

/**
 * 특정 작성자의 게시글 조회 Hook
 * @param authorId - 작성자 ID
 */
export const useGetArticlesByAuthor = (authorId: number) => {
    const { data, isLoading, error } = useQuery({
        queryKey: queryKeys.articles.byAuthor(authorId),
        queryFn: () => articleApi.getByAuthor(authorId)
    })
    return { data, isLoading, error }
}

/**
 * 특정 멤버의 게시글 조회 Hook
 * @param memberId - 멤버 ID
 */
export const useGetArticlesByMember = (memberId: number) => {
    const { data, isLoading, error } = useQuery({
        queryKey: queryKeys.articles.byMember(memberId),
        queryFn: () => articleApi.getByMember(memberId)
    })
    return { data, isLoading, error }
}

/**
 * 내 게시글 조회 Hook
 */
export const useGetMyArticles = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: queryKeys.articles.my,
        queryFn: articleApi.getMy
    })
    return { data, isLoading, error }
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 게시글 업로드 (S3 업로드 포함) 변수 타입
 */
type UploadAndPostVars = {
    /** 현재 사용자 ID */
    currentUserId: string
    /** 업로드할 파일 */
    file: File
    /** CDN URL을 받아서 최종 ArticlePostRequest를 만드는 빌더 */
    buildRequest: (cdnUrl: string) => ArticlePostRequest
}

/**
 * 게시글 업로드 Hook (presign + S3 업로드 + 게시글 생성)
 * @param options - 성공/에러 콜백
 *
 * @example
 * const { mutate: uploadArticle, isPending } = useUploadArticle({
 *   onSuccess: () => toast.success('업로드 완료'),
 *   onError: (e) => toast.error(e.message)
 * })
 *
 * uploadArticle({
 *   currentUserId: user.id.toString(),
 *   file,
 *   buildRequest: (cdnUrl) => ({
 *     imageUrl: cdnUrl,
 *     method: 'ALBUM',
 *     mealDate,
 *     mealTime,
 *     restaurant,
 *     taggedMemberIds: [],
 *     camera: false,
 *     album: true
 *   })
 * })
 */
type CreateArticleResult = Awaited<ReturnType<typeof articleApi.create>>

export const useUploadArticle = (
    options: MutationOptions<CreateArticleResult>
) => {
    const queryClient = useQueryClient()
    const { mutateAsync: uploadArticlePhoto } = useUploadArticlePhoto()
    const { mutate, isPending, error } = useMutation({
        mutationFn: async ({ file, buildRequest }: UploadAndPostVars) => {
            const url = await uploadArticlePhoto(file)
            if (!url) {
                throw new Error('CDN URL이 반환되지 않았습니다.')
            }
            return articleApi.create(buildRequest(url))
        },
        onSuccess: data => {
            queryClient.invalidateQueries({ queryKey: queryKeys.articles.all })
            options.onSuccess?.(data)
        },
        onError: options.onError
    })

    return { mutate, isPending, error }
}

/**
 * 게시글 좋아요 토글 Hook
 * @param options - 성공/에러 콜백
 */
export const useLikeArticle = (
    options: MutationOptions<ArticleLikeView> = {}
) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: ({ articleId }: { articleId: number }) =>
            articleApi.like(articleId),
        onSuccess: data => {
            queryClient.invalidateQueries({ queryKey: queryKeys.articles.all })
            options.onSuccess?.(data)
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}

/**
 * 댓글 작성 Hook
 * @param options - 성공/에러 콜백
 */
export const useCommentArticle = (
    options: MutationOptions<CreatedEntityIdResponse> = {}
) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: ({
            articleId,
            comment
        }: {
            articleId: number
            comment: CommentPostRequest
        }) => articleApi.createComment(articleId, comment),
        onSuccess: data => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.articles.all
            })
            options.onSuccess?.(data)
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}

/**
 * 게시글 삭제 Hook
 * @param options - 성공/에러 콜백
 */
export const useDeleteArticle = (options: MutationOptions<NoContent> = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: ({ articleId }: { articleId: number }) =>
            articleApi.delete(articleId),
        onSuccess: data => {
            queryClient.invalidateQueries({ queryKey: queryKeys.articles.all })
            options.onSuccess?.(data)
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}

/**
 * 댓글 삭제 Hook
 * @param options - 성공/에러 콜백
 */
export const useDeleteArticleComment = (
    options: MutationOptions<NoContent> = {}
) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: ({
            articleId,
            commentId
        }: {
            articleId: number
            commentId: number
        }) => articleApi.deleteComment(articleId, commentId),
        onSuccess: data => {
            queryClient.invalidateQueries({ queryKey: queryKeys.articles.all })
            options.onSuccess?.(data)
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}
