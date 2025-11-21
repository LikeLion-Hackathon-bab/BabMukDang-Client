import axios from 'axios'
import { client } from './client'

const webSocketClient = axios.create({
    baseURL: import.meta.env.VITE_WEBSOCKET_URL,
    withCredentials: false
})
// 1) presign 받기
export const presignArticle = async (
    currentUserId: string,
    file: File
): Promise<{ key: string; putUrl: string; cdnUrl: string }> => {
    const { key, putUrl, cdnUrl } = await webSocketClient
        .post(`${import.meta.env.VITE_BASE_API_URL}/uploads/presign-article`, {
            userId: currentUserId,
            contentType: file.type
        })
        .then(res => res.data.data)
    return { key, putUrl, cdnUrl }
}

export const presignProfile = async (
    currentUserId: string,
    file: File
): Promise<{ key: string; putUrl: string; cdnUrl: string }> => {
    const { key, putUrl, cdnUrl } = await webSocketClient
        .post(`${import.meta.env.VITE_BASE_API_URL}/uploads/presign-profile`, {
            userId: currentUserId,
            contentType: file.type
        })
        .then(res => res.data.data)
    return { key, putUrl, cdnUrl }
}

export const uploadArticleS3 = async ({
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
        throw new Error(`S3 upload failed: ${res.status} ${await res.text()}`)
    return res.headers.get('ETag') // 필요하면 사용
}

export const uploadProfileS3 = async ({
    putUrl,
    file
}: {
    putUrl: string
    file: File
}): Promise<string | null> => {
    const res = await fetch(putUrl, {
        method: 'PUT',
        headers: { 'Content-Type': normalizeContentType(file) },
        body: file // Blob or ArrayBuffer
    })
    if (!res.ok)
        throw new Error(`S3 upload failed: ${res.status} ${await res.text()}`)
    return res.headers.get('ETag') // 필요하면 사용
}

const normalizeContentType = (file: File) => {
    if (file.type) return file.type // 정상: image/png 등
    const name = file.name.toLowerCase()
    if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg'
    if (name.endsWith('.png')) return 'image/png'
    if (name.endsWith('.webp')) return 'image/webp'
    if (name.endsWith('.gif')) return 'image/gif'
    if (name.endsWith('.avif')) return 'image/avif'
    // iOS HEIC 같은 케이스 → 서버에서 변환 파이프라인이 없다면 jpeg로 업로드 권장
    if (name.endsWith('.heic') || name.endsWith('.heif')) return 'image/heic'
    return 'application/octet-stream'
}
