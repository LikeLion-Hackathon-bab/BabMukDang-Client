import { createContext, useContext } from 'react'
import type { NavigationActivityParams, NavigationLocation } from './routes'

export type NavigationActivityContextValue = {
    activityId: string
    activityName: string
    isTop: boolean
    params: NavigationActivityParams
    location: NavigationLocation
}

export const NavigationActivityContext =
    createContext<NavigationActivityContextValue | null>(null)

export const useNavigationActivityContext = () =>
    useContext(NavigationActivityContext)
