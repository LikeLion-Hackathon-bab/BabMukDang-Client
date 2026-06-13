/**
 * @fileoverview Upload(파일 업로드) API 모듈
 *
 * S3 presigned URL을 통한 파일 업로드 관련 API 함수와 hooks를 제공합니다.
 *
 * @example
 * // 프로필 이미지 업로드
 * const { mutate: uploadProfile } = useUploadProfile({
 *   onSuccess: () => toast.success('업로드 완료')
 * })
 */

import { useMutation } from '@tanstack/react-query'
import { contractClient } from './client'
import { apiContract } from '@kimdaegyu/babmukdang-shared/domain'
import type {
    MutationOptions,
    PresignArticleResponse,
    PresignProfileResponse
} from './types'

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 파일의 Content-Type을 정규화합니다.
 * iOS HEIC 등 특수 포맷 처리를 포함합니다.
 *
 * @param file - 업로드할 파일
 * @returns 정규화된 Content-Type
 */
const normalizeContentType = (file: File): string => {
    if (file.type) return file.type

    const name = file.name.toLowerCase()
    if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg'
    if (name.endsWith('.png')) return 'image/png'
    if (name.endsWith('.webp')) return 'image/webp'
    if (name.endsWith('.gif')) return 'image/gif'
    if (name.endsWith('.avif')) return 'image/avif'
    if (name.endsWith('.heic') || name.endsWith('.heif')) return 'image/heic'

    return 'application/octet-stream'
}

// ============================================================================
// API 함수
// ============================================================================

type PresignResponse = PresignArticleResponse | PresignProfileResponse

/**
 * Upload API 함수 모음
 */
const uploadApi = {
    /**
     * 게시글 이미지용 presigned URL 발급
     * @param currentUserId - 현재 사용자 ID
     * @param file - 업로드할 파일
     * @returns presigned URL 정보
     */
    presignArticle: async (
        currentUserId: string,
        file: File
    ): Promise<PresignResponse> => {
        const { key, putUrl, cdnUrl } = await contractClient.post(
            apiContract.articles.presignArticleImage,
            { headers: { 'Content-Type': normalizeContentType(file) } }
        )
        return { key, putUrl, cdnUrl }
    },

    /**
     * 프로필 이미지용 presigned URL 발급
     * @param currentUserId - 현재 사용자 ID
     * @param file - 업로드할 파일
     * @returns presigned URL 정보
     */
    presignProfile: async (
        currentUserId: string,
        file: File
    ): Promise<PresignResponse> => {
        const { key, putUrl, cdnUrl } = await contractClient.post(
            apiContract.members.presignProfileImage,
            { headers: { 'Content-Type': normalizeContentType(file) } }
        )
        return { key, putUrl, cdnUrl }
    },

    /**
     * 게시글 이미지를 S3에 업로드
     * @param params - putUrl과 file
     * @returns ETag (필요시 사용)
     */
    uploadArticleS3: async ({
        putUrl,
        file
    }: {
        putUrl: string
        file: File
    }): Promise<string | null> => {
        const res = await fetch(putUrl, {
            method: 'PUT',
            headers: { 'Content-Type': normalizeContentType(file) },
            body: file
        })
        if (!res.ok)
            throw new Error(
                `S3 upload failed: ${res.status} ${await res.text()}`
            )
        return res.headers.get('ETag')
    },

    /**
     * 프로필 이미지를 S3에 업로드
     * @param params - putUrl과 file
     * @returns ETag (필요시 사용)
     */
    uploadProfileS3: async ({
        putUrl,
        file
    }: {
        putUrl: string
        file: File
    }): Promise<string | null> => {
        const res = await fetch(putUrl, {
            method: 'PUT',
            headers: { 'Content-Type': normalizeContentType(file) },
            body: file
        })
        if (!res.ok)
            throw new Error(
                `S3 upload failed: ${res.status} ${await res.text()}`
            )
        return res.headers.get('ETag')
    }
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 프로필 이미지 업로드 변수 타입
 */
type UploadAndRegisterVars = {
    /** 현재 사용자 ID */
    currentUserId: string
    /** 업로드할 파일 */
    file: File
}

/**
 * 프로필 이미지 업로드 Hook (presign + S3 업로드)
 * @param options - 성공/에러 콜백
 *
 * @example
 * const { mutate: uploadProfile } = useUploadProfile({
 *   onSuccess: () => toast.success('프로필 이미지가 업로드되었습니다.')
 * })
 *
 * uploadProfile({
 *   currentUserId: user.id.toString(),
 *   file,
 *   buildRequest: (cdnUrl) => ({
 *     imageUrl: cdnUrl,
 *     username: '사용자명',
 *     preferences: ['KOREAN'],
 *     cantEat: ['PEANUT']
 *   })
 * })
 */
export const useUploadProfilePhoto = (
    options: MutationOptions<string> = {}
) => {
    const { mutate, mutateAsync, isPending, error } = useMutation({
        mutationFn: async ({ currentUserId, file }: UploadAndRegisterVars) => {
            // 1) presign
            const { putUrl, cdnUrl } = await uploadApi.presignProfile(
                String(currentUserId),
                file
            )

            // 2) S3 업로드
            await uploadApi.uploadProfileS3({ putUrl, file })

            return cdnUrl
        },
        onSuccess: options.onSuccess,
        onError: options.onError
    })

    return { mutate, mutateAsync, isPending, error }
}

/**
 * 게시글 이미지 업로드 Hook (presign + S3 업로드)
 * @param options - 성공/에러 콜백
 *
 * @example
 * const { mutate: uploadArticle } = useUploadArticle({
 *   onSuccess: () => toast.success('게시글 이미지가 업로드되었습니다.')
 * })
 *
 * uploadArticle({
 *   currentUserId: user.id.toString(),
 *   file,
 *   buildRequest: (cdnUrl) => ({
 *     imageUrl: cdnUrl,
 *     username: '사용자명',
 *     preferences: ['KOREAN'],
 *     cantEat: ['PEANUT']
 *   })
 * })
 */
export const useUploadArticlePhoto = (
    options: MutationOptions<string> = {}
) => {
    const { mutate, mutateAsync, isPending, error } = useMutation({
        mutationFn: async ({ currentUserId, file }: UploadAndRegisterVars) => {
            // 1) presign
            const { putUrl, cdnUrl } = await uploadApi.presignArticle(
                String(currentUserId),
                file
            )

            // 2) S3 업로드
            await uploadApi.uploadArticleS3({ putUrl, file })

            // 3) 필요시 추가 처리 (현재는 S3 업로드만)
            return cdnUrl
        },
        onSuccess: options.onSuccess,
        onError: options.onError
    })

    return { mutate, mutateAsync, isPending, error }
}
