import { useState } from 'react'
import { useRegisterPushToken } from '@/apis/pushToken.api'
import { requestPushTokenRegistration } from '@/features/push'

type PushPermissionCtaState =
    | 'idle'
    | 'requesting'
    | 'registered'
    | 'denied'
    | 'unsupported'
    | 'error'

export function PushPermissionCta() {
    const [state, setState] = useState<PushPermissionCtaState>('idle')
    const [message, setMessage] = useState<string | null>(null)
    const { mutateAsync: registerPushToken } = useRegisterPushToken()

    const requestPermission = async () => {
        setState('requesting')
        setMessage(null)

        try {
            const registration = await requestPushTokenRegistration()
            if (!registration) {
                if (typeof window === 'undefined' || !('Notification' in window)) {
                    setState('unsupported')
                    setMessage('이 환경에서는 푸시 알림을 지원하지 않습니다.')
                    return
                }

                setState(Notification.permission === 'denied' ? 'denied' : 'error')
                setMessage(
                    Notification.permission === 'denied'
                        ? '브라우저 또는 앱 설정에서 알림 권한을 허용해야 합니다.'
                        : '푸시 토큰을 발급받지 못했습니다.'
                )
                return
            }

            await registerPushToken(registration)
            setState('registered')
            setMessage('알림을 받을 준비가 완료되었습니다.')
        } catch (error) {
            setState('error')
            setMessage(
                error instanceof Error
                    ? error.message
                    : '알림 권한 설정 중 문제가 발생했습니다.'
            )
        }
    }

    return (
        <section className="mx-18 mt-16 rounded-2xl border border-[#FFE0C2] bg-[#FFF8F1] p-16">
            <p className="text-15 font-semibold text-gray-900">
                밥약 알림을 놓치지 않도록 푸시 알림을 켜주세요.
            </p>
            <p className="mt-6 text-13 leading-20 text-gray-600">
                초대, 참여 요청, 확정된 밥약 시간, 기록 필요 알림을 앱 밖에서도 받을 수 있습니다.
            </p>
            {message && <p className="mt-8 text-12 text-gray-600">{message}</p>}
            <button
                type="button"
                onClick={requestPermission}
                disabled={state === 'requesting' || state === 'registered'}
                className="mt-12 rounded-full bg-[#FF7A1A] px-16 py-8 text-13 font-semibold text-white disabled:bg-gray-300"
            >
                {state === 'requesting'
                    ? '설정 중입니다'
                    : state === 'registered'
                      ? '알림 설정 완료'
                      : '푸시 알림 켜기'}
            </button>
        </section>
    )
}
