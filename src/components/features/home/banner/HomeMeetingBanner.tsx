import { useCarousel } from '@/hooks/useCarousel'
import timeIcon from '@/assets/icons/timeIcon.svg'
import locationIcon from '@/assets/icons/icon_location2.svg'

const mockBanners = [
    { id: 1, name: '서은우1', place: '과기대정문', time: '30분' },
    { id: 2, name: '서은우2', place: '과기대정문', time: '30분' },
    { id: 3, name: '서은우3', place: '과기대정문', time: '30분' },
    { id: 4, name: '서은우4', place: '과기대정문', time: '30분' },
    { id: 5, name: '서은우5', place: '과기대정문', time: '30분' }
]

export const HomeMeetingBanner = () => {
    const { containerRef, cardRef, translateX, currentIndex } = useCarousel({
        itemCount: mockBanners.length,
        gap: 10
    })

    return (
        <div>
            <h4 className="text-body2-semibold px-[20px] pb-[14px] text-[#5B5B5B]">
                오늘의 공고
            </h4>
            <div
                ref={containerRef}
                className="relative w-full overflow-hidden"
                style={{ touchAction: 'pan-y' }}>
                <div
                    className="flex"
                    style={{
                        gap: '10px',
                        transform: `translateX(${translateX}px)`,
                        transition: 'transform 300ms ease-out'
                    }}>
                    {mockBanners.map((banner, index) => (
                        <div
                            key={banner.id}
                            ref={index === 0 ? cardRef : null}
                            className="flex-shrink-0"
                            style={{
                                width: '80%'
                            }}>
                            <div
                                className={`flex h-[74px] w-full items-center justify-between rounded-[16px] bg-white px-[16px] py-[12px] transition-transform duration-300`}>
                                <div className="flex flex-col gap-[5px]">
                                    <h4 className="text-body1-semibold">
                                        {banner.name}
                                    </h4>
                                    <p className="text-[#6E6E6E]">
                                        <img
                                            src={locationIcon}
                                            alt="location icon"
                                            className="mr-4 inline-block h-[16px] w-[16px]"
                                        />
                                        {banner.place}
                                    </p>
                                </div>
                                <div className="text-body2-medium rounded-[16px] bg-[#FF926D] py-5 pr-13 pl-8 text-white">
                                    <img
                                        src={timeIcon}
                                        alt="time icon"
                                        className="mr-6 inline-block"
                                    />
                                    {banner.time} 후 종료
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
