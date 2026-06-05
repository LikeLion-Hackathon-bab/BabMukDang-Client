/**
 * @fileoverview Article API Mock Handlers
 *
 * 게시글 관련 API의 mock handler를 정의합니다.
 * endpoints 객체와 api 타입 패턴을 사용합니다.
 */

import { http, HttpResponse } from 'msw'
import { endpoints, api } from '@/apis'
import { articleFixtures } from '@/mocks/fixtures'

const BASE_URL = import.meta.env.VITE_SERVER_URL || ''

/**
 * Article API mock handlers
 */
export const articleHandlers = [
    /**
     * GET /articles/home - 홈 피드 게시글 조회
     */
    http.get(`${BASE_URL}${endpoints.articles.home}`, () => {
        const response: typeof api.articles.ListResponse =
            articleFixtures.homeList
        return HttpResponse.json(response)
    }),

    /**
     * GET /articles/:id - 게시글 상세 조회
     */
    http.get(`${BASE_URL}/articles/:id`, ({ params }) => {
        const { id } = params
        console.log(`[MSW] 게시글 상세 조회: ${id}`)
        const response: typeof api.articles.DetailResponse =
            articleFixtures.detail
        return HttpResponse.json(response)
    }),

    /**
     * POST /articles - 게시글 생성
     */
    http.post(
        `${BASE_URL}${endpoints.articles.create}`,
        async ({ request }) => {
            const body =
                (await request.json()) as typeof api.articles.CreateRequest
            console.log('[MSW] 게시글 생성:', body)
            return HttpResponse.json(
                {
                    code: 201,
                    message: '게시글이 생성되었습니다.',
                    data: null
                },
                { status: 201 }
            )
        }
    ),

    /**
     * DELETE /articles/:id - 게시글 삭제
     */
    http.delete(`${BASE_URL}/articles/:id`, ({ params }) => {
        const { id } = params
        console.log(`[MSW] 게시글 삭제: ${id}`)
        return HttpResponse.json({
            code: 200,
            message: '게시글이 삭제되었습니다.',
            data: null
        })
    }),

    /**
     * POST /articles/:id/like - 게시글 좋아요
     */
    http.post(`${BASE_URL}/articles/:id/like`, ({ params }) => {
        const { id } = params
        console.log(`[MSW] 게시글 좋아요: ${id}`)
        const response: typeof api.articles.LikeResponse = {
            liked: true,
            likeCount: 10
        }
        return HttpResponse.json(response)
    }),

    /**
     * GET /articles/:id/comments - 댓글 목록 조회
     */
    http.get(`${BASE_URL}/articles/:id/comments`, ({ params }) => {
        const { id } = params
        console.log(`[MSW] 댓글 목록 조회: ${id}`)
        return HttpResponse.json(articleFixtures.comments)
    }),

    /**
     * POST /articles/:id/comments - 댓글 작성
     */
    http.post(
        `${BASE_URL}/articles/:id/comments`,
        async ({ request, params }) => {
            const { id } = params
            const body =
                (await request.json()) as typeof api.articles.CommentRequest
            console.log(`[MSW] 댓글 작성 (게시글 ${id}):`, body)
            return HttpResponse.json(
                {
                    code: 201,
                    message: '댓글이 작성되었습니다.',
                    data: null
                },
                { status: 201 }
            )
        }
    ),

    /**
     * DELETE /articles/comments/:commentId - 댓글 삭제
     */
    http.delete(`${BASE_URL}/articles/comments/:commentId`, ({ params }) => {
        const { commentId } = params
        console.log(`[MSW] 댓글 삭제: ${commentId}`)
        return HttpResponse.json({
            code: 200,
            message: '댓글이 삭제되었습니다.',
            data: null
        })
    }),

    /**
     * GET /members/me/articles - 내 게시글 목록
     */
    http.get(`${BASE_URL}${endpoints.articles.my}`, () => {
        return HttpResponse.json(articleFixtures.homeList)
    }),

    /**
     * GET /members/:memberId/articles - 특정 멤버의 게시글 목록
     */
    http.get(`${BASE_URL}/members/:memberId/articles`, ({ params }) => {
        const { memberId } = params
        console.log(`[MSW] 멤버 게시글 목록: ${memberId}`)
        return HttpResponse.json(articleFixtures.homeList)
    })
]
