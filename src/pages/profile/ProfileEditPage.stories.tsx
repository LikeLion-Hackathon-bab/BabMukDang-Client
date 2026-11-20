import type { Meta, StoryObj } from '@storybook/react'

import { ProfileEditPage } from './ProfileEditPage'

const meta: Meta<typeof ProfileEditPage> = {
    title: 'Pages/Profile/ProfileEditPage',
    component: ProfileEditPage,
    tags: ['autodocs'],
    decorators: [],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    '내 프로필 정보를 수정할 수 있는 페이지입니다. 이름, 소개글, 좋아하는 음식, 못먹는 음식, 알러지를 편집할 수 있습니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof ProfileEditPage>

export const Default: Story = {}

export const WithFilledData: Story = {
    parameters: {
        docs: {
            description: {
                story: '기존 데이터가 채워진 상태의 편집 페이지입니다.'
            }
        }
    }
}

export const WithTags: Story = {
    parameters: {
        docs: {
            description: {
                story: '음식 태그들이 입력된 상태입니다.'
            }
        }
    }
}
