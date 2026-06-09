import { useEffect, useState } from 'react'

import { BarcodeIcon, ChallengeFillIcon } from '@/assets/icons'
import { MockCouponList } from '@/constants/mockData'

import {
    CouponModal,
    FilterList,
    ModalTrigger,
    GoodBadChip
} from '@/components'
import { COUPON_FILTER_LIST } from '@/constants/filters'
import { useHeaderStore } from '@/store'

export function CouponStoragePage() {
    const { setTitle } = useHeaderStore()
    const [activeFilter, setActiveFilter] = useState<{
        key: string
        label: string
    }>(COUPON_FILTER_LIST[0])

    useEffect(() => {
        setTitle('쿠폰 보관함')
    }, [])

    return (
        <div className="flex w-full flex-col gap-16 pt-16">
            {/* todo: 사용 전, 사용후 필터 추가, 엠티 뷰 추가 */}
            <FilterList
                filterList={COUPON_FILTER_LIST}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                className="self-start"
            />
            {MockCouponList.filter(
                coupon =>
                    (coupon.used && activeFilter.key === 'used') ||
                    (!coupon.used && activeFilter.key === 'unused')
            ).map((coupon, index) => (
                <></>
                // TODO: 백엔드 타입 정의 후 수정 필요
                // <CouponCard
                //     key={index}
                //     {...coupon}
                // />
            ))}
        </div>
    )
}

const CouponCard = ({
    isUsed,
    restaurantName,
    discount,
    expirationDate,
    couponType,
    couponImageUrl
}: {
    isUsed: boolean
    restaurantName: string
    discount: number
    expirationDate: string
    couponType: string
    couponImageUrl: string
}) => {
    return (
        <div className="relative w-full">
            {/* 카드 내용 */}
            <div className="rounded-12 flex h-full w-full items-stretch justify-between">
                {/* 왼쪽: 쿠폰 정보 */}
                <div
                    className={`rounded-12 shadow-drop-1 flex h-full w-full items-center justify-between ${
                        isUsed ? 'bg-gray-2' : 'bg-white'
                    } py-12 pr-10 pl-16`}>
                    <div className="flex w-full flex-col justify-between gap-8">
                        <div className="flex flex-col gap-2">
                            {/* 음식점 정보 */}
                            <div className="flex gap-7">
                                <span className="text-body2-semibold text-black">
                                    {restaurantName}
                                </span>
                                <GoodBadChip
                                    text={couponType}
                                    isGood={true}
                                />
                            </div>
                            {/* 할인 정보 */}
                            <span className="text-caption-medium text-gray-5">
                                {discount}원 할인
                            </span>
                        </div>
                        <span className="text-caption-10 text-gray-4">
                            사용기한: {expirationDate}
                        </span>
                    </div>

                    {/* 음식점 이미지 */}
                    <img
                        className="rounded-5 size-62 flex-none"
                        src={couponImageUrl}
                    />
                </div>

                {/* 오른쪽: 사용여부 */}
                <ModalTrigger
                    disabled={isUsed}
                    forId="coupon-notify-modal"
                    className={`rounded-12 shadow-drop-1 ${
                        isUsed ? 'bg-gray-2' : 'bg-white'
                    } flex-none flex-col items-center justify-center overflow-hidden pt-21 pr-22 pb-20 pl-23`}>
                    <div className="flex flex-col items-center justify-between gap-8">
                        {isUsed ? <ChallengeFillIcon /> : <BarcodeIcon />}
                        <span className="text-caption-medium text-gray-6">
                            {isUsed ? '사용 완료' : '사용하기'}
                        </span>
                    </div>
                </ModalTrigger>
            </div>
            <CouponModal
                id="coupon-notify-modal"
                onClose={() => {}}
                onAccept={() => {}}
                restaurantName={restaurantName}
                condition={`${discount}원 할인`}
                serviceItem={restaurantName}
                canUseAgain={false}
                expirationDate={expirationDate}
                couponType={couponType}
                couponImageUrl={couponImageUrl}
            />
        </div>
    )
}
