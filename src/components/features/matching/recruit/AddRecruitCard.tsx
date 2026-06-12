import { Post } from '@/apis'
import { DownIcon, UpIcon } from '@/assets/icons'
import { useRef, useState } from 'react'

export function AddRecruitCard({
    recruitAddData,
    setRecruitAddData
}: {
    recruitAddData: Post
    setRecruitAddData: (data: Post) => void
}) {
    const [message, setMessage] = useState(recruitAddData.message)
    const [period, setPeriod] = useState<'오전' | '오후'>('오전')
    const [hour, setHour] = useState<number>(12)
    const [minute, setMinute] = useState<number>(0)
    const [place, setPlace] = useState(recruitAddData.location)
    const [participants, setParticipants] = useState<number>(
        recruitAddData.targetCount
    )
    const [unlimited, setUnlimited] = useState<boolean>(false)
    const placeRef = useRef<HTMLInputElement>(null)
    const messageRef = useRef<HTMLTextAreaElement>(null)
    const updateMeetingAt = (
        nextHour: number = hour,
        nextMinute: number = minute
    ) => {
        const datePart = (
            recruitAddData.meetingAt || new Date().toISOString()
        ).split('T')[0]
        const hh = String(nextHour).padStart(2, '0')
        const mm = String(nextMinute).padStart(2, '0')
        setRecruitAddData({
            ...recruitAddData,
            meetingAt: `${datePart}T${hh}:${mm}`
        })
    }
    const decParticipants = () =>
        setParticipants(prev => {
            const next = prev > 0 ? prev - 1 : 0
            setRecruitAddData({
                ...recruitAddData,
                targetCount: next
            })
            return next
        })
    const incParticipants = () =>
        setParticipants(prev => {
            const next = prev + 1
            setRecruitAddData({
                ...recruitAddData,
                targetCount: next
            })
            return next
        })
    return (
        <div
            className={`shadow-drop-1 rounded-16 z-10000 h-353 w-full bg-white px-16 pt-16 pb-14`}>
            {/* 메시지 */}
            <div className="relative mb-16">
                <div className="rounded-12 border-gray-2 h-90 border px-12 py-12">
                    <textarea
                        id="message"
                        value={message}
                        ref={messageRef}
                        onChange={e => {
                            const val = e.target.value
                            setMessage(val)
                            setRecruitAddData({
                                ...recruitAddData,
                                message: val
                            })
                        }}
                        placeholder={`친구들에게 전할 메시지를 적어보세요\n(20자 내)`}
                        className="text-body2-medium h-full w-full resize-none"
                        style={{
                            color: message ? '#1C1C1C' : '#E4E4E4',
                            outline: 'none',
                            border: 'none',
                            background: 'transparent'
                        }}
                        rows={3}
                    />
                </div>
            </div>

            {/* 시간 */}
            <div className="mb-16 flex w-full flex-col gap-6">
                <span className="text-body2-medium text-gray-6">시간</span>
                <div
                    className="rounded-6 flex items-center justify-center"
                    style={{
                        background: '#F4F5F7',
                        padding: '8px 27px',
                        gap: 69
                    }}>
                    <button
                        type="button"
                        className="text-body2-medium text-nowrap"
                        onClick={() =>
                            setPeriod(p => (p === '오전' ? '오후' : '오전'))
                        }>
                        {period}
                    </button>
                    <button
                        type="button"
                        className="text-body2-medium"
                        onClick={() =>
                            setHour(h => {
                                const next = h === 23 ? 0 : h + 1
                                updateMeetingAt(next, minute)
                                return next
                            })
                        }>
                        {hour.toString().padStart(2, '0')}
                    </button>
                    <button
                        type="button"
                        className="text-body2-medium"
                        onClick={() =>
                            setMinute(m => {
                                const next = m >= 45 ? 0 : m + 15
                                updateMeetingAt(hour, next)
                                return next
                            })
                        }>
                        {minute.toString().padStart(2, '0')}
                    </button>
                </div>
            </div>

            {/* 만날 장소 */}
            <div className="mb-16 flex w-full flex-col gap-6">
                <span className="text-body2-medium text-gray-6">만날 장소</span>
                <input
                    value={place}
                    onChange={e => {
                        const val = e.target.value
                        setPlace(val)
                        setRecruitAddData({
                            ...recruitAddData,
                            location: val
                        })
                    }}
                    ref={placeRef}
                    placeholder=""
                    className="rounded-6 text-body2-medium px-12"
                    style={{ height: 36, border: '1px solid #E4E4E4' }}
                />
            </div>

            {/* 인원 수 */}
            <div className="flex w-full flex-col gap-6">
                <span className="text-body2-medium text-gray-6">인원 수</span>
                <div className="flex items-center gap-8">
                    {/* Stepper */}
                    {!unlimited && (
                        <div
                            className="rounded-6 flex items-center"
                            style={{
                                background: '#F4F5F7',
                                padding: '5px 11px',
                                height: 32,
                                width: 144,
                                gap: 42
                            }}>
                            <button
                                type="button"
                                aria-label="decrease"
                                onClick={decParticipants}
                                className="text-gray-4"
                                style={{ width: 14, height: 14 }}>
                                <DownIcon />
                            </button>
                            <span className="text-body2-medium">
                                {participants}
                            </span>
                            <button
                                type="button"
                                aria-label="increase"
                                onClick={incParticipants}
                                className="text-gray-4"
                                style={{ width: 14, height: 14 }}>
                                <UpIcon />
                            </button>
                        </div>
                    )}

                    {/* Unlimited */}
                    <button
                        type="button"
                        onClick={() => setUnlimited(u => !u)}
                        className={`rounded-6 text-body2-medium flex h-32 w-full items-center justify-center ${unlimited ? 'bg-primary-200 text-primary-700' : ''}`}
                        style={{
                            background: unlimited ? undefined : '#F4F5F7'
                        }}>
                        제한 없음
                    </button>
                </div>
            </div>
        </div>
    )
}

