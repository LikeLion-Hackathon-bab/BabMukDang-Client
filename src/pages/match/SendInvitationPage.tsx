import { InvitationCard } from '@/components'
import {
    CardBobGraphic,
    CardGiftboxGraphic,
    CardMailGraphic,
    CardPlateGraphic
} from '@/assets/graphics'
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSendInvitation } from '@/query/invitationQuery'

export function SendInvitationPage() {
    const cardList = [
        {
            graphic: <CardBobGraphic />,
            bgColor: 'bg-gradient-to-b to-[#FF5E27] from-[#FFA484]'
        },
        { graphic: <CardPlateGraphic />, bgColor: 'bg-[#458DFF]' },
        { graphic: <CardGiftboxGraphic />, bgColor: 'bg-[#FFBF48]' },
        { graphic: <CardMailGraphic />, bgColor: 'bg-[#AD50FF]' }
    ]

    const [selectedCard, setSelectedCard] = useState<number>(0)
    const [editText, setEditText] = useState<string>('같이 밥 먹을래?')
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [notice, setNotice] = useState('')
    const {
        mutate: sendInvitation,
        isPending,
        isSuccess
    } = useSendInvitation({
        onSuccess: () =>
            setNotice(
                '초대장을 보냈어요. 친구가 수락하면 알림에서 대기실을 열 수 있어요.'
            ),
        onError: () =>
            setNotice('초대장을 보내지 못했어요. 다시 시도해 주세요.')
    })
    const { userId } = useParams()
    const handleSendInvitation = () => {
        sendInvitation({
            inviteeId: { id: Number(userId) },
            message: editText
        })
    }
    const navigate = useNavigate()
    return (
        <div
            className={`flex h-full w-full flex-col justify-between gap-20 overflow-y-auto py-20`}>
            {/* 카드 리스트 */}
            <div className="flex flex-row items-center justify-between gap-10">
                {cardList.map(
                    (card, index) =>
                        selectedCard !== index && (
                            <CardItem
                                key={index}
                                {...card}
                                onClick={() => setSelectedCard(index)}
                            />
                        )
                )}
            </div>
            {/* 초대장 카드 */}
            <InvitationCard
                Graphic={cardList[selectedCard].graphic}
                bgColor={cardList[selectedCard].bgColor}
                from="초대장"
                showEditButton={true}
                isEditing={isEditing}
                editText={editText}
                setEditText={setEditText}
                setIsEditing={setIsEditing}
            />
            {/* 보내기 버튼 */}
            <div className="flex flex-col gap-8">
                {notice && <p role="status">{notice}</p>}
                <button
                    type="button"
                    disabled={isPending}
                    className="rounded-12 bg-black p-12 text-white"
                    onClick={
                        isSuccess
                            ? () => navigate('/noti')
                            : handleSendInvitation
                    }>
                    {isSuccess ? '알림 확인하기' : '초대장 보내기'}
                </button>
            </div>
        </div>
    )
}

const CardItem = ({
    graphic,
    bgColor,
    onClick
}: {
    graphic: React.ReactNode
    bgColor: string
    onClick: () => void
}) => {
    return (
        <div
            className={`rounded-12 flex h-111 w-111 flex-col items-center justify-center ${bgColor}`}
            onClick={onClick}>
            {graphic}
        </div>
    )
}
