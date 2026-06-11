/** @fileoverview Invitation mock fixtures */
import type { InvitationPostRequest, InvitationResponse } from '@/apis'

const invitation = (
    invitationId: number,
    inviterName: string
): InvitationResponse => ({
    invitationId: invitationId as InvitationResponse['invitationId'],
    inviterName,
    inviterProfileImageUrl: null
})

export const mockInvitationResponses: InvitationResponse[] = [
    invitation(1, '유가은'),
    invitation(2, '김대규'),
    invitation(4, '이민수'),
    invitation(5, '이민수'),
    invitation(6, '이민수'),
    invitation(7, '이민수')
]

export const mockInvitationRequest: InvitationPostRequest = {
    inviteeId: 2 as InvitationPostRequest['inviteeId'],
    message: '같이 밥 먹어요!'
}

export const mockSingleInvitationResponse: InvitationResponse =
    mockInvitationResponses[0]
