import { useMutation, useQuery } from '@tanstack/react-query'
import {
    getArticle,
    getArticleComments,
    getHomeArticles,
    getArticlesByAuthor,
    postArticle,
    presignArticle,
    uploadArticleS3,
    getArticlesByMember,
    getMyArticles,
    deleteArticle,
    deleteArticleComment,
    likeArticle,
    postArticleComment
} from '@/apis'
import {
    CommentPostRequestDto,
    LikePostResponseDto,
    UploadAndPostVars,
    ArticlePostRequestDto
} from '@kimdaegyu/babmukdang-shared'

export const useGetArticle = (articleId: number) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['article', articleId],
        queryFn: () => getArticle(articleId)
    })
    return { data: data, isLoading, error, refetch }
}

export const useGetArticleComments = (articleId: number) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['articleComments', articleId],
        queryFn: () => getArticleComments(articleId)
    })
    return { data: data, isLoading, error, refetch }
}

export const useGetHomeArticles = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['homeArticles'],
        queryFn: getHomeArticles
    })
    return { data: data, isLoading, error, refetch }
}

export const useGetArticlesByAuthor = (authorId: number) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['articlesByAuthor', authorId],
        queryFn: () => getArticlesByAuthor(authorId)
    })
    return { data: data, isLoading, error }
}

export const useUploadArticle = (
    onSuccess: () => void,
    onError: (e: Error) => void
) => {
    const { mutate, isPending, error } = useMutation({
        mutationFn: async ({
            currentUserId,
            file,
            buildRequest
        }: UploadAndPostVars) => {
            // 1) presign
            const { putUrl, cdnUrl } = await presignArticle(
                String(currentUserId),
                file
            )

            // 2) S3 업로드
            await uploadArticleS3({ putUrl, file })

            // 3) Spring에 게시물 생성
            const req = buildRequest(cdnUrl) // ← imageUrl을 여기서 주입
            return postArticle(req)
        },
        onSuccess,
        onError
    })

    return { mutate, isPending, error }
}

// 사용 예시
// const { mutate: uploadAndPost, isPending } = useUploadArticle(
//     () => toast.success('업로드 완료'),
//     (e) => toast.error(e.message)
//   );

//   // 폼 submit 시:
//   uploadAndPost({
//     currentUserId: user.id.toString(),
//     file, // <input type="file"> 로 받은 File
//     buildRequest: (cdnUrl) => ({
//       imageUrl: cdnUrl,
//       method,            // 'ALBUM' | 'CAMERA'
//       mealDate,          // 'YYYY-MM-DD'
//       mealTime,          // 'HH:mm'
//       restaurant,        // RestaurantInfo
//       taggedMemberIds,   // number[]
//     }),
//   });

export const useLikeArticle = (
    onSuccess: (data: LikePostResponseDto) => void,
    onError: (e: Error) => void
) => {
    const { mutate, isPending, error } = useMutation({
        mutationFn: ({ articleId }: { articleId: number }) =>
            likeArticle(articleId),
        onSuccess,
        onError
    })
    return { mutate, isPending, error }
}

export const useCommentArticle = (
    onSuccess: () => void,
    onError: (e: Error) => void
) => {
    const { mutate, isPending, error } = useMutation({
        mutationFn: ({
            articleId,
            comment
        }: {
            articleId: number
            comment: CommentPostRequestDto
        }) => postArticleComment(articleId, comment),
        onSuccess,
        onError
    })
    return { mutate, isPending, error }
}

export const useDeleteArticle = (
    onSuccess: () => void,
    onError: (e: Error) => void
) => {
    const { mutate, isPending, error } = useMutation({
        mutationFn: ({ articleId }: { articleId: number }) =>
            deleteArticle(articleId),
        onSuccess,
        onError
    })
    return { mutate, isPending, error }
}

export const useDeleteArticleComment = (
    onSuccess: () => void,
    onError: (e: Error) => void
) => {
    const { mutate, isPending, error } = useMutation({
        mutationFn: ({ commentId }: { commentId: number }) =>
            deleteArticleComment(commentId),
        onSuccess,
        onError
    })
    return { mutate, isPending, error }
}

export const useGetArticlesByMember = (memberId: number) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['articlesByMember', memberId],
        queryFn: () => getArticlesByMember(memberId)
    })
    return { data: data, isLoading, error }
}

export const useGetMyArticles = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['myArticles'],
        queryFn: getMyArticles
    })
    return { data: data, isLoading, error }
}
