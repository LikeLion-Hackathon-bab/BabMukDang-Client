import { ModalTrigger } from '@/components'
import { GoodBadChip } from '@/components'
import { ArrowForwardIcon, ModifyIcon } from '@/assets/icons'
import { useNavigate } from '@/navigation'

export function ProfileSection({
    profileImgUrl,
    name,
    description,
    likes,
    dislikes,
    allergies,
    isFriend
}: {
    profileImgUrl: string
    name: string
    description: string
    likes: string[]
    dislikes: string[]
    allergies: string[]
    isFriend: boolean
}) {
    const navigate = useNavigate()
    return (
        <section className="-ml-20 flex w-screen flex-col items-center gap-12 bg-white py-20">
            <div className="flex flex-col items-center gap-7">
                <div className="bg-gray-2 relative size-60 rounded-full">
                    <img
                        src={profileImgUrl}
                        alt="프로필 이미지"
                        className="bg-gray-2 size-60 rounded-full"
                    />
                    {!isFriend && (
                        <div
                            className="bg-gray-1 absolute right-0 bottom-0 flex size-20 cursor-pointer items-center justify-center rounded-full"
                            onClick={() => {
                                navigate('/profile-edit')
                            }}>
                            <ModifyIcon className="size-10" />
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-center gap-6">
                    <div className="text-title2-semibold text-black">
                        {name}
                    </div>
                    <div className="text-caption-medium text-gray-6">
                        {description}
                    </div>
                </div>
            </div>
            {/* 선호도 */}
            <ModalTrigger
                forId="profile-notify-modal"
                className="rounded-12 bg-gray-1 flex items-center gap-10 p-12">
                <div className="flex flex-col gap-8">
                    {/* 좋아하는 메뉴 */}
                    <div className="flex items-center gap-8">
                        <span className="text-caption-medium text-primary-500">
                            좋아해요!
                        </span>
                        <div className="flex flex-wrap justify-center gap-4">
                            {likes.map(
                                (menu, index) =>
                                    index < 3 && (
                                        <GoodBadChip
                                            key={index}
                                            text={menu}
                                            isGood={true}
                                        />
                                    )
                            )}
                        </div>
                    </div>
                    {/* 못먹는 메뉴 */}
                    <div className="flex items-center gap-8">
                        <span className="text-caption-medium text-gray-6">
                            못먹어요!
                        </span>
                        <div className="flex flex-wrap justify-center gap-4">
                            {[...dislikes, ...allergies].map(
                                (menu, index) =>
                                    index < 3 && (
                                        <GoodBadChip
                                            key={index}
                                            text={menu}
                                            isGood={false}
                                        />
                                    )
                            )}
                        </div>
                    </div>
                </div>
                <ArrowForwardIcon />
            </ModalTrigger>
        </section>
    )
}
