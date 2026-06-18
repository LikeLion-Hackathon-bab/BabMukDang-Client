import { useState } from 'react'

import { FilterList } from '@/components'
import { COUPON_FILTER_LIST } from '@/constants/filters'

export function CouponStoragePage() {
    const [activeFilter, setActiveFilter] = useState<{
        key: string
        label: string
    }>(COUPON_FILTER_LIST[0])

    return (
        <div className="flex w-full flex-col gap-16 pt-16">
            {/* todo: 사용 전, 사용후 필터 추가, 엠티 뷰 추가 */}
            <FilterList
                filterList={COUPON_FILTER_LIST}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                className="self-start"
            />
            <span className="text-caption-regular text-gray-5">
                보관 중인 쿠폰이 없습니다.
            </span>
        </div>
    )
}
