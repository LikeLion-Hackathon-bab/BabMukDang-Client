import { Link } from '@/navigation'
import { ArrowForwardIcon } from '@/assets/icons'
import { ChallengeIcon } from '@/assets/icons'
import { COLORS } from '@/constants/colors'
import React from 'react'

export function ChallengeButton({
    challengeCount
}: {
    challengeCount: number
}) {
    return (
        <Link
            to="/challenge"
            className="rounded-12 flex flex-col gap-20 bg-white px-16 py-18">
            <div className="flex items-center justify-between">
                <span className="text-body1-semibold text-gray-8">챌린지</span>
                <div className="flex items-center gap-4">
                    <span className="text-body2-medium text-gray-4">
                        {challengeCount}/7일
                    </span>
                    <ArrowForwardIcon />
                </div>
            </div>
            <div className="flex w-full items-center justify-between">
                {Array.from({ length: 7 }).map((_, index) => (
                    <React.Fragment key={index}>
                        <ChallengeIcon
                            className="z-1 flex h-20 w-20 items-center"
                            strokecolor={
                                index < challengeCount
                                    ? COLORS.primary200
                                    : COLORS.gray2
                            }
                            bgcolor={
                                index < challengeCount
                                    ? COLORS.primary400
                                    : 'none'
                            }
                            fillcolor={
                                index < challengeCount
                                    ? COLORS.primaryMain
                                    : COLORS.gray3
                            }
                        />
                        <div
                            className={`${
                                index < challengeCount - 1
                                    ? 'border-primary-200'
                                    : 'border-gray-2'
                            } -mr-1 -ml-1 h-0 flex-1 border-2 last:hidden`}></div>
                    </React.Fragment>
                ))}
            </div>
        </Link>
    )
}
