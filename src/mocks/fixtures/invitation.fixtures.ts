/**
 * @fileoverview Invitation (초대) 관련 Mock Fixtures
 *
 * 초대 관련 테스트 및 개발용 mock 데이터를 정의합니다.
 */

import type { InvitationResponse, InvitationPostRequest } from '@/apis'

/**
 * 초대 응답 mock 데이터 목록
 */
export const mockInvitationResponses: InvitationResponse[] = [
    {
        invitationId: 1,
        inviterName: '유가은',
        inviterProfileImageUrl: ''
    },
    {
        invitationId: 2,
        inviterName: '김대규',
        inviterProfileImageUrl: ''
    },
    {
        invitationId: 4,
        inviterName: '이민수',
        inviterProfileImageUrl: ''
    },
    {
        invitationId: 5,
        inviterName: '이민수',
        inviterProfileImageUrl: ''
    },
    {
        invitationId: 6,
        inviterName: '이민수',
        inviterProfileImageUrl: ''
    },
    {
        invitationId: 7,
        inviterName: '이민수',
        inviterProfileImageUrl: ''
    }
]

/**
 * 초대 요청 mock 데이터
 */
export const mockInvitationRequest: InvitationPostRequest = {
    inviteeId: 2,
    message: '같이 밥 먹어요!'
}

/**
 * 단일 초대 응답 mock
 */
export const mockSingleInvitationResponse: InvitationResponse =
    mockInvitationResponses[0]
