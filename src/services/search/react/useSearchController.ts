import { useEffect, useMemo, useState } from 'react'
import { createSearchService } from '../search-service'
import { idleSearchState } from '../state'
import type { SearchContext, SearchDomain, SearchState } from '../types'

export interface UseSearchControllerOptions {
    domains?: SearchDomain[]
    context?: SearchContext
    debounceMs?: number
}

export const useSearchController = ({
    domains = ['food', 'friend', 'place'],
    context,
    debounceMs = 250
}: UseSearchControllerOptions = {}) => {
    const [state, setState] = useState<SearchState>(() => idleSearchState(''))
    const [hasAnyResult, setHasAnyResult] = useState(false)
    const [isAnyLoading, setIsAnyLoading] = useState(false)
    const [isAllEmpty, setIsAllEmpty] = useState(false)

    const service = useMemo(
        () =>
            createSearchService(undefined, {
                initialDomains: domains,
                initialContext: context,
                debounceMs
            }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    )

    useEffect(() => {
        service.setDomains(domains)
    }, [domains, service])

    useEffect(() => {
        service.setContext(context)
    }, [context, service])

    useEffect(() => {
        const subscriptions = [
            service.searchState$.subscribe(setState),
            service.hasAnyResult$.subscribe(setHasAnyResult),
            service.isAnyLoading$.subscribe(setIsAnyLoading),
            service.isAllEmpty$.subscribe(setIsAllEmpty)
        ]

        return () =>
            subscriptions.forEach(subscription => subscription.unsubscribe())
    }, [service])

    return {
        service,
        state,
        hasAnyResult,
        isAnyLoading,
        isAllEmpty,
        setQuery: (query: string) => service.setQuery(query),
        setDomains: (nextDomains: SearchDomain[]) =>
            service.setDomains(nextDomains),
        setContext: (nextContext?: SearchContext) =>
            service.setContext(nextContext),
        clear: () => service.clear()
    }
}
