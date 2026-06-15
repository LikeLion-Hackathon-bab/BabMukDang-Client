import type { ReactNode } from 'react'
import type { RoomTaskKey, RoomTaskStatus } from '@kimdaegyu/babmukdang-shared/domain/room'

import { useSocket } from '@/contexts/SocketContext'
import { DatePage } from './DatePage'
import { TimePage } from './TimePage'
import { LocationSelectionPage } from './LocationSelectionPage'
import { LocationVotePage } from './LocationVotePage'
import { MenuExcludePage } from './MenuExcludePage'
import { MenuPage } from './MenuPage'
import { RestaurantPage } from './RestaurantPage'

const ACTIVE_STATUSES: RoomTaskStatus[] = ['open', 'ready', 'resolved', 'stale']

const TASK_LABELS: Record<RoomTaskKey, string> = {
    'schedule-date': '날짜 후보',
    'schedule-time': '시간 후보',
    'location-candidate': '장소 후보',
    'location-vote': '장소 투표',
    'exclude-menu': '제외 메뉴',
    'prefer-menu': '선호 메뉴',
    'menu-pick': '메뉴 선택',
    'restaurant-search': '식당 검색',
    'restaurant-pick': '식당 선택'
}

const TASK_DESCRIPTIONS: Partial<Record<RoomTaskKey, string>> = {
    'schedule-date': '가능한 날짜를 모두 선택하면 공통 가능한 날짜 후보가 계산돼요.',
    'schedule-time': '가능한 시간대를 모두 선택하면 약속 시간이 계산돼요.',
    'location-candidate': '지도에서 만날 장소 후보를 추가할 수 있어요.',
    'location-vote': '추가된 장소 후보 중 가장 좋은 장소를 골라주세요.',
    'exclude-menu': '피하고 싶은 메뉴를 고르면 메뉴 후보에서 제외돼요.',
    'prefer-menu': '먹고 싶은 메뉴를 추가하면 추천 후보에 우선 반영돼요.',
    'menu-pick': '현재 메뉴 후보 중 먹고 싶은 메뉴를 선택해주세요.',
    'restaurant-pick': '메뉴와 장소를 바탕으로 찾은 식당 후보 중 하나를 골라주세요.'
}

function getTaskStatusLabel(status: RoomTaskStatus) {
    switch (status) {
        case 'locked':
            return '잠김'
        case 'open':
            return '진행 가능'
        case 'ready':
            return '확정 대기'
        case 'resolved':
            return '확정됨'
        case 'stale':
            return '재검토 필요'
        default:
            return status
    }
}

function useTaskStatus(taskKey: RoomTaskKey): RoomTaskStatus {
    const { progress } = useSocket()
    return progress?.tasks.find(task => task.key === taskKey)?.status ?? 'locked'
}

function isTaskVisible(status: RoomTaskStatus) {
    return ACTIVE_STATUSES.includes(status)
}

function TaskSection({
    taskKey,
    children
}: {
    taskKey: RoomTaskKey
    children: ReactNode
}) {
    const status = useTaskStatus(taskKey)

    if (!isTaskVisible(status)) {
        return null
    }

    return (
        <section className="shadow-drop-1 rounded-16 border-gray-2 flex flex-col gap-16 border bg-white p-16">
            <header className="flex items-start justify-between gap-12">
                <div className="flex flex-col gap-4">
                    <h2 className="text-body1-semibold text-black">
                        {TASK_LABELS[taskKey]}
                    </h2>
                    {TASK_DESCRIPTIONS[taskKey] && (
                        <p className="text-caption-medium text-gray-500">
                            {TASK_DESCRIPTIONS[taskKey]}
                        </p>
                    )}
                </div>
                <span className="bg-primary-100 text-primary-600 text-caption-medium rounded-full px-8 py-4 whitespace-nowrap">
                    {getTaskStatusLabel(status)}
                </span>
            </header>
            {status === 'stale' && (
                <p className="text-caption-medium rounded-12 bg-yellow-50 px-12 py-8 text-yellow-700">
                    관련 선택이 바뀌어서 이 작업의 후보를 다시 확인해야 해요.
                </p>
            )}
            <div className="min-w-0">{children}</div>
        </section>
    )
}

function PreferMenuSection() {
    const { categories, commands, menuCandidates } = useSocket()
    const fallbackCategories = categories.slice(0, 12)

    return (
        <div className="flex flex-col gap-12">
            {menuCandidates.length > 0 && (
                <div className="flex flex-col gap-6">
                    <span className="text-caption-medium text-gray-500">
                        현재 메뉴 후보
                    </span>
                    <div className="flex flex-wrap gap-8">
                        {menuCandidates.map(candidate => (
                            <span
                                key={String(candidate.id)}
                                className="bg-gray-1 text-caption-medium rounded-full px-10 py-6 text-gray-700">
                                {candidate.menu.label}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            <div className="flex flex-wrap gap-8">
                {fallbackCategories.map(category => (
                    <button
                        key={category.id}
                        type="button"
                        className="border-gray-2 text-body2-medium rounded-full border bg-white px-12 py-8 text-gray-800"
                        onClick={() =>
                            commands?.preferMenu({
                                menu: {
                                    code: category.id as never,
                                    label: category.name as never
                                }
                            })
                        }>
                        {category.name}
                    </button>
                ))}
            </div>
        </div>
    )
}

function RestaurantSearchSection() {
    const { progress, restaurantCandidates } = useSocket()
    const status = progress?.tasks.find(task => task.key === 'restaurant-search')
        ?.status

    if (!isTaskVisible(status ?? 'locked')) {
        return null
    }

    return (
        <section className="shadow-drop-1 rounded-16 border-gray-2 flex flex-col gap-8 border bg-white p-16">
            <div className="flex items-center justify-between">
                <h2 className="text-body1-semibold text-black">식당 후보 검색</h2>
                <span className="bg-primary-100 text-primary-600 text-caption-medium rounded-full px-8 py-4">
                    {getTaskStatusLabel(status ?? 'locked')}
                </span>
            </div>
            <p className="text-caption-medium text-gray-500">
                확정 또는 임시 확정된 장소와 메뉴를 기준으로 식당 후보를 계산해요.
            </p>
            <span className="text-caption-medium text-gray-700">
                현재 후보 {restaurantCandidates.length}개
            </span>
        </section>
    )
}

export function RoomTaskPage() {
    const { matchType, progress } = useSocket()

    if (progress?.phase === 'finished') {
        return <RestaurantPage />
    }

    return (
        <div className="flex flex-col gap-20 pb-120">
            <TaskSection taskKey="schedule-date">
                {matchType === 'invitation' && <DatePage />}
            </TaskSection>
            <TaskSection taskKey="schedule-time">
                {matchType === 'invitation' && <TimePage />}
            </TaskSection>
            <TaskSection taskKey="location-candidate">
                <LocationSelectionPage />
            </TaskSection>
            <TaskSection taskKey="location-vote">
                <LocationVotePage />
            </TaskSection>
            <TaskSection taskKey="exclude-menu">
                <MenuExcludePage />
            </TaskSection>
            <TaskSection taskKey="prefer-menu">
                <PreferMenuSection />
            </TaskSection>
            <TaskSection taskKey="menu-pick">
                <MenuPage />
            </TaskSection>
            <RestaurantSearchSection />
            <TaskSection taskKey="restaurant-pick">
                <RestaurantPage />
            </TaskSection>
        </div>
    )
}
