import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import {
    recruitRouteMap,
    invitationRouteMap
} from '@/constants/onboardingRoute'

export const ProgressBar = () => {
    const { pathname } = useLocation()
    const { matchType } = useParams<{
        matchType: 'recruit' | 'invitation'
    }>()
    const [totalProgress, setTotalProgress] = useState(0)
    useEffect(() => {
        if (matchType === 'invitation') {
            const totalProgress =
                invitationRouteMap[
                    pathname.split('/')[2] as keyof typeof invitationRouteMap
                ] / 7
            setTotalProgress(totalProgress)
        }
        if (matchType === 'recruit') {
            const totalProgress =
                recruitRouteMap[
                    pathname.split('/')[2] as keyof typeof recruitRouteMap
                ] / 5
            setTotalProgress(totalProgress)
        }
    }, [pathname])
    return (
        <div className="relative flex flex-row">
            <div className="w-full border-5 border-gray-200"></div>
            <div
                className="border-primary-500 absolute top-0 left-0 rounded-r-full border-5 duration-300"
                style={{
                    width: `${totalProgress * 100}%`
                }}></div>
        </div>
    )
}

