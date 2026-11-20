import { Capacitor } from '@capacitor/core'
import type { MealPlanId } from '@kimdaegyu/babmukdang-shared/domain'
import {
    useEndMealPlanLiveActivitySessions,
    useGetMealPlanLiveActivitySessions,
    useRegisterMealPlanLiveActivitySession
} from '@/apis'
import {
    createMealPlanLiveActivityRegistration,
    endNativeMealPlanLiveActivity
} from '@/features/live-activity'

export function MealPlanLiveActivityPanel({ mealPlanId }: { mealPlanId: string }) {
    const typedMealPlanId = mealPlanId as MealPlanId
    const { data, isLoading, error } = useGetMealPlanLiveActivitySessions(
        typedMealPlanId,
        Boolean(mealPlanId && Capacitor.isNativePlatform())
    )
    const registerSession = useRegisterMealPlanLiveActivitySession(typedMealPlanId)
    const endSessions = useEndMealPlanLiveActivitySessions(typedMealPlanId)
    const activeCount = data?.sessions.filter(session => session.status === 'ACTIVE').length ?? 0
    const isNative = Capacitor.isNativePlatform()

    const handleStart = async () => {
        if (!data?.state) return
        const registration = await createMealPlanLiveActivityRegistration(
            typedMealPlanId,
            data.state
        )
        if (!registration) return
        await registerSession.mutateAsync(registration)
    }

    const handleEnd = async () => {
        await endNativeMealPlanLiveActivity(typedMealPlanId)
        await endSessions.mutateAsync({})
    }

    if (!isNative) return null

    return (
        <section className="rounded-20 bg-white p-16">
            <div className="mb-12">
                <h2 className="text-body1-semibold text-gray-8">
                    잠금화면 라이브 업데이트
                </h2>
                <p className="text-caption-regular text-gray-5">
                    iOS에서는 Live Activity와 Dynamic Island로, Android에서는 진행 중 알림으로 밥약 예정 상태를 보여줍니다.
                </p>
            </div>

            {error && (
                <p className="mb-10 rounded-12 bg-red-50 px-12 py-8 text-caption-regular text-red-600">
                    라이브 업데이트 상태를 불러오지 못했습니다.
                </p>
            )}

            <div className="mb-12 rounded-16 bg-gray-1 p-12 text-caption-regular text-gray-6">
                {isLoading
                    ? '라이브 업데이트 상태를 확인하고 있습니다.'
                    : `현재 활성 세션 ${activeCount}개`}
            </div>

            <div className="grid grid-cols-2 gap-8">
                <button
                    type="button"
                    disabled={
                        isLoading ||
                        registerSession.isPending ||
                        !data?.state
                    }
                    onClick={handleStart}
                    className="rounded-30 bg-gray-8 py-12 text-body1-semibold text-white disabled:bg-gray-4">
                    {registerSession.isPending ? '켜는 중' : '켜기 / 갱신'}
                </button>
                <button
                    type="button"
                    disabled={isLoading || endSessions.isPending || activeCount === 0}
                    onClick={handleEnd}
                    className="rounded-30 bg-gray-2 py-12 text-body1-semibold text-gray-7 disabled:text-gray-4">
                    {endSessions.isPending ? '끄는 중' : '끄기'}
                </button>
            </div>
        </section>
    )
}
