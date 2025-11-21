// ws/socket-service.ts
import { io, type Socket } from 'socket.io-client'
import {
    fromEvent,
    defer,
    merge,
    switchMap,
    shareReplay,
    distinctUntilChanged,
    map,
    takeUntil,
    EMPTY,
    catchError,
    Observable,
    of,
    take,
    mergeMap,
    tap
} from 'rxjs'
import { fromEventTyped } from './typed-from-event'
import type {
    SocketClientEventMap,
    SocketServerEventMap
} from '@kimdaegyu/babmukdang-shared'
import { Category } from '@kimdaegyu/babmukdang-shared'
import { useState } from 'react'

type MatchType = 'announcement' | 'invitation'

export class SocketService {
    private socket: Socket<SocketClientEventMap | any, SocketServerEventMap>
    // 재접속/연결 종료 스트림
    private readonly _connected$ = defer(() =>
        fromEvent(this.socket, 'connect')
    ).pipe(shareReplay(1))
    private readonly _disconnect$ = defer(() =>
        fromEvent(this.socket, 'disconnect')
    ).pipe(shareReplay(1))

    // stage: 서버가 phase 또는 stage로 줄 수 있으므로 폴백
    readonly stage$ = defer(() =>
        fromEventTyped(this.socket!, 'stage-changed')
    ).pipe(
        map(s => (s as any).phase ?? (s as any).stage),
        distinctUntilChanged(),
        shareReplay(1)
    )

    // 단순 브로드캐스트 수신
    readonly ready$ = defer(() =>
        fromEventTyped(this.socket!, 'ready-state-changed')
    ).pipe(shareReplay(1))
    readonly roomInitialState$ = defer(() =>
        fromEventTyped(this.socket!, 'join-room')
    ).pipe(shareReplay(1))
    readonly waitingState$ = defer(() =>
        fromEventTyped(this.socket!, 'waiting-initial-state')
    ).pipe(shareReplay(1))
    readonly chatMessage$ = defer(() =>
        fromEventTyped(this.socket!, 'chat-message')
    ).pipe(shareReplay(1))
    readonly finalState$ = defer(() =>
        fromEventTyped(this.socket!, 'final-state-response')
    ).pipe(shareReplay(1))
    menuManifest: Category[] = []
    readonly locationAddInitialState$ = defer(() =>
        fromEventTyped(this.socket!, 'location-add-initial-state')
    ).pipe(shareReplay(1))
    readonly locationVoteInitialState$ = defer(() =>
        fromEventTyped(this.socket!, 'location-vote-initial-state')
    ).pipe(shareReplay(1))
    readonly excludeMenuInitialState$ = defer(() =>
        fromEventTyped(this.socket!, 'exclude-menu-initial-state')
    ).pipe(shareReplay(1))
    readonly menuInitialState$ = defer(() =>
        fromEventTyped(this.socket!, 'menu-initial-state')
    ).pipe(shareReplay(1))
    readonly restaurantInitialState$ = defer(() =>
        fromEventTyped(this.socket!, 'restaurant-initial-state')
    ).pipe(shareReplay(1))
    readonly timeInitialState$ = defer(() =>
        fromEventTyped(this.socket!, 'time-initial-state')
    ).pipe(shareReplay(1))
    readonly dateInitialState$ = defer(() =>
        fromEventTyped(this.socket!, 'date-initial-state')
    ).pipe(shareReplay(1))

    /**
     * push-only 리소스 유틸
     * - resetOn$: 기본은 `connect` + `stage$`
     * - 각 사이클에서: (1) 다음 초기 이벤트 1개를 기다려 받고 → (2) 그 뒤 업데이트들 스트림
     * - 다음 reset이 오면 이전 사이클 스트림은 자동 종료(switchMap)되고 새 사이클 시작
     */
    private pushOnlyResource$<
        IE extends keyof SocketClientEventMap,
        UE extends keyof SocketClientEventMap
    >(
        initEvt: IE,
        updateEvt: UE,
        resetOn$ = merge(this._connected$, this.stage$)
    ) {
        const init$ = defer(() => fromEventTyped(this.socket!, initEvt))
        const updates$ = defer(() => fromEventTyped(this.socket!, updateEvt))

        return resetOn$.pipe(
            switchMap(() =>
                // 1) 이번 사이클의 "첫 초기값"을 기다렸다가 내보내고,
                // 2) 그 다음부터는 업데이트를 흘려보내되, 다음 reset 시점까지.
                init$.pipe(
                    take(1),
                    mergeMap(first => {
                        const unwrapped =
                            first &&
                            typeof first === 'object' &&
                            'data' in (first as any)
                                ? (first as any).data
                                : first
                        return merge(
                            of(unwrapped),
                            updates$
                                .pipe
                                // takeUntil(
                                //     this.stage$.pipe(distinctUntilChanged())
                                // )
                                ()
                        )
                    })
                )
            ),
            shareReplay(1)
        )
    }

    // 리소스 스트림: “초기 푸시 + 업데이트”, 절대 클라이언트 pull 없음
    readonly dateSelectionsUpdated$ = defer(() =>
        fromEventTyped(this.socket!, 'date-updated')
    ).pipe(shareReplay(1))
    readonly timeSelectionsUpdated$ = defer(() =>
        fromEventTyped(this.socket!, 'time-updated')
    ).pipe(shareReplay(1))
    readonly locationAddUpdated$ = defer(() =>
        fromEventTyped(this.socket!, 'location-add-updated')
    ).pipe(shareReplay(1))
    readonly locationVoteUpdated$ = defer(() =>
        fromEventTyped(this.socket!, 'location-vote-updated')
    ).pipe(shareReplay(1))
    readonly excludeMenuUpdated$ = defer(() =>
        fromEventTyped(this.socket!, 'exclude-menu-updated')
    ).pipe(shareReplay(1))
    readonly menuUpdated$ = defer(() =>
        fromEventTyped(this.socket!, 'menu-pick-updated')
    ).pipe(shareReplay(1))
    readonly restaurantUpdated$ = defer(() =>
        fromEventTyped(this.socket!, 'restaurant-pick-updated')
    ).pipe(shareReplay(1))

    // 채팅은 단계(stage)와 무관하길 원하면 reset 기준을 connect만으로 제한
    readonly chat$ = this.pushOnlyResource$(
        'join-room',
        'chat-message',
        this._connected$
    )

    // ↑ 만약 서버가 채팅 “초기 로그”를 별도 이벤트로 안 준다면, 위 라인은 제거하고
    //    chatMessage$만 누적(scan)해서 UI에서 쓰면 됩니다.

    constructor(opts: {
        baseUrl: string
        matchType: MatchType
        roomId?: string
        token: string
        debug?: boolean
    }) {
        const { baseUrl, matchType, roomId, token, debug } = opts
        this.socket = io(`${baseUrl}/${matchType}`, {
            query: { roomId: roomId ?? '' },
            auth: { token },
            autoConnect: false,
            transports: ['websocket']
        })
        if (debug) this.socket.onAny((e, ...a) => console.log('[ws]', e, ...a))
        try {
            fetch(`${import.meta.env.VITE_CDN_URL}/categories.json`).then(res =>
                res.json().then(data => {
                    this.menuManifest = data
                })
            )
        } catch (error) {
            console.error('Failed to fetch menu manifest', error)
        }
        this.dateInitialState$.subscribe(data => {
            console.log('dateInitialState', data)
        })
        this.timeInitialState$.subscribe(data => {
            console.log('timeInitialState', data)
        })
        this.locationAddInitialState$.subscribe(data => {
            console.log('locationAddInitialState', data)
        })
        this.locationVoteInitialState$.subscribe(data => {
            console.log('locationVoteInitialState', data)
        })
        this.excludeMenuInitialState$.subscribe(data => {
            console.log('excludeMenuInitialState', data)
        })
        this.menuInitialState$.subscribe(data => {
            console.log('menuInitialState', data)
        })
        this.restaurantInitialState$.subscribe(data => {
            console.log('restaurantInitialState', data)
        })
    }

    connect() {
        if (!this.socket.connected) this.socket.connect()
    }
    disconnect() {
        this.socket.removeAllListeners()
        this.socket.close()
    }

    on<K extends keyof SocketClientEventMap>(
        event: K,
        handler: (data: SocketClientEventMap[K]) => void
    ) {
        this.socket.on(event, handler as any)
        return () => this.socket.off(event, handler as any)
    }

    emit<K extends keyof SocketServerEventMap>(
        event: K,
        data: SocketServerEventMap[K]
    ) {
        // @ts-expect-error socket.io ack 오버로드
        this.socket.emit(event, data)
    }

    get raw() {
        return this.socket
    }
}
