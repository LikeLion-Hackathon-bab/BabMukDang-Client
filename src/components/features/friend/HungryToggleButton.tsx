import { useState } from 'react'

export function InvitationToggleButton() {
    const [isOn, setIsOn] = useState(false)

    const handleToggle = () => {
        setIsOn(!isOn)
    }

    return (
        <div className="rounded-12 flex w-full items-center justify-between bg-white px-12 py-12">
            <span className="text-body1-semibold text-gray-7">
                지금 밥이 먹고싶어요!
            </span>
            <div
                className={`rounded-20 flex h-32 w-60 cursor-pointer items-center p-3 transition-all duration-200 ${
                    isOn ? 'bg-primary-500' : 'bg-gray-3'
                }`}
                onClick={handleToggle}>
                <div
                    className={`shadow-drop-1 h-25 w-25 rounded-full bg-white transition-transform duration-200 ${
                        isOn ? 'translate-x-28' : 'translate-x-0'
                    }`}>
                    <div className="size-25"></div>
                </div>
            </div>
        </div>
    )
}
