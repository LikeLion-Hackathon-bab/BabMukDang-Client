import { useState } from 'react'

interface ChatModalProps {
  isOpen?: boolean
  onClose?: () => void
  mealPlanId?: string
  roomId?: string
}

export function ChatModal({ isOpen = false, onClose }: ChatModalProps) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40">
      <div className="w-full rounded-t-24 bg-white p-20">
        <p className="text-body2-medium text-gray-7">채팅은 MealPlan 상세 화면에서 이용할 수 있습니다.</p>
        <button type="button" onClick={onClose} className="mt-12 rounded-30 bg-gray-8 px-16 py-10 text-white">닫기</button>
      </div>
    </div>
  )
}

export function ChatButton({ onClick, isOpen }: { onClick?: () => void; isOpen?: boolean }) {
  const [open, setOpen] = useState(false)
  const actualOpen = isOpen ?? open
  return (
    <>
      <button type="button" onClick={onClick ?? (() => setOpen(true))}>채팅</button>
      <ChatModal isOpen={actualOpen} onClose={() => setOpen(false)} />
    </>
  )
}
