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
        <div className="flex flex-col gap-20 py-20">
            <section className="rounded-20 bg-white p-16">
                <h1 className="text-title2-semibold text-gray-8">
                    {data?.title ?? '밥약'}에 참여할 닉네임을 알려주세요.
                </h1>
                <p className="text-body2-medium text-gray-5">
                    게스트는 친구 목록, 프로필 상세, 내 밥그릇 기능에 접근하지
                    않습니다.
                </p>
            </section>
            <input
                value={nickname}
                onChange={event => setNickname(event.target.value)}
                className="rounded-16 bg-white px-14 py-12 text-body1-semibold text-gray-8 outline-none"
                placeholder="닉네임"
            />
            <input
                value={password}
                onChange={event => setPassword(event.target.value)}
                className="rounded-16 bg-white px-14 py-12 text-body1-semibold text-gray-8 outline-none"
                placeholder="비밀번호 선택 입력"
                type="password"
            />
            <p className="px-4 text-caption-regular text-gray-5">
                같은 닉네임으로 이미 참여한 경우, 비밀번호가 일치하면 이전
                게스트 세션을 다시 발급합니다. 비밀번호를 설정하지 않았다면
                닉네임만으로 다시 입장할 수 있습니다.
            </p>
            <button
                type="button"
                disabled={isPending}
                onClick={join}
                className="rounded-30 bg-gray-8 text-body1-semibold py-14 text-white disabled:opacity-40">
                참여하기
            </button>
        </div>
    )
}
