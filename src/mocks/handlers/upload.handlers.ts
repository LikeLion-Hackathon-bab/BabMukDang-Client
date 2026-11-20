import { http } from 'msw'
import { API_BASE_URL } from '@/apis/baseUrl'
import { apiSuccess } from './response'

const BASE_URL = API_BASE_URL

export const uploadHandlers = [
    http.post(`${BASE_URL}/uploads/presign-profile`, () =>
        apiSuccess({
            key: 'profiles/1/mock-profile-image.jpg',
            putUrl: 'https://storage.example.test/profiles/1/mock-profile-image.jpg',
            cdnUrl: 'https://cdn.example.test/profiles/1/mock-profile-image.jpg'
        })
    ),
    http.post(`${BASE_URL}/uploads/presign-article`, () =>
        apiSuccess({
            key: 'articles/1/mock-article-image.jpg',
            putUrl: 'https://storage.example.test/articles/1/mock-article-image.jpg',
            cdnUrl: 'https://cdn.example.test/articles/1/mock-article-image.jpg'
        })
    ),
    http.put(
        'https://storage.example.test/:path*',
        () =>
            new Response(null, { status: 200, headers: { ETag: 'mock-etag' } })
    )
]
