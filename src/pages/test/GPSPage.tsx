import { useState } from 'react'

interface LocationData {
    latitude: number
    longitude: number
    accuracy: number
    timestamp: number
}

export function GPSPage() {
    const [location, setLocation] = useState<LocationData | null>(null)
    const [isTracking, setIsTracking] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [permission, setPermission] = useState<string>('prompt')

    const requestPermission = async () => {
        try {
            if (!navigator.geolocation) {
                setError('이 브라우저는 위치 서비스를 지원하지 않습니다.')
                return
            }

            const result = await navigator.permissions.query({
                name: 'geolocation'
            })
            setPermission(result.state)

            if (result.state === 'denied') {
                setError(
                    '위치 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.'
                )
                return
            }

            if (result.state === 'prompt') {
                // 권한 요청
                navigator.geolocation.getCurrentPosition(
                    position => {
                        setPermission(`granted ${position}`)
                        setError(null)
                        getCurrentLocation()
                    },
                    error => {
                        setPermission(`denied ${error}`)
                        setError('위치 권한이 거부되었습니다.')
                    }
                )
            }
        } catch {
            setError('권한 확인 중 오류가 발생했습니다.')
        }
    }

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('이 브라우저는 위치 서비스를 지원하지 않습니다.')
            return
        }

        setError(null)
        navigator.geolocation.getCurrentPosition(
            position => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                })
            },
            error => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setError('위치 권한이 거부되었습니다.')
                        break
                    case error.POSITION_UNAVAILABLE:
                        setError('위치 정보를 사용할 수 없습니다.')
                        break
                    case error.TIMEOUT:
                        setError('위치 요청 시간이 초과되었습니다.')
                        break
                    default:
                        setError('알 수 없는 오류가 발생했습니다.')
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        )
    }

    const startTracking = () => {
        if (!navigator.geolocation) {
            setError('이 브라우저는 위치 서비스를 지원하지 않습니다.')
            return
        }

        setIsTracking(true)
        setError(null)

        const watchId = navigator.geolocation.watchPosition(
            position => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                })
            },
            error => {
                setIsTracking(false)
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setError('위치 권한이 거부되었습니다.')
                        break
                    case error.POSITION_UNAVAILABLE:
                        setError('위치 정보를 사용할 수 없습니다.')
                        break
                    case error.TIMEOUT:
                        setError('위치 요청 시간이 초과되었습니다.')
                        break
                    default:
                        setError('알 수 없는 오류가 발생했습니다.')
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        )

        // 컴포넌트 언마운트 시 추적 중지
        return () => {
            navigator.geolocation.clearWatch(watchId)
        }
    }

    const stopTracking = () => {
        setIsTracking(false)
    }

    return (
        <div className="p-4">
            <div className="mb-6">
                <h1 className="mb-2 text-2xl font-bold text-gray-900">
                    GPS 위치 서비스
                </h1>
                <p className="text-gray-600">
                    실시간 위치 추적 및 오프라인 캐싱
                </p>
            </div>

            {/* 권한 상태 */}
            <div className="mb-6">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                    <div>
                        <h3 className="font-semibold text-gray-900">
                            위치 권한
                        </h3>
                        <p className="text-sm text-gray-600">
                            {permission === 'granted' && '✅ 권한 허용됨'}
                            {permission === 'denied' && '❌ 권한 거부됨'}
                            {permission === 'prompt' && '⏳ 권한 요청 필요'}
                        </p>
                    </div>
                    {permission !== 'granted' && (
                        <button
                            onClick={requestPermission}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                            권한 요청
                        </button>
                    )}
                </div>
            </div>

            {/* 오류 메시지 */}
            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* 위치 정보 */}
            {location && (
                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
                    <h3 className="mb-3 font-semibold text-gray-900">
                        현재 위치
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">위도:</span>
                            <span className="font-mono">
                                {location.latitude.toFixed(6)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">경도:</span>
                            <span className="font-mono">
                                {location.longitude.toFixed(6)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">정확도:</span>
                            <span className="font-mono">
                                {location.accuracy.toFixed(1)}m
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">시간:</span>
                            <span className="font-mono">
                                {new Date(location.timestamp).toLocaleString(
                                    'ko-KR'
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* 컨트롤 버튼 */}
            <div className="space-y-3">
                <button
                    onClick={getCurrentLocation}
                    disabled={permission !== 'granted'}
                    className="w-full rounded-lg bg-green-600 px-4 py-3 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300">
                    현재 위치 가져오기
                </button>

                {!isTracking ? (
                    <button
                        onClick={startTracking}
                        disabled={permission !== 'granted'}
                        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300">
                        위치 추적 시작
                    </button>
                ) : (
                    <button
                        onClick={stopTracking}
                        className="w-full rounded-lg bg-red-600 px-4 py-3 text-white transition-colors hover:bg-red-700">
                        위치 추적 중지
                    </button>
                )}
            </div>

            {/* 모바일 최적화 정보 */}
            <div className="mt-8 rounded-lg bg-blue-50 p-4">
                <h3 className="mb-2 font-semibold text-blue-900">
                    모바일 최적화
                </h3>
                <ul className="space-y-1 text-sm text-blue-800">
                    <li>• 배터리 효율성을 위한 추적 간격 조절</li>
                    <li>• 네트워크 불안정 시 오프라인 캐싱</li>
                    <li>• 터치 친화적 UI/UX</li>
                    <li>• 위치 정확도 자동 조절</li>
                </ul>
            </div>
        </div>
    )
}
