import type { Meta, StoryObj } from '@storybook/react'

import { JoinCompleteModal } from './JoinCompleteModal'

const meta: Meta<typeof JoinCompleteModal> = {
    title: 'Modals/JoinCompleteModal',
    component: JoinCompleteModal,
    tags: ['autodocs'],
    argTypes: {
        open: {
            control: 'boolean',
            description: '모달이 열려 있는지 여부'
        },
        id: {
            control: 'text',
            description: '모달의 고유 ID'
        },
        title: {
            control: 'text',
            description: '모달 제목'
        },
        description: {
            control: 'text',
            description: '모달 설명'
        },
        acceptText: {
            control: 'text',
            description: '확인 버튼 텍스트'
        },
        recruitId: {
            control: 'text',
            description: '공고 ID'
        },
        onClose: {
            action: 'onClose',
            description: '모달 닫기 시 호출되는 콜백'
        },
        onAccept: {
            action: 'onAccept',
            description: '모달 확인 시 호출되는 콜백'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        open: true,
        id: 'join-complete-modal',
        title: '참여 신청 완료!',
        description: '호스트가 수락하면 알림을 보내드릴게요',
        acceptText: '확인하러 가기'
    }
}

export const WithRecruitId: Story = {
    args: {
        open: true,
        id: 'join-complete-with-id',
        title: '매칭 완료!',
        description: '밥약속이 성사되었습니다',
        acceptText: '약속 보러 가기',
        recruitId: 'recruit-123'
    }
}

export const CustomTitle: Story = {
    args: {
        open: true,
        id: 'custom-title-modal',
        title: '🎉 축하합니다!',
        description: '첫 번째 밥약속에 참여하셨습니다',
        acceptText: '시작하기'
    }
}

export const PendingApproval: Story = {
    args: {
        open: true,
        id: 'pending-approval-modal',
        title: '신청이 접수되었습니다',
        description: '호스트의 승인을 기다려주세요',
        acceptText: '알겠습니다'
    }
}

export const Closed: Story = {
    args: {
        open: false,
        id: 'closed-modal',
        title: '참여 신청 완료!',
        description: '호스트가 수락하면 알림을 보내드릴게요',
        acceptText: '확인하러 가기'
    }
}

