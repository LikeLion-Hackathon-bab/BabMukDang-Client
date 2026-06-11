import { useAuthStore } from '@/store'
import axios, {
    AxiosError,
    AxiosRequestConfig,
    InternalAxiosRequestConfig
} from 'axios'
import { toAppError } from './errors'
import {
    apiContract,
    type BaseResponse,
    type TokenResponse
} from '@kimdaegyu/babmukdang-shared/domain'
import type { ResponseOf, TypedEndpoint } from './responses'
import type {
    EndpointContract,
    HttpMethod,
    ResponseOf as ContractResponseOf
} from '@kimdaegyu/babmukdang-shared/domain'
import type { z } from 'zod'
import { API_BASE_URL } from './baseUrl'

// Axios 클라이언트 인스턴스 생성
const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 10000
})

// 토큰 갱신 상태 관리
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

// 대기 중인 요청들에게 새 토큰 전달
const onRefreshed = (token: string) => {
    refreshSubscribers.forEach(callback => callback(token))
    refreshSubscribers = []
}

// 토큰 갱신 대기열에 추가
const addRefreshSubscriber = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback)
}

export function unwrapBaseResponse<T>(body: BaseResponse<T>): T {
    if (typeof body.code === 'number' && body.code >= 400) {
        throw body
    }

    return body.data
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

        const { setTokens, logout } = useAuthStore.getState()

        if (isRefreshing) {
            return new Promise(resolve => {
                addRefreshSubscriber((token: string) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    resolve(axiosClient(originalRequest))
                })
            })
        }

        isRefreshing = true

        try {
            const refreshResponse = await axios.post<
                BaseResponse<TokenResponse>
            >(
                `${API_BASE_URL}${apiContract.auth.refresh.path}`,
                {},
                { withCredentials: true }
            )

            const tokenData: TokenResponse = unwrapBaseResponse<TokenResponse>(
                refreshResponse.data
            )

            setTokens({
                accessToken: tokenData.accessToken
            })

            onRefreshed(tokenData.accessToken)

            originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`

            return axiosClient(originalRequest)
        } catch {
            logout()
            refreshSubscribers = []
            return Promise.reject(toAppError(error))
        } finally {
            isRefreshing = false
        }
    }
)

export const client = {
    async get<E extends TypedEndpoint<unknown>>(
        endpoint: E,
        config?: AxiosRequestConfig
    ): Promise<ResponseOf<E>> {
        const res = await axiosClient.get<BaseResponse<ResponseOf<E>>>(
            endpoint,
            config
        )

        return unwrapBaseResponse(res.data)
    },

    async post<E extends TypedEndpoint<unknown>, TBody = unknown>(
        endpoint: E,
        data?: TBody,
        config?: AxiosRequestConfig
    ): Promise<ResponseOf<E>> {
        const res = await axiosClient.post<BaseResponse<ResponseOf<E>>>(
            endpoint,
            data,
            config
        )

        return unwrapBaseResponse(res.data)
    },

    async patch<E extends TypedEndpoint<unknown>, TBody = unknown>(
        endpoint: E,
        data?: TBody,
        config?: AxiosRequestConfig
    ): Promise<ResponseOf<E>> {
        const res = await axiosClient.patch<BaseResponse<ResponseOf<E>>>(
            endpoint,
            data,
            config
        )

        return unwrapBaseResponse(res.data)
    },

    async delete<E extends TypedEndpoint<unknown>>(
        endpoint: E,
        config?: AxiosRequestConfig
    ): Promise<ResponseOf<E>> {
        const res = await axiosClient.delete<BaseResponse<ResponseOf<E>>>(
            endpoint,
            config
        )

        return unwrapBaseResponse(res.data)
    }
}

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

const parseResponseForDev = <E extends AnyContractEndpoint>(
    contract: E,
    data: unknown
): ContractResponseOf<E> => {
    if (import.meta.env.DEV) {
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
        const res = await axiosClient.get<BaseResponse<ContractResponseOf<E>>>(
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
        const res = await axiosClient.post<BaseResponse<ContractResponseOf<E>>>(
            resolveContractPath(contract, pathParams),
            body,
            toAxiosConfig(config, query)
        )
        return parseResponseForDev(contract, unwrapBaseResponse(res.data))
    },

    async patch<E extends ContractEndpointByMethod<'PATCH'>>(
        contract: E,
        ...[config]: ArgsTuple<ContractRequestConfig<E>>
    ): Promise<ContractResponseOf<E>> {
        const pathParams = parsePathParams(contract, config?.pathParams)
        const query = parseQuery(contract, config?.query)
        const body = parseBody(contract, config?.body)
        const res = await axiosClient.patch<
            BaseResponse<ContractResponseOf<E>>
        >(
            resolveContractPath(contract, pathParams),
            body,
            toAxiosConfig(config, query)
        )
        return parseResponseForDev(contract, unwrapBaseResponse(res.data))
    },

    async delete<E extends ContractEndpointByMethod<'DELETE'>>(
        contract: E,
        ...[config]: ArgsTuple<ContractRequestConfig<E>>
    ): Promise<ContractResponseOf<E>> {
        const pathParams = parsePathParams(contract, config?.pathParams)
        const query = parseQuery(contract, config?.query)
        const res = await axiosClient.delete<
            BaseResponse<ContractResponseOf<E>>
        >(
            resolveContractPath(contract, pathParams),
            toAxiosConfig(config, query)
        )
        return parseResponseForDev(contract, unwrapBaseResponse(res.data))
    }
}
