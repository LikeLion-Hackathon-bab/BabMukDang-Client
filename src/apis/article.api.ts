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
import { client } from './client'
import { endpoints } from './endpoints'
import { queryKeys } from './keys'
import type {
    ArticleDetailResponse,
    ArticlePostRequest,
    BaseResponse,
    CommentPostRequest,
    CommentResponse,
    LikePostResponse,
    PageArticleSummaryResponse
} from './types'

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
export const articleApi = {
    /**
     * 게시글 상세 조회
     * @param articleId - 게시글 ID
     * @returns 게시글 상세 정보
     */
    getById: async (articleId: number): Promise<ArticleDetailResponse> => {
        const res = await client.get(endpoints.articles.detail(articleId))
        return res.data as ArticleDetailResponse
    },

    /**
     * 게시글 댓글 목록 조회
     * @param articleId - 게시글 ID
     * @returns 댓글 목록
     */
    getComments: async (articleId: number): Promise<CommentResponse[]> => {
        const res = await client.get(endpoints.articles.comments(articleId))
        return res.data as CommentResponse[]
    },

    /**
     * 홈 피드 게시글 조회
     * @returns 홈 피드 게시글 페이지
     */
    getHome: async (): Promise<PageArticleSummaryResponse> => {
        const res = await client.get(endpoints.articles.home)
        return res.data as PageArticleSummaryResponse
    },

    /**
     * 특정 작성자의 게시글 조회
     * @param authorId - 작성자 ID
     * @returns 게시글 페이지
     */
    getByAuthor: async (
        authorId: number
    ): Promise<PageArticleSummaryResponse> => {
        const res = await client.get(endpoints.articles.byAuthor(authorId))
        return res.data as PageArticleSummaryResponse
    },

    /**
     * 특정 멤버의 게시글 조회
     * @param memberId - 멤버 ID
     * @returns 게시글 페이지
     */
    getByMember: async (
        memberId: number
    ): Promise<BaseResponse<PageArticleSummaryResponse>> => {
        const res = await client.get(endpoints.articles.byMember(memberId), {
            params: { page: 0 }
        })
        return res.data as BaseResponse<PageArticleSummaryResponse>
    },

    /**
     * 내 게시글 조회
     * @returns 내 게시글 페이지
     */
    getMy: async (): Promise<BaseResponse<PageArticleSummaryResponse>> => {
        const res = await client.get(endpoints.articles.my, {
            params: { page: 0 }
        })
        return res.data as BaseResponse<PageArticleSummaryResponse>
    },

    /**
     * 게시글 생성
     * @param data - 게시글 작성 데이터
     */
    create: async (data: ArticlePostRequest): Promise<void> => {
        console.log(data)
        const res = await client.post(endpoints.articles.create, data)
        return res.data as void
    },

    /**
     * 게시글 좋아요 토글
     * @param articleId - 게시글 ID
     * @returns 좋아요 상태
     */
    like: async (articleId: number): Promise<LikePostResponse> => {
        const res = await client.post(endpoints.articles.like(articleId))
        return res.data
    },

    /**
     * 댓글 작성
     * @param articleId - 게시글 ID
     * @param data - 댓글 데이터
     */
    createComment: async (
        articleId: number,
        data: CommentPostRequest
    ): Promise<void> => {
        const res = await client.post(
            endpoints.articles.comments(articleId),
            data
        )
        return res.data as void
    },

    /**
     * 게시글 삭제
     * @param articleId - 게시글 ID
     */
    delete: async (articleId: number): Promise<void> => {
        const res = await client.delete(endpoints.articles.delete(articleId))
        return res.data
    },

    /**
     * 댓글 삭제
     * @param commentId - 댓글 ID
     */
    deleteComment: async (commentId: number): Promise<void> => {
        const res = await client.delete(
            `/articles/comments/${commentId}` // TODO: endpoints에 추가
        )
        return res.data as void
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
export const useGetArticle = (articleId: number) => {
    const { data, isLoading, error } = useQuery({
        queryKey: queryKeys.articles.detail(articleId),
        queryFn: () => articleApi.getById(articleId)
    })
    return { data, isLoading, error }
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
 * 뮤테이션 옵션 타입
 */
interface MutationOptions<TData = void> {
    /** 성공 시 콜백 */
    onSuccess?: (data: TData) => void
    /** 에러 시 콜백 */
    onError?: (error: Error) => void
}

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
export const useUploadArticle = (options: MutationOptions) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: async ({
            currentUserId,
            file,
            buildRequest
        }: UploadAndPostVars) => {
            // 동적 import로 순환 참조 방지
            const { uploadApi } = await import('./upload.api')

            // 1) presign
            const { putUrl, cdnUrl } = await uploadApi.presignArticle(
                String(currentUserId),
                file
            )

            // 2) S3 업로드
            await uploadApi.uploadArticleS3({ putUrl, file })

            // 3) Spring에 게시물 생성
            const req = buildRequest(cdnUrl)
            return articleApi.create(req)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.articles.all })
            options.onSuccess?.()
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
    options: MutationOptions<LikePostResponse> = {}
) => {
    const { mutate, isPending, error } = useMutation({
        mutationFn: ({ articleId }: { articleId: number }) =>
            articleApi.like(articleId),
        onSuccess: options.onSuccess,
        onError: options.onError
    })
    return { mutate, isPending, error }
}

/**
 * 댓글 작성 Hook
 * @param options - 성공/에러 콜백
 */
export const useCommentArticle = (options: MutationOptions = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: ({
            articleId,
            comment
        }: {
            articleId: number
            comment: CommentPostRequest
        }) => articleApi.createComment(articleId, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.articles.all
            })
            options.onSuccess?.()
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}

/**
 * 게시글 삭제 Hook
 * @param options - 성공/에러 콜백
 */
export const useDeleteArticle = (options: MutationOptions = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: ({ articleId }: { articleId: number }) =>
            articleApi.delete(articleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.articles.all })
            options.onSuccess?.()
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}

/**
 * 댓글 삭제 Hook
 * @param options - 성공/에러 콜백
 */
export const useDeleteArticleComment = (options: MutationOptions = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: ({ commentId }: { commentId: number }) =>
            articleApi.deleteComment(commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.articles.all })
            options.onSuccess?.()
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}
