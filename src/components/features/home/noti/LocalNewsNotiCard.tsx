import { LocalNewsNoti } from '@kimdaegyu/babmukdang-shared'
export function LocalNewsNotiCard({ noti }: { noti: LocalNewsNoti }) {
    return (
        <div className="flex w-full flex-col gap-10 px-20 py-16">
            <div className="flex w-full flex-row items-center justify-between">
                <span className="text-body2-semibold text-gray-7">
                    {noti.title}
                </span>
                <span className="text-caption-medium text-gray-3">
                    {noti.time}
                </span>
            </div>
            <div className="flex flex-row items-center justify-between">
                <div className="flex h-full flex-col justify-between">
                    <span className="text-body1-semibold w-full text-wrap text-black">
                        {noti.message}
                    </span>
                    <span className="text-caption-medium text-gray-5 w-full">
                        {noti.period}
                    </span>
                </div>
                <img
                    src={noti.imageUrl}
                    alt="local news"
                    className="rounded-5 bg-gray-1 h-58 w-58"
                />
            </div>
        </div>
    )
}
