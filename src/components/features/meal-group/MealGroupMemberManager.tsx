import { useMemo, useState } from 'react'
import type { MealGroupResponse, MealGroupMemberRole } from '@kimdaegyu/babmukdang-shared/domain'
import {
    useAddMealGroupMember,
    useFriends,
    useRemoveMealGroupMember,
    useUpdateMealGroupMemberRole
} from '@/apis'
import { useAuthStore } from '@/store'
import type { FriendListItemResponse } from '@kimdaegyu/babmukdang-shared/domain'

export function MealGroupMemberManager({
    mealGroup
}: {
    mealGroup: MealGroupResponse
}) {
    const currentUserId = Number(useAuthStore(state => state.userId))
    const isOwner = Number(mealGroup.owner.memberId) === currentUserId
    const [selectedMemberId, setSelectedMemberId] = useState('')
    const [selectedRole, setSelectedRole] = useState<MealGroupMemberRole>('MEMBER')
    const { data: friends = [] } = useFriends()
    const addMember = useAddMealGroupMember({
        onSuccess: () => {
            setSelectedMemberId('')
            setSelectedRole('MEMBER')
        }
    })
    const updateRole = useUpdateMealGroupMemberRole()
    const removeMember = useRemoveMealGroupMember()

    const existingMemberIds = useMemo(
        () => new Set(mealGroup.members.map(member => Number(member.member.memberId))),
        [mealGroup.members]
    )
    const addableFriends = friends.filter(
        (friend: FriendListItemResponse) =>
            !existingMemberIds.has(Number(friend.memberId))
    )

    return (
        <section className="rounded-20 flex flex-col gap-14 bg-white p-16">
            <div>
                <h2 className="text-body1-semibold text-gray-8">멤버 관리</h2>
                <p className="text-caption-regular mt-4 text-gray-5">
                    그룹 소유자는 멤버를 추가하거나 제거하고, 소유자 권한을 넘길 수 있습니다.
                </p>
            </div>

            <div className="flex flex-col gap-8">
                {mealGroup.members.map(groupMember => {
                    const memberId = Number(groupMember.member.memberId)
                    const isGroupOwner = Number(mealGroup.owner.memberId) === memberId
                    return (
                        <div
                            key={memberId}
                            className="rounded-16 border-gray-2 flex items-center justify-between gap-10 border p-12">
                            <div className="min-w-0">
                                <p className="text-body2-semibold text-gray-8 truncate">
                                    {groupMember.member.username}
                                </p>
                                <p className="text-caption-regular text-gray-5">
                                    {isGroupOwner ? '소유자' : groupMember.role === 'OWNER' ? '소유자' : '멤버'} · {new Date(groupMember.joinedAt).toLocaleDateString('ko-KR')}
                                </p>
                            </div>
                            {isOwner ? (
                                <div className="flex shrink-0 items-center gap-6">
                                    {!isGroupOwner && (
                                        <button
                                            type="button"
                                            disabled={updateRole.isPending}
                                            onClick={() =>
                                                updateRole.mutate({
                                                    mealGroupId: mealGroup.mealGroupId,
                                                    memberId,
                                                    body: { role: 'OWNER' }
                                                })
                                            }
                                            className="rounded-20 bg-primary-100 text-caption-semibold text-primary-500 px-10 py-6 disabled:opacity-50">
                                            소유자 위임
                                        </button>
                                    )}
                                    {!isGroupOwner && (
                                        <button
                                            type="button"
                                            disabled={removeMember.isPending}
                                            onClick={() => {
                                                if (window.confirm(`${groupMember.member.username}님을 그룹에서 제거할까요?`)) {
                                                    removeMember.mutate({
                                                        mealGroupId: mealGroup.mealGroupId,
                                                        memberId
                                                    })
                                                }
                                            }}
                                            className="rounded-20 bg-gray-1 text-caption-semibold text-red-500 px-10 py-6 disabled:opacity-50">
                                            제거
                                        </button>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    )
                })}
            </div>

            {isOwner && (
                <div className="rounded-16 bg-gray-1 flex flex-col gap-8 p-12">
                    <h3 className="text-body2-semibold text-gray-8">친구 추가</h3>
                    {addableFriends.length === 0 ? (
                        <p className="text-caption-regular text-gray-5">
                            추가할 수 있는 친구가 없습니다.
                        </p>
                    ) : (
                        <>
                            <select
                                value={selectedMemberId}
                                onChange={event => setSelectedMemberId(event.target.value)}
                                className="rounded-14 border-gray-2 bg-white text-body2-medium border px-12 py-10">
                                <option value="">추가할 친구를 선택하세요</option>
                                {addableFriends.map((friend: FriendListItemResponse) => (
                                    <option
                                        key={friend.memberId}
                                        value={String(friend.memberId)}>
                                        {friend.username}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                disabled={addMember.isPending || selectedMemberId.length === 0}
                                onClick={() =>
                                    addMember.mutate({
                                        mealGroupId: mealGroup.mealGroupId,
                                        body: {
                                            memberId: Number(selectedMemberId),
                                            role: selectedRole
                                        }
                                    })
                                }
                                className="rounded-30 bg-gray-8 text-body1-semibold disabled:bg-gray-3 py-12 text-white">
                                {addMember.isPending ? '추가 중입니다.' : '멤버 추가'}
                            </button>
                        </>
                    )}
                </div>
            )}
        </section>
    )
}
