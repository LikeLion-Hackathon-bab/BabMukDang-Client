import { useEffect, useState } from 'react'
import { useNavigate, useParams } from '@/navigation'
import { useJoinMealPlanGuest, useMealPlanSharePreview } from '@/apis'

export function MealPlanGuestJoinPage() {
    const { token = '' } = useParams<{ token: string }>()
    const navigate = useNavigate()
    const [nickname, setNickname] = useState('')
    const [password, setPassword] = useState('')
    const { data } = useMealPlanSharePreview(token, { enabled: Boolean(token) })
    const { mutate, isPending } = useJoinMealPlanGuest({
        onSuccess: response => {
            window.localStorage.setItem(
                `mealPlanGuestSession:${token}`,
                response.sessionToken
            )
            window.localStorage.setItem(
                `mealPlanGuestSession:${response.mealPlanId}`,
                response.sessionToken
            )
            navigate(`/meal-plan-links/${token}/session`)
        }
    })

    const join = () => {
        const trimmed = nickname.trim()
        if (!trimmed) return
        mutate({
            token,
            body: {
                nickname: trimmed,
                password: password.trim() || undefined
            }
        })
    }

    return (
        <div className="flex min-h-full flex-col gap-18 py-20">
            <section className="rounded-24 overflow-hidden bg-white shadow-sm">
                <div className="bg-primary-100 flex flex-col gap-10 p-16">
                    <span className="text-caption-medium text-primary-main w-fit rounded-full bg-white px-10 py-5">
                        링크 초대
                    </span>
                    <h1 className="text-title2-semibold text-gray-8">
                        {data?.title ?? '밥약'}
                    </h1>
                    <div className="flex items-center gap-9">
                        <div className="text-caption-medium text-primary-main grid h-28 w-28 place-items-center rounded-full bg-white">
                            {data?.ownerName?.[0] ?? '밥'}
                        </div>
                        <span className="text-caption-medium text-gray-6">
                            {data?.ownerName ?? '친구'}님이 초대했어요
                        </span>
                    </div>
                </div>
                <div className="text-caption-medium text-gray-7 flex gap-16 p-13">
                    <span>참여자 {data?.participantCount ?? 1}명</span>
                    <span>게스트 참여 가능</span>
                </div>
            </section>

            <section className="flex flex-col gap-10">
                <div>
                    <h2 className="text-body1-semibold text-gray-8">
                        참여할 닉네임을 알려주세요
                    </h2>
                    <p className="text-caption-regular text-gray-5 mt-3">
                        닉네임만 있으면 바로 참여할 수 있어요.
                    </p>
                </div>
                <input
                    value={nickname}
                    onChange={event => setNickname(event.target.value)}
                    className="rounded-16 text-body1-semibold text-gray-8 bg-white px-15 py-14 shadow-sm outline-none"
                    placeholder="밥친구"
                />
                <input
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    className="rounded-16 bg-gray-1 text-body1-semibold text-gray-8 px-15 py-14 outline-none"
                    placeholder="비밀번호 선택 입력"
                    type="password"
                />
            </section>
            <section className="rounded-20 bg-gray-1 p-14">
                <h2 className="text-body2-semibold text-gray-8">
                    게스트로 참여해요
                </h2>
                <p className="text-caption-regular text-gray-5 mt-4 leading-5">
                    채팅·결정은 함께하지만 친구 목록·프로필·내 밥그릇은 보이지
                    않아요. 같은 닉네임·비밀번호로 다시 입장하면 이전 세션을
                    이어갑니다.
                </p>
            </section>
            <button
                type="button"
                disabled={isPending}
                onClick={join}
                className="rounded-30 bg-gray-8 text-body1-semibold mt-auto py-14 text-white disabled:opacity-40">
                참여하기
            </button>
        </div>
    )
}
