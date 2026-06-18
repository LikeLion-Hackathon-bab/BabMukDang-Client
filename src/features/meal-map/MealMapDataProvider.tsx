import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode
} from 'react'
import { useMealMap, type MealMapMarker, type MealMapQuery, type MealMapResponse } from '@/apis'
import { clusterMealMapMarkers, type MealMapMarkerCluster } from './mealMapCluster'

type MarkerElementRegistry = Map<string, HTMLElement>

type MealMapDataContextValue = {
    mealMap: MealMapResponse | undefined
    layers: MealMapResponse['layers'] | undefined
    allMarkers: MealMapMarker[]
    markerClusters: MealMapMarkerCluster[]
    selectedMarkerId: string | null
    selectedMarker: MealMapMarker | null
    selectMarker: (markerId: string | null) => void
    registerMarkerElement: (markerId: string, element: HTMLElement | null) => void
    isLoading: boolean
    error: Error | null
    refetch: () => void
}

const MealMapDataContext = createContext<MealMapDataContextValue | null>(null)

const flattenMarkers = (layers: MealMapResponse['layers'] | undefined) => {
    if (!layers) return []
    return [
        ...layers.myMealPlanPlaces,
        ...layers.nearbyFriendMealPlans,
        ...layers.friendRecordLocations,
        ...layers.restaurantCandidates
    ]
}

export function MealMapDataProvider({
    children,
    query
}: {
    children: ReactNode
    query: MealMapQuery
}) {
    const { data, isLoading, error, refetch } = useMealMap(query)
    const markerElements = useRef<MarkerElementRegistry>(new Map())
    const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null)
    const allMarkers = useMemo(() => flattenMarkers(data?.layers), [data?.layers])
    const markerClusters = useMemo(() => clusterMealMapMarkers(allMarkers), [allMarkers])
    const selectedMarker = useMemo(
        () => allMarkers.find(marker => marker.markerId === selectedMarkerId) ?? null,
        [allMarkers, selectedMarkerId]
    )

    useEffect(() => {
        if (selectedMarkerId && allMarkers.some(marker => marker.markerId === selectedMarkerId)) {
            return
        }
        setSelectedMarkerId(allMarkers[0]?.markerId ?? null)
    }, [allMarkers, selectedMarkerId])

    useEffect(() => {
        if (!selectedMarkerId) return
        markerElements.current
            .get(selectedMarkerId)
            ?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }, [selectedMarkerId])

    const selectMarker = useCallback((markerId: string | null) => {
        setSelectedMarkerId(markerId)
    }, [])

    const registerMarkerElement = useCallback(
        (markerId: string, element: HTMLElement | null) => {
            if (element) {
                markerElements.current.set(markerId, element)
                return
            }
            markerElements.current.delete(markerId)
        },
        []
    )

    const value = useMemo<MealMapDataContextValue>(
        () => ({
            mealMap: data,
            layers: data?.layers,
            allMarkers,
            markerClusters,
            selectedMarkerId,
            selectedMarker,
            selectMarker,
            registerMarkerElement,
            isLoading,
            error: error instanceof Error ? error : error ? new Error('MEAL_MAP_LOAD_FAILED') : null,
            refetch: () => {
                void refetch()
            }
        }),
        [
            allMarkers,
            markerClusters,
            data,
            error,
            isLoading,
            refetch,
            registerMarkerElement,
            selectMarker,
            selectedMarker,
            selectedMarkerId
        ]
    )

    return (
        <MealMapDataContext.Provider value={value}>
            {children}
        </MealMapDataContext.Provider>
    )
}

export function useMealMapData() {
    const context = useContext(MealMapDataContext)
    if (!context) {
        throw new Error('useMealMapData must be used within MealMapDataProvider')
    }
    return context
}
