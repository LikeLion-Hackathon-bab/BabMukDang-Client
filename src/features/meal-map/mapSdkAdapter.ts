import type { MealMapMarkerCluster } from './mealMapCluster'

type RenderInput = {
    container: HTMLElement
    center: { lat: number; lng: number }
    clusters: MealMapMarkerCluster[]
    selectedMarkerId: string | null
    onSelectMarker: (markerId: string) => void
}

export type MealMapSdkAdapter = {
    render(input: RenderInput): () => void
}

const MAP_CONTAINER_CLASS =
    'h-[320px] min-h-[320px] w-full overflow-hidden rounded-24 border border-gray-2 bg-gray-1'

type KakaoMaps = {
    LatLng: new (lat: number, lng: number) => unknown
    Map: new (
        container: HTMLElement,
        options: { center: unknown; level: number }
    ) => unknown
    Marker: new (options: {
        map: unknown
        position: unknown
        title?: string
    }) => unknown
    CustomOverlay: new (options: {
        map: unknown
        position: unknown
        content: HTMLElement
        yAnchor?: number
    }) => { setMap: (map: unknown | null) => void }
    event: {
        addListener: (
            target: unknown,
            type: string,
            handler: () => void
        ) => void
    }
}

const createClusterButton = ({
    cluster,
    selectedMarkerId,
    onSelectMarker
}: {
    cluster: MealMapMarkerCluster
    selectedMarkerId: string | null
    onSelectMarker: (markerId: string) => void
}) => {
    const marker = cluster.primaryMarker
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = cluster.hasOverlap
        ? `${cluster.count}`
        : marker.title.slice(0, 10)
    button.setAttribute(
        'aria-label',
        cluster.hasOverlap ? `${cluster.count}개 marker 묶음` : marker.title
    )
    button.className = [
        'rounded-20',
        'border',
        'px-10',
        'py-6',
        'text-caption-medium',
        'shadow-sm',
        selectedMarkerId &&
        cluster.markers.some(item => item.markerId === selectedMarkerId)
            ? 'border-primary-main bg-primary-100 text-primary-main'
            : 'border-gray-3 bg-white text-gray-7'
    ].join(' ')
    button.onclick = event => {
        event.preventDefault()
        onSelectMarker(marker.markerId)
    }
    return button
}

export const cssMapSdkAdapter: MealMapSdkAdapter = {
    render({ container, center, clusters, selectedMarkerId, onSelectMarker }) {
        container.innerHTML = ''
        container.className = `${MAP_CONTAINER_CLASS} relative p-14`
        const label = document.createElement('div')
        label.className =
            'absolute right-12 top-12 rounded-20 bg-white/90 px-10 py-5 text-caption-medium text-gray-6 shadow-sm'
        label.textContent = `중심 ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`
        container.appendChild(label)

        const grid = document.createElement('div')
        grid.className = 'grid grid-cols-2 gap-8 pt-38'
        for (const cluster of clusters) {
            const marker = cluster.primaryMarker
            const selected =
                selectedMarkerId &&
                cluster.markers.some(item => item.markerId === selectedMarkerId)
            const button = document.createElement('button')
            button.type = 'button'
            button.className = [
                'rounded-18 border p-10 text-left transition',
                selected
                    ? 'border-primary-main bg-primary-100 shadow-sm'
                    : 'border-gray-2 bg-white'
            ].join(' ')
            button.innerHTML = `
                <span class="text-caption-medium text-primary-main">${cluster.hasOverlap ? `${cluster.count}개 묶음` : marker.layer}</span>
                <p class="text-caption-medium text-gray-8 line-clamp-2">${marker.title}</p>
                <p class="text-caption-regular text-gray-5">${cluster.lat.toFixed(4)}, ${cluster.lng.toFixed(4)}</p>
            `
            button.onclick = () => onSelectMarker(marker.markerId)
            grid.appendChild(button)
        }
        container.appendChild(grid)

        return () => {
            container.innerHTML = ''
        }
    }
}

export const kakaoMapSdkAdapter: MealMapSdkAdapter = {
    render({ container, center, clusters, selectedMarkerId, onSelectMarker }) {
        const maps = window.kakao?.maps as KakaoMaps | undefined
        if (!maps) {
            return cssMapSdkAdapter.render({
                container,
                center,
                clusters,
                selectedMarkerId,
                onSelectMarker
            })
        }

        container.innerHTML = ''
        container.className = MAP_CONTAINER_CLASS
        const map = new maps.Map(container, {
            center: new maps.LatLng(center.lat, center.lng),
            level: 4
        })
        const overlays: Array<{ setMap: (map: unknown | null) => void }> = []

        for (const cluster of clusters) {
            const position = new maps.LatLng(cluster.lat, cluster.lng)
            const marker = new maps.Marker({
                map,
                position,
                title: cluster.primaryMarker.title
            })
            maps.event.addListener(marker, 'click', () =>
                onSelectMarker(cluster.primaryMarker.markerId)
            )
            const overlay = new maps.CustomOverlay({
                map,
                position,
                content: createClusterButton({
                    cluster,
                    selectedMarkerId,
                    onSelectMarker
                }),
                yAnchor: 2.2
            })
            overlays.push(overlay)
        }

        return () => {
            overlays.forEach(overlay => overlay.setMap(null))
            container.innerHTML = ''
        }
    }
}

export const createMealMapSdkAdapter = (): MealMapSdkAdapter =>
    kakaoMapSdkAdapter
