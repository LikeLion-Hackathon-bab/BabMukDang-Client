import { useAuthStore } from '@/store'
import axios, {
    AxiosError,
    AxiosRequestConfig,
    InternalAxiosRequestConfig
} from 'axios'
import { toAppError } from './errors'
import { clearUserSession } from './queryClient'
import {
    apiContract,
    type ApiResponse,
    type RefreshRequest,
    type RefreshResponse
} from '@kimdaegyu/babmukdang-shared/domain'
import type {
    EndpointContract,
    HttpMethod,
    ResponseOf as ContractResponseOf,
    ApiFailure
} from '@kimdaegyu/babmukdang-shared/domain'
import type { z } from 'zod'
import { API_BASE_URL } from './baseUrl'
import {
    KakaoAuth,
    readNativeRefreshToken,
    usesNativeAuthSession
} from '@/features/auth/kakaoAuthPlugin'

// Axios 클라이언트 인스턴스 생성
const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 10000
})

// 토큰 갱신 상태 관리
let isRefreshing = false
type RefreshSubscriber = {
    resolve: (token: string) => void
    reject: (error: unknown) => void
}
let refreshSubscribers: RefreshSubscriber[] = []

// 대기 중인 요청들에게 새 토큰 전달
const onRefreshed = (token: string) => {
    const subscribers = refreshSubscribers
    refreshSubscribers = []
    subscribers.forEach(subscriber => subscriber.resolve(token))
}

// 토큰 갱신 실패 시 대기 중인 요청들을 모두 reject
const onRefreshFailed = (error: unknown) => {
    const subscribers = refreshSubscribers
    refreshSubscribers = []
    subscribers.forEach(subscriber => subscriber.reject(error))
}

function isApiFailure<T>(body: ApiResponse<T>): body is ApiFailure {
    return (body as { success?: unknown }).success === false
}
export function unwrapBaseResponse<T>(body: ApiResponse<T>): T {
    if (isApiFailure(body)) {
        throw body
    }

    return (body as unknown as { data: T }).data
}

/**
 * access token을 갱신한다. 무한 루프 방지를 위해 인터셉터가 없는 axios를 쓴다.
 * - 웹: httpOnly refresh 쿠키(withCredentials)만 쓴다.
 * - 네이티브: 보안 저장소의 refresh token을 body로 보내고, 회전된 refresh token을 다시 저장한다. (ADR 0007)
 */
export async function requestTokenRefresh(): Promise<RefreshResponse> {
    const isNative = usesNativeAuthSession()
    let body: RefreshRequest = {}

    if (isNative) {
        const refreshToken = await readNativeRefreshToken()
        if (!refreshToken) {
            throw new Error('Native refresh token is missing')
        }
        body = { refreshToken }
    }

    const res = await axios.post<ApiResponse<RefreshResponse>>(
        `${API_BASE_URL}${apiContract.auth.refresh.path}`,
        body,
        { withCredentials: !isNative }
    )
    const tokens = unwrapBaseResponse(res.data)

    if (isNative && tokens.refreshToken) {
        await KakaoAuth.setRefreshToken({ refreshToken: tokens.refreshToken })
    }

    return tokens
}

// Request Interceptor: Authorization 헤더 자동 추가
axiosClient.interceptors.request.use(
    config => {
        const { accessToken } = useAuthStore.getState()

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }

        return config
    },
    error => Promise.reject(error)
)

// Response Interceptor: 401 에러 시 토큰 갱신 처리
axiosClient.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean
        }

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(toAppError(error))
        }

        originalRequest._retry = true

        const { setTokens } = useAuthStore.getState()

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                refreshSubscribers.push({
                    resolve: (token: string) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`
                        resolve(axiosClient(originalRequest))
                    },
                    reject
                })
            })
        }

        isRefreshing = true

        try {
            const tokenData = await requestTokenRefresh()

            setTokens({
                accessToken: tokenData.accessToken
            })

            onRefreshed(tokenData.accessToken)

            originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`

            return axiosClient(originalRequest)
        } catch {
            const appError = toAppError(error)
            clearUserSession()
            onRefreshFailed(appError)
            return Promise.reject(appError)
        } finally {
            isRefreshing = false
        }
    }
)

// ============================================================================
// Shared apiContract 기반 typed client
// ============================================================================

type AnyContractEndpoint = EndpointContract<
    HttpMethod,
    string,
    any,
    any,
    any,
    any
>

type ContractEndpointByMethod<TMethod extends HttpMethod> =
    AnyContractEndpoint & { readonly method: TMethod }

type ContractPathParamsOf<E extends AnyContractEndpoint> =
    E extends EndpointContract<any, any, infer TPathParams, any, any, any>
        ? z.input<TPathParams>
        : never

type ContractQueryOf<E extends AnyContractEndpoint> =
    E extends EndpointContract<any, any, any, infer TQuery, any, any>
        ? z.input<TQuery>
        : never

type ContractBodyOf<E extends AnyContractEndpoint> =
    E extends EndpointContract<any, any, any, any, infer TBody, any>
        ? z.input<TBody>
        : never

type RequiredKeys<T extends object> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]

type ContractRequestConfig<E extends AnyContractEndpoint> = Omit<
    AxiosRequestConfig,
    'params' | 'data'
> & {
    /** `:memberId`처럼 path template에 주입할 값 */
    pathParams?: ContractPathParamsOf<E>
    /** axios params와 동일한 query string 값 */
    query?: ContractQueryOf<E>
    /** POST/PATCH 요청 body */
    body?: ContractBodyOf<E>
}

type ArgsTuple<TArgs extends object> =
    RequiredKeys<TArgs> extends never ? [args?: TArgs] : [args: TArgs]

const resolveContractPath = <E extends AnyContractEndpoint>(
    contract: E,
    pathParams?: ContractPathParamsOf<E>
): string => {
    const params = (pathParams ?? {}) as Record<string, string | number>

    return contract.path.replace(/:([A-Za-z0-9_]+)/g, (_, key: string) => {
        const value = params[key]

        if (value === undefined || value === null) {
            throw new Error(
                `Missing path parameter '${key}' for ${contract.path}`
            )
        }

        return encodeURIComponent(String(value))
    })
}

const toAxiosConfig = (
    config: ContractRequestConfig<AnyContractEndpoint> | undefined,
    query: unknown
): AxiosRequestConfig | undefined => {
    if (config === undefined && query === undefined) return undefined

    const {
        pathParams: _pathParams,
        body: _body,
        query: _query,
        ...axiosConfig
    } = config ?? {}

    if (query === undefined) return axiosConfig

    return {
        ...axiosConfig,
        params: query as Record<string, unknown>
    }
}

const parsePathParams = <E extends AnyContractEndpoint>(
    contract: E,
    pathParams: ContractPathParamsOf<E> | undefined
): ContractPathParamsOf<E> | undefined => {
    if (pathParams === undefined) return undefined
    return contract.pathParams.parse(pathParams) as ContractPathParamsOf<E>
}

const parseQuery = <E extends AnyContractEndpoint>(
    contract: E,
    query: ContractQueryOf<E> | undefined
): ContractQueryOf<E> | undefined => {
    if (query === undefined) return undefined
    return contract.query.parse(query) as ContractQueryOf<E>
}

const parseBody = <E extends AnyContractEndpoint>(
    contract: E,
    body: ContractBodyOf<E> | undefined
): ContractBodyOf<E> | undefined => {
    if (body === undefined) return undefined
    return contract.body.parse(body) as ContractBodyOf<E>
}

// develop 환경일 때만, zod 런타임 검증 실행
const parseResponseForDev = <E extends AnyContractEndpoint>(
    contract: E,
    data: unknown
): ContractResponseOf<E> => {
    if (import.meta.env.VITE_ENV === 'develop') {
        return contract.response.parse(data) as ContractResponseOf<E>
    }

    return data as ContractResponseOf<E>
}

export const contractClient = {
    async get<E extends ContractEndpointByMethod<'GET'>>(
        contract: E,
        ...[config]: ArgsTuple<ContractRequestConfig<E>>
    ): Promise<ContractResponseOf<E>> {
        const pathParams = parsePathParams(contract, config?.pathParams)
        const query = parseQuery(contract, config?.query)
        const res = await axiosClient.get<ApiResponse<ContractResponseOf<E>>>(
            resolveContractPath(contract, pathParams),
            toAxiosConfig(config, query)
        )
        return parseResponseForDev(contract, unwrapBaseResponse(res.data))
    },

    async post<E extends ContractEndpointByMethod<'POST'>>(
        contract: E,
        ...[config]: ArgsTuple<ContractRequestConfig<E>>
    ): Promise<ContractResponseOf<E>> {
        const pathParams = parsePathParams(contract, config?.pathParams)
        const query = parseQuery(contract, config?.query)
        const body = parseBody(contract, config?.body)
        const res = await axiosClient.post<ApiResponse<ContractResponseOf<E>>>(
            resolveContractPath(contract, pathParams),
            body,
            toAxiosConfig(config, query)
        )
        if (res.status === 204) {
            return null as ContractResponseOf<E>
        }
        return parseResponseForDev(contract, unwrapBaseResponse(res.data))
    },

    async patch<E extends ContractEndpointByMethod<'PATCH'>>(
        contract: E,
        ...[config]: ArgsTuple<ContractRequestConfig<E>>
    ): Promise<ContractResponseOf<E>> {
        const pathParams = parsePathParams(contract, config?.pathParams)
        const query = parseQuery(contract, config?.query)
        const body = parseBody(contract, config?.body)
        const res = await axiosClient.patch<ApiResponse<ContractResponseOf<E>>>(
            resolveContractPath(contract, pathParams),
            body,
            toAxiosConfig(config, query)
        )
        if (res.status === 204) {
            return null as ContractResponseOf<E>
        }
        return parseResponseForDev(contract, unwrapBaseResponse(res.data))
    },

    async delete<E extends ContractEndpointByMethod<'DELETE'>>(
        contract: E,
        ...[config]: ArgsTuple<ContractRequestConfig<E>>
    ): Promise<ContractResponseOf<E>> {
        const pathParams = parsePathParams(contract, config?.pathParams)
        const query = parseQuery(contract, config?.query)
        const res = await axiosClient.delete<
            ApiResponse<ContractResponseOf<E>>
        >(
            resolveContractPath(contract, pathParams),
            toAxiosConfig(config, query)
        )
        if (res.status === 204) {
            return null as ContractResponseOf<E>
        }
        return parseResponseForDev(contract, unwrapBaseResponse(res.data))
    }
}
