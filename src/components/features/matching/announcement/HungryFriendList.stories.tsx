// import type { Meta, StoryObj } from '@storybook/react'
// import { HungryFriendList } from './HungryFriendList'

// const meta: Meta<typeof HungryFriendList> = {
//     title: 'Features/Matching/Announcement/HungryFriendList',
//     component: HungryFriendList,
//     tags: ['autodocs'],
//     parameters: {
//         layout: 'padded'
//     }
// }

// export default meta
// type Story = StoryObj<typeof meta>

// const mockHungryFriends = [
//     {
//         memberId: 1,
//         userName: '김철수',
//         profileImageUrl: '',
//         status: 'HUNGRY' as const
//     },
//     {
//         memberId: 2,
//         userName: '이영희',
//         profileImageUrl: '',
//         status: 'HUNGRY' as const
//     },
//     {
//         memberId: 3,
//         userName: '박민수',
//         profileImageUrl: '',
//         status: 'HUNGRY' as const
//     }
// ]

// export const Default: Story = {
//     args: {
//         hungryFriendList: mockHungryFriends
//     }
// }

// export const SingleFriend: Story = {
//     args: {
//         hungryFriendList: [mockHungryFriends[0]]
//     }
// }

// export const ManyFriends: Story = {
//     args: {
//         hungryFriendList: [
//             ...mockHungryFriends,
//             {
//                 memberId: 4,
//                 userName: '정수진',
//                 profileImageUrl: '',
//                 status: 'HUNGRY' as const
//             },
//             {
//                 memberId: 5,
//                 userName: '최현우',
//                 profileImageUrl: '',
//                 status: 'HUNGRY' as const
//             }
//         ]
//     }
// }

// export const WithCustomClassName: Story = {
//     args: {
//         hungryFriendList: mockHungryFriends,
//         className: 'max-w-400'
//     }
// }

// export const Empty: Story = {
//     args: {
//         hungryFriendList: []
//     }
// }
