import {
    BehaviorSubject,
    Observable,
    Subject,
    combineLatest,
    concat,
    merge,
    of
} from 'rxjs'
import {
    catchError,
    debounceTime,
    distinctUntilChanged,
    map,
    shareReplay,
    switchMap
} from 'rxjs/operators'

import {
    errorDomainState,
    idleDomainState,
    idleSearchState,
    loadingDomainState,
    successDomainState
} from './state'
import { FoodSearchProvider, FriendSearchProvider, PlaceSearchProvider } from './providers'
import type {
    DomainSearchState,
    FoodSearchResult,
    FriendSearchResult,
    PlaceSearchResult,
    SearchContext,
    SearchDomain,
    SearchProvider,
    SearchProviderRegistry,
    SearchState
} from './types'

const ALL_SEARCH_DOMAINS: SearchDomain[] = ['food', 'friend', 'place']

interface SearchServiceOptions {
    debounceMs?: number
    initialDomains?: SearchDomain[]
    initialContext?: SearchContext
}

const normalizeQuery = (query: string): string => query.trim()

const uniqueDomains = (domains: SearchDomain[]): SearchDomain[] =>
    ALL_SEARCH_DOMAINS.filter(domain => domains.includes(domain))

const sameDomains = (left: SearchDomain[], right: SearchDomain[]): boolean =>
    uniqueDomains(left).join('|') === uniqueDomains(right).join('|')

const stableContextKey = (context?: SearchContext): string => {
    if (!context) return ''

    return JSON.stringify({
        latitude: context.latitude ?? null,
        longitude: context.longitude ?? null,
        radius: context.radius ?? null,
        sort: context.sort ?? null,
        userId: context.userId ?? null
    })
}

const createDefaultProviders = (): SearchProviderRegistry => ({
    friend: new FriendSearchProvider(),
    place: new PlaceSearchProvider(),
    food: new FoodSearchProvider()
})

export class SearchService {
    private readonly querySubject = new BehaviorSubject<string>('')
    private readonly clearSubject = new Subject<void>()
    private readonly domainsSubject: BehaviorSubject<SearchDomain[]>
    private readonly contextSubject: BehaviorSubject<SearchContext | undefined>

    readonly searchState$: Observable<SearchState>
    readonly hasAnyResult$: Observable<boolean>
    readonly isAnyLoading$: Observable<boolean>
    readonly isAllEmpty$: Observable<boolean>

    constructor(
        private readonly providers: SearchProviderRegistry = createDefaultProviders(),
        options: SearchServiceOptions = {}
    ) {
        const debounceMs = options.debounceMs ?? 250

        this.domainsSubject = new BehaviorSubject<SearchDomain[]>(
            uniqueDomains(options.initialDomains ?? ALL_SEARCH_DOMAINS)
        )
        this.contextSubject = new BehaviorSubject<SearchContext | undefined>(
            options.initialContext
        )

        const query$ = merge(
            this.querySubject.pipe(
                map(normalizeQuery),
                debounceTime(debounceMs)
            ),
            this.clearSubject.pipe(map(() => ''))
        ).pipe(distinctUntilChanged())

        const domains$ = this.domainsSubject.pipe(
            map(uniqueDomains),
            distinctUntilChanged(sameDomains)
        )

        const context$ = this.contextSubject.pipe(
            distinctUntilChanged(
                (left, right) => stableContextKey(left) === stableContextKey(right)
            )
        )

        this.searchState$ = combineLatest([query$, domains$, context$]).pipe(
            switchMap(([query, domains, context]) =>
                this.searchByDomains(query, domains, context)
            ),
            shareReplay({ bufferSize: 1, refCount: true })
        )

        this.hasAnyResult$ = this.searchState$.pipe(
            map(state =>
                [state.food, state.friend, state.place].some(
                    domainState => domainState.results.length > 0
                )
            ),
            distinctUntilChanged(),
            shareReplay({ bufferSize: 1, refCount: true })
        )

        this.isAnyLoading$ = this.searchState$.pipe(
            map(state =>
                [state.food, state.friend, state.place].some(
                    domainState => domainState.status === 'loading'
                )
            ),
            distinctUntilChanged(),
            shareReplay({ bufferSize: 1, refCount: true })
        )

        this.isAllEmpty$ = this.searchState$.pipe(
            map(state => {
                const selected = uniqueDomains(this.domainsSubject.value)

                if (!state.query || selected.length === 0) return false

                return selected.every(
                    domain => state[domain].status === 'empty'
                )
            }),
            distinctUntilChanged(),
            shareReplay({ bufferSize: 1, refCount: true })
        )
    }

    setQuery(query: string): void {
        this.querySubject.next(query)
    }

    setDomains(domains: SearchDomain[]): void {
        this.domainsSubject.next(uniqueDomains(domains))
    }

    setContext(context?: SearchContext): void {
        this.contextSubject.next(context)
    }

    clear(): void {
        this.querySubject.next('')
        this.clearSubject.next()
    }

    clearProviderCaches(): void {
        Object.values(this.providers).forEach(provider => provider.clearCache?.())
    }

    private searchByDomains(
        query: string,
        domains: SearchDomain[],
        context?: SearchContext
    ): Observable<SearchState> {
        if (!query) return of(idleSearchState(query))

        const selectedDomains = new Set(domains)

        return combineLatest({
            friend: this.searchDomain(
                this.providers.friend,
                selectedDomains,
                query,
                context
            ),
            place: this.searchDomain(
                this.providers.place,
                selectedDomains,
                query,
                context
            ),
            food: this.searchDomain(
                this.providers.food,
                selectedDomains,
                query,
                context
            )
        }).pipe(
            map(({ friend, place, food }) => ({
                query,
                friend,
                place,
                food
            }))
        )
    }

    private searchDomain<T>(
        provider: SearchProvider<T>,
        selectedDomains: Set<SearchDomain>,
        query: string,
        context?: SearchContext
    ): Observable<DomainSearchState<T>> {
        if (!selectedDomains.has(provider.domain)) {
            return of(idleDomainState<T>())
        }

        if (query.length < provider.minQueryLength) {
            return of(idleDomainState<T>())
        }

        return concat(
            of(loadingDomainState<T>()),
            provider.search({ query, context }).pipe(
                map(results => successDomainState(results)),
                catchError(error => of(errorDomainState<T>(error)))
            )
        )
    }
}

export const createSearchService = (
    providers?: Partial<SearchProviderRegistry>,
    options?: SearchServiceOptions
): SearchService =>
    new SearchService(
        {
            ...createDefaultProviders(),
            ...providers
        },
        options
    )
