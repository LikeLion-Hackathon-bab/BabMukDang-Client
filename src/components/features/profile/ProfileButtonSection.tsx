export function ProfileButtonSection({
    friends,
    completedMeetings,
    uncompletedMeetings
}: {
    friends: number
    completedMeetings: number
    uncompletedMeetings: number
    challengeCount: number
}) {
    return (
        <section className="flex flex-col gap-10 pt-10">
            {/* 친구, 밥약 관리 버튼 */}
            <div className="flex w-full justify-between gap-12">
                <button className="rounded-12 flex w-full flex-col items-center gap-8 bg-white py-8">
                    <span className="text-body2-semibold text-gray-8 text-center text-nowrap">
                        친구
                    </span>
                    <span className="text-body2-semibold text-gray-6">
                        {friends}
                    </span>
                </button>
                <button className="rounded-12 flex w-full flex-col items-center gap-8 bg-white py-8">
                    <span className="text-body2-semibold text-gray-8 text-center text-nowrap">
                        완료 밥약
                    </span>
                    <span className="text-body2-semibold text-gray-6">
                        {completedMeetings}
                    </span>
                </button>
                <button className="rounded-12 flex w-full flex-col items-center gap-8 bg-white py-8">
                    <span className="text-body2-semibold text-gray-8 text-center text-nowrap">
                        예정 밥약
                    </span>
                    <span className="text-body2-semibold text-gray-6">
                        {uncompletedMeetings}
                    </span>
                </button>
            </div>

            {/* 챌린지 */}
            {/* <ChallengeButton challengeCount={challengeCount} /> */}

            {/* 쿠폰 보관함 */}
            {/* <Link
                    to="/coupon"
                    className="rounded-12 flex items-center justify-between bg-white px-16 py-18">
                    <span className="text-body1-semibold text-gray-8">
                        쿠폰 보관함
                    </span>
                    <ArrowForwardIcon />
                </Link> */}
        </section>
    )
}
