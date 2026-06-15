import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useSocket } from '@/contexts/SocketContext'
import {
    recruitRouteMap,
    invitationRouteMap
} from '@/constants/onboardingRoute'

export const ProgressBar = () => {
    const { pathname } = useLocation()
    const { matchType } = useParams<{
        matchType: 'recruit' | 'invitation'
    }>()
    const { progress } = useSocket()
    const [totalProgress, setTotalProgress] = useState(0)
    useEffect(() => {
        if (progress) {
            const actionable = progress.tasks.filter(task => task.status !== 'locked')
            const completed = actionable.filter(task => ['ready', 'resolved'].includes(task.status)).length
            setTotalProgress(actionable.length > 0 ? completed / actionable.length : 0)
            return
        }
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
    }, [pathname, progress, matchType])
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

