import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSocket } from '@/contexts/SocketContext'

export function TimePage() {
    return (
        <div className="min-h-screen">
            <div className="px-4 py-6">
                <TimePicker />
            </div>
        </div>
    )
}

type TimePickerProps = {
    startHour?: number
    endHour?: number
    slotsPerHour?: 2 | 4
    defaultSelected?: boolean[]
    onChange?: (
        selected: boolean[],
        ranges: Array<{ start: string; end: string }>
    ) => void
}

const TimePicker = ({
    startHour = 8,
    endHour = 24,
    slotsPerHour = 2,
    defaultSelected,
    onChange
}: TimePickerProps) => {
    const service = useSocket()
    const hours = endHour - startHour
    const totalSlots = hours * slotsPerHour
    const [selected, setSelected] = useState<boolean[]>(
        () => defaultSelected ?? Array.from({ length: totalSlots }, () => false)
    )
    const [isDragging, setIsDragging] = useState(false)
    const [dragModeSelect, setDragModeSelect] = useState(true)
    const containerRef = useRef<HTMLDivElement | null>(null)

    // row 기준으로 slot index를 계산
    const clampIndex = useCallback(
        (index: number) => Math.max(0, Math.min(totalSlots - 1, index)),
        [totalSlots]
    )

    // row 기준으로 마우스 위치에서 slot index를 계산
    const getIndexFromClientY = useCallback(
        (clientY: number) => {
            const rect = containerRef.current?.getBoundingClientRect()
            if (!rect) return 0
            const y = clientY - rect.top
            const ratio = Math.max(0, Math.min(1, y / rect.height))
            return clampIndex(Math.floor(ratio * totalSlots))
        },
        [clampIndex, totalSlots]
    )

    const setSlot = useCallback((index: number, value: boolean) => {
        setSelected(prev => {
            const next = [...prev]
            next[index] = value
            return next
        })
    }, [])

    const formatTime = useCallback(
        (slotIndex: number) => {
            const minutesPerSlot = 60 / slotsPerHour
            const totalMinutes = startHour * 60 + slotIndex * minutesPerSlot
            const hh = Math.floor(totalMinutes / 60)
            const mm = totalMinutes % 60
            return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
        },
        [slotsPerHour, startHour]
    )

    const ranges = useMemo(() => {
        const result: Array<{ start: string; end: string }> = []
        let i = 0
        while (i < selected.length) {
            if (!selected[i]) {
                i += 1
                continue
            }
            const startIdx = i
            while (i < selected.length && selected[i]) i += 1
            const endIdx = i - 1
            result.push({
                start: formatTime(startIdx),
                end: formatTime(endIdx + 1)
            })
        }
        return result
    }, [formatTime, selected])

    useEffect(() => {
        onChange?.(selected, ranges)
    }, [onChange, ranges, selected])

    useEffect(() => {
        const handleMouseUp = () => {
            setIsDragging(false)
            // 드래그 종료 시 서버에 전송
            const times = ranges.map(r => `${r.start}–${r.end}`)
            service?.emit('pick-times', { times })
        }
        window.addEventListener('mouseup', handleMouseUp)
        window.addEventListener('touchend', handleMouseUp)
        return () => {
            window.removeEventListener('mouseup', handleMouseUp)
            window.removeEventListener('touchend', handleMouseUp)
        }
    }, [ranges, service])

    // row 기준으로 slot 선택
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        const index = getIndexFromClientY(e.clientY)
        const willSelect = !selected[index]
        setDragModeSelect(willSelect)
        setIsDragging(true)
        setSlot(index, willSelect)
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging) return
        const index = getIndexFromClientY(e.clientY)
        setSlot(index, dragModeSelect)
    }

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        const touch = e.touches[0]
        if (!touch) return
        const index = getIndexFromClientY(touch.clientY)
        const willSelect = !selected[index]
        setDragModeSelect(willSelect)
        setIsDragging(true)
        setSlot(index, willSelect)
    }

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isDragging) return
        const touch = e.touches[0]
        if (!touch) return
        const index = getIndexFromClientY(touch.clientY)
        setSlot(index, dragModeSelect)
    }

    const clearAll = () =>
        setSelected(Array.from({ length: totalSlots }, () => false))

    return (
        <div className="shadow-drop-1 border-gray-2 rounded-xl border bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
                <button
                    onClick={clearAll}
                    className="bg-gray-2 text-gray-7 text-caption-medium hover:bg-gray-3 rounded-full px-3 py-1">
                    전체 해제
                </button>
            </div>

            {/* Track */}
            <div className="flex flex-row space-y-2 select-none">
                {/* Hour markers */}
                <div className="relative mt-1">
                    <div
                        className="text-caption-medium text-gray-6 grid"
                        style={{
                            gridTemplateRows: `repeat(${endHour - startHour}, 1fr)`
                        }}>
                        {Array.from({ length: endHour - startHour + 1 }).map(
                            (_, h) => (
                                <div
                                    key={h}
                                    className={h === 0 ? '' : '-ml-px'}>
                                    <span>
                                        {String(startHour + h).padStart(2, '0')}
                                        :00
                                    </span>
                                </div>
                            )
                        )}
                    </div>
                </div>
                {/* Slots Grid */}
                <div
                    ref={containerRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    className="w-full">
                    <div
                        className="bg-gray-1 border-gray-2 grid h-full gap-0.5 rounded-md border p-1"
                        style={{
                            gridTemplateRows: `repeat(${totalSlots}, 1fr)`
                        }}>
                        {Array.from({ length: totalSlots }).map((_, i) => {
                            const isSelected = selected[i]
                            return (
                                <div
                                    key={i}
                                    className={
                                        `h-24 rounded-sm transition-colors duration-75 ` +
                                        (isSelected
                                            ? 'bg-primary-main'
                                            : 'bg-gray-2 hover:bg-gray-3')
                                    }
                                />
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Selected ranges summary */}
            <div className="mt-4">
                <p className="text-body2-medium text-gray-7">
                    {ranges.length === 0
                        ? '시간대를 드래그하여 선택하세요.'
                        : `선택한 시간대: ${ranges.map(r => `${r.start}–${r.end}`).join(', ')}`}
                </p>
            </div>
        </div>
    )
}
