import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiContract } from '@kimdaegyu/babmukdang-shared/domain'
import { contractClient } from './client'
import { domainId } from '@/domain/factories'
import { queryKeys } from './keys'
import { mapMyMealPlanListItem } from './mappers/mealPlan.mapper'
import type {
    CompleteMealPlanDecisionStageRequest,
    ConfirmMealPlanDecisionSnapshotRequest,
    CreateMealPlanChangeRequest,
    CreateMealPlanInviteRequest,
    CreateMealPlanJoinRequest,
    CreateMealPlanRequest,
    CreateMealPlanShareLinkRequest,
    ExposeMealPlanToNearbyFriendsRequest,
    ExposeMealPlanToNearbyFriendsResponse,
    HomeMealPlanDashboardResponse,
    MealMapResponse,
    MealMapQuery,
    JoinMealPlanGuestRequest,
    MealPlanCardResponse,
    MealPlanChatMessageListResponse,
    MealPlanDecisionProgress,
    MealPlanDecisionTaskKey,
    MealPlanInviteListResponse,
    MealPlanGuestSessionResponse,
    MealPlanResponse,
    MealPlanShareLinkSummary,
    MealPlanSharePreviewResponse,
    MutationOptions,
    MyMealPlanListResponse,
    NearbyFriendExposureEligibility,
    NearbyFriendMealPlanSummary,
    NoContent,
    ReopenMealPlanDecisionTaskRequest,
    SendMealPlanInviteResponse,
    UpdateMealPlanContextRequest
} from './types'

const invalidateMealPlanQueries = (
    queryClient: ReturnType<typeof useQueryClient>,
    mealPlanId?: string
) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    queryClient.invalidateQueries({
        queryKey: queryKeys.mealPlans.homeDashboard
    })
    queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.map })
    if (mealPlanId) {
        queryClient.invalidateQueries({
            queryKey: queryKeys.mealPlans.detail(mealPlanId)
        })
        queryClient.invalidateQueries({
            queryKey: queryKeys.mealPlans.chatMessages(mealPlanId)
        })
    }
}

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '')

const getFrontendOrigin = (): string => {
    const configured = import.meta.env.VITE_FRONTEND_DOMAIN
    if (typeof configured === 'string' && configured.trim().length > 0) {
        return trimTrailingSlash(configured.trim())
    }

    if (typeof window !== 'undefined' && window.location.origin) {
        return trimTrailingSlash(window.location.origin)
    }

    return ''
}

const getGuestJoinUrl = (token: string, fallbackUrl: string): string => {
    const frontendOrigin = getFrontendOrigin()
    if (!frontendOrigin) return fallbackUrl

    return `${frontendOrigin}/meal-plan-links/${token}/join`
}

const mapShareLinkSummary = (
    summary: MealPlanShareLinkSummary
): MealPlanShareLinkSummary => ({
    ...summary,
    url: getGuestJoinUrl(summary.token, summary.url)
})

export const mealPlanApi = {
    create: async (
        body: CreateMealPlanRequest
    ): Promise<{ mealPlanId: string }> => {
        return contractClient.post(apiContract.mealPlans.create, { body })
    },

    getMine: async (): Promise<MyMealPlanListResponse> => {
        return contractClient.get(apiContract.mealPlans.my)
    },

    getHomeDashboard: async (): Promise<HomeMealPlanDashboardResponse> => {
        return contractClient.get(apiContract.mealPlans.homeDashboard)
    },

    getMap: async (
        query: MealMapQuery = { friendRecordDays: 7 }
    ): Promise<MealMapResponse> => {
        return contractClient.get(apiContract.mealPlans.map, { query })
    },

    getMyCards: async (): Promise<Record<string, MealPlanCardResponse[]>> => {
        const data = await mealPlanApi.getMine()
        return {
            deciding: data.deciding.map(mapMyMealPlanListItem),
            upcoming: data.upcoming.map(mapMyMealPlanListItem),
            recordNeeded: data.recordNeeded.map(mapMyMealPlanListItem),
            past: data.past.map(mapMyMealPlanListItem)
        }
    },

    getDetail: async (mealPlanId: string): Promise<MealPlanResponse> => {
        return contractClient.get(apiContract.mealPlans.detail, {
            pathParams: { mealPlanId: domainId.mealPlan(mealPlanId) }
        })
    },

    getChatMessages: async (
        mealPlanId: string
    ): Promise<MealPlanChatMessageListResponse> => {
        return contractClient.get(apiContract.mealPlans.chatMessages, {
            pathParams: { mealPlanId: domainId.mealPlan(mealPlanId) }
        })
    },

    getGuestChatMessages: async ({
        token,
        sessionToken
    }: {
        token: string
        sessionToken: string
    }): Promise<MealPlanChatMessageListResponse> => {
        return contractClient.get(apiContract.mealPlans.guestChatMessages, {
            pathParams: { token: domainId.mealPlanShareToken(token) },
            query: { sessionToken }
        })
    },

    updateContext: async ({
        mealPlanId,
        body
    }: {
        mealPlanId: string
        body: UpdateMealPlanContextRequest
    }): Promise<MealPlanResponse> => {
        return contractClient.patch(apiContract.mealPlans.updateContext, {
            pathParams: { mealPlanId: domainId.mealPlan(mealPlanId) },
            body
        })
    },

    complete: async (mealPlanId: string): Promise<MealPlanResponse> => {
        return contractClient.post(apiContract.mealPlans.complete, {
            pathParams: { mealPlanId: domainId.mealPlan(mealPlanId) }
        })
    },

    cancel: async (mealPlanId: string): Promise<MealPlanResponse> => {
        return contractClient.post(apiContract.mealPlans.cancel, {
            pathParams: { mealPlanId: domainId.mealPlan(mealPlanId) }
        })
    },

    removeParticipant: async ({
        mealPlanId,
        participantId
    }: {
        mealPlanId: string
        participantId: string
    }): Promise<MealPlanResponse> => {
        return contractClient.post(apiContract.mealPlans.removeParticipant, {
            pathParams: {
                mealPlanId: domainId.mealPlan(mealPlanId),
                participantId: participantId as never
            }
        })
    },

    recorded: async (mealPlanId: string): Promise<MealPlanResponse> => {
        return contractClient.post(apiContract.mealPlans.recorded, {
            pathParams: { mealPlanId: domainId.mealPlan(mealPlanId) }
        })
    },

    invite: async ({
        mealPlanId,
        body
    }: {
        mealPlanId: string
        body: CreateMealPlanInviteRequest
    }): Promise<SendMealPlanInviteResponse> => {
        return contractClient.post(apiContract.mealPlans.invite, {
            pathParams: { mealPlanId: domainId.mealPlan(mealPlanId) },
            body
        })
    },

    getReceivedInvites: async (): Promise<MealPlanInviteListResponse> => {
        return contractClient.get(apiContract.mealPlans.receivedInvites)
    },

    getSentInvites: async (): Promise<MealPlanInviteListResponse> => {
        return contractClient.get(apiContract.mealPlans.sentInvites)
    },

    acceptInvite: async (inviteId: string): Promise<MealPlanResponse> => {
        return contractClient.post(apiContract.mealPlans.acceptInvite, {
            pathParams: { inviteId: domainId.mealPlanInvite(inviteId) }
        })
    },

    declineInvite: async (inviteId: string): Promise<NoContent> => {
        return contractClient.post(apiContract.mealPlans.declineInvite, {
            pathParams: { inviteId: domainId.mealPlanInvite(inviteId) }
        })
    },

    createShareLink: async ({
        mealPlanId,
        body
    }: {
        mealPlanId: string
        body: CreateMealPlanShareLinkRequest
    }): Promise<MealPlanShareLinkSummary> => {
        const summary = await contractClient.post(
            apiContract.mealPlans.createShareLink,
            {
            pathParams: { mealPlanId: domainId.mealPlan(mealPlanId) },
            body
            }
        )
        return mapShareLinkSummary(summary)
    },

    getSharePreview: async (
        token: string
    ): Promise<MealPlanSharePreviewResponse> => {
        return contractClient.get(apiContract.mealPlans.sharePreview, {
            pathParams: { token: domainId.mealPlanShareToken(token) }
        })
    },

    joinGuest: async ({
        token,
        body
    }: {
        token: string
        body: JoinMealPlanGuestRequest
    }) => {
        return contractClient.post(apiContract.mealPlans.joinGuest, {
            pathParams: { token: domainId.mealPlanShareToken(token) },
            body
        })
    },

    getGuestSession: async ({
        token,
        sessionToken
    }: {
        token: string
        sessionToken: string
    }): Promise<MealPlanGuestSessionResponse> => {
        return contractClient.get(apiContract.mealPlans.guestSession, {
            pathParams: { token: domainId.mealPlanShareToken(token) },
            query: { sessionToken }
        })
    },

    exposeNearbyFriends: async ({
        mealPlanId,
        body
    }: {
        mealPlanId: string
        body: ExposeMealPlanToNearbyFriendsRequest
    }): Promise<ExposeMealPlanToNearbyFriendsResponse> => {
        return contractClient.post(apiContract.mealPlans.exposeNearbyFriends, {
            pathParams: { mealPlanId: domainId.mealPlan(mealPlanId) },
            body
        })
    },

    closeNearbyFriends: async (mealPlanId: string): Promise<NoContent> => {
        return contractClient.delete(apiContract.mealPlans.closeNearbyFriends, {
            pathParams: { mealPlanId: domainId.mealPlan(mealPlanId) }
        })
    },

    getNearbyFriendExposureEligibility:
        async (): Promise<NearbyFriendExposureEligibility> => {
            return contractClient.get(
                apiContract.mealPlans.nearbyFriendExposureEligibility
            )
        },

    getNearbyFriends: async (): Promise<NearbyFriendMealPlanSummary[]> => {
        return contractClient.get(apiContract.mealPlans.nearbyFriends)
    },

    requestJoin: async ({
        mealPlanId,
        body
    }: {
        mealPlanId: string
        body: CreateMealPlanJoinRequest
    }) => {
        return contractClient.post(apiContract.mealPlans.requestJoin, {
            pathParams: { mealPlanId: domainId.mealPlan(mealPlanId) },
            body
        })
    },

    acceptJoinRequest: async (requestId: string): Promise<MealPlanResponse> => {
        return contractClient.post(apiContract.mealPlans.acceptJoinRequest, {
            pathParams: {
                requestId: domainId.mealPlanJoinRequest(requestId)
            }
        })
    },

    rejectJoinRequest: async (requestId: string): Promise<NoContent> => {
        return contractClient.post(apiContract.mealPlans.rejectJoinRequest, {
            pathParams: {
                requestId: domainId.mealPlanJoinRequest(requestId)
            }
        })
    },

    completeStage: async ({
        mealPlanId,
        stageId,
        body
    }: {
        mealPlanId: string
        stageId: string
        body: CompleteMealPlanDecisionStageRequest
    }): Promise<MealPlanResponse> => {
        return contractClient.post(apiContract.mealPlans.completeStage, {
            pathParams: {
                mealPlanId: domainId.mealPlan(mealPlanId),
                stageId
            },
            body
        })
    },

    getDecisionProgress: async (
        mealPlanId: string
    ): Promise<MealPlanDecisionProgress> => {
        return contractClient.get(apiContract.mealPlans.decisionProgress, {
            pathParams: { mealPlanId: domainId.mealPlan(mealPlanId) }
        })
    },

    reopenDecisionTask: async ({
        mealPlanId,
        taskKey,
        body
    }: {
        mealPlanId: string
        taskKey: MealPlanDecisionTaskKey
        body: ReopenMealPlanDecisionTaskRequest
    }): Promise<MealPlanResponse> => {
        return contractClient.post(apiContract.mealPlans.reopenDecisionTask, {
            pathParams: { mealPlanId: domainId.mealPlan(mealPlanId), taskKey },
            body
        })
    },

    confirmDecisionSnapshot: async ({
        mealPlanId,
        snapshotId,
        body
    }: {
        mealPlanId: string
        snapshotId: string
        body: ConfirmMealPlanDecisionSnapshotRequest
    }): Promise<MealPlanResponse> => {
        return contractClient.post(
            apiContract.mealPlans.confirmDecisionSnapshot,
            {
                pathParams: {
                    mealPlanId: domainId.mealPlan(mealPlanId),
                    snapshotId
                },
                body
            }
        )
    },

    ready: async (mealPlanId: string): Promise<MealPlanResponse> => {
        return contractClient.post(apiContract.mealPlans.ready, {
            pathParams: { mealPlanId: domainId.mealPlan(mealPlanId) }
        })
    },

    unready: async (mealPlanId: string): Promise<MealPlanResponse> => {
        return contractClient.post(apiContract.mealPlans.unready, {
            pathParams: { mealPlanId: domainId.mealPlan(mealPlanId) }
        })
    },

    createChangeRequest: async ({
        mealPlanId,
        body
    }: {
        mealPlanId: string
        body: CreateMealPlanChangeRequest
    }) => {
        return contractClient.post(apiContract.mealPlans.createChangeRequest, {
            pathParams: { mealPlanId: domainId.mealPlan(mealPlanId) },
            body
        })
    },

    acceptChangeRequest: async ({
        mealPlanId,
        requestId
    }: {
        mealPlanId: string
        requestId: string
    }): Promise<MealPlanResponse> => {
        return contractClient.post(apiContract.mealPlans.acceptChangeRequest, {
            pathParams: {
                mealPlanId: domainId.mealPlan(mealPlanId),
                requestId: domainId.mealPlanChangeRequest(requestId)
            }
        })
    },

    confirm: async (mealPlanId: string): Promise<MealPlanResponse> => {
        return contractClient.post(apiContract.mealPlans.confirm, {
            pathParams: { mealPlanId: domainId.mealPlan(mealPlanId) }
        })
    }
}

export const useMyMealPlans = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: queryKeys.mealPlans.my,
        queryFn: mealPlanApi.getMine
    })
    return { data, isLoading, error, refetch }
}

export const useMyMealPlanCards = () => {
    return useQuery({
        queryKey: [...queryKeys.mealPlans.my, 'cards'] as const,
        queryFn: mealPlanApi.getMyCards
    })
}

export const useMealPlanHomeDashboard = () =>
    useQuery({
        queryKey: queryKeys.mealPlans.homeDashboard,
        queryFn: mealPlanApi.getHomeDashboard
    })

export const useMealMap = (query: MealMapQuery = { friendRecordDays: 7 }) =>
    useQuery({
        queryKey: [...queryKeys.mealPlans.map, query] as const,
        queryFn: () => mealPlanApi.getMap(query)
    })

type MealPlanQueryOptions = {
    enabled?: boolean
    staleTime?: number
    refetchOnMount?: boolean
}

export const useMealPlanDetail = (
    mealPlanId: string,
    options?: MealPlanQueryOptions
) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: queryKeys.mealPlans.detail(mealPlanId),
        queryFn: () => mealPlanApi.getDetail(mealPlanId),
        enabled: (options?.enabled ?? true) && mealPlanId.length > 0,
        staleTime: options?.staleTime,
        refetchOnMount: options?.refetchOnMount
    })
    return { data, isLoading, error, refetch }
}

export const useMealPlanChatMessages = (
    mealPlanId: string,
    options?: { enabled?: boolean }
) =>
    useQuery({
        queryKey: queryKeys.mealPlans.chatMessages(mealPlanId),
        queryFn: () => mealPlanApi.getChatMessages(mealPlanId),
        enabled: (options?.enabled ?? true) && mealPlanId.length > 0
    })

export const useMealPlanGuestChatMessages = (
    token: string,
    sessionToken: string | null,
    options?: { enabled?: boolean }
) =>
    useQuery({
        queryKey: queryKeys.mealPlans.guestChatMessages(token, sessionToken),
        queryFn: () =>
            mealPlanApi.getGuestChatMessages({
                token,
                sessionToken: sessionToken ?? ''
            }),
        enabled:
            (options?.enabled ?? true) &&
            token.length > 0 &&
            Boolean(sessionToken)
    })

export const useReceivedMealPlanInvites = () =>
    useQuery({
        queryKey: queryKeys.mealPlans.receivedInvites,
        queryFn: mealPlanApi.getReceivedInvites
    })

export const useSentMealPlanInvites = () =>
    useQuery({
        queryKey: queryKeys.mealPlans.sentInvites,
        queryFn: mealPlanApi.getSentInvites
    })

export const useNearbyFriendExposureEligibility = (options?: {
    enabled?: boolean
}) =>
    useQuery({
        queryKey: queryKeys.mealPlans.nearbyFriendExposureEligibility,
        queryFn: mealPlanApi.getNearbyFriendExposureEligibility,
        enabled: options?.enabled ?? true
    })

export const useNearbyFriendMealPlans = () =>
    useQuery({
        queryKey: queryKeys.mealPlans.nearbyFriends,
        queryFn: mealPlanApi.getNearbyFriends
    })

export const useMealPlanSharePreview = (
    token: string,
    options?: { enabled?: boolean }
) =>
    useQuery({
        queryKey: queryKeys.mealPlans.sharePreview(token),
        queryFn: () => mealPlanApi.getSharePreview(token),
        enabled: (options?.enabled ?? true) && token.length > 0
    })

export const useMealPlanGuestSession = (
    token: string,
    sessionToken: string | null,
    options?: MealPlanQueryOptions
) =>
    useQuery({
        queryKey: queryKeys.mealPlans.guestSession(token, sessionToken),
        queryFn: () =>
            mealPlanApi.getGuestSession({
                token,
                sessionToken: sessionToken ?? ''
            }),
        enabled:
            (options?.enabled ?? true) &&
            token.length > 0 &&
            Boolean(sessionToken),
        staleTime: options?.staleTime,
        refetchOnMount: options?.refetchOnMount
    })

export const useCreateMealPlan = (
    options: MutationOptions<{ mealPlanId: string }> = {}
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: mealPlanApi.create,
        onSuccess: data => {
            invalidateMealPlanQueries(queryClient, data.mealPlanId)
            options.onSuccess?.(data)
        },
        onError: options.onError,
        onSettled: options.onSettled
    })
}

const useMealPlanMutation = <TVariables, TData>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    options: MutationOptions<TData> = {},
    resolveMealPlanId?: (
        variables: TVariables,
        data: TData
    ) => string | undefined
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn,
        onSuccess: (data, variables) => {
            invalidateMealPlanQueries(
                queryClient,
                resolveMealPlanId?.(variables, data)
            )
            options.onSuccess?.(data)
        },
        onError: options.onError,
        onSettled: options.onSettled
    })
}

export const useUpdateMealPlanContext = (
    options: MutationOptions<MealPlanResponse> = {}
) =>
    useMealPlanMutation(
        mealPlanApi.updateContext,
        options,
        variables => variables.mealPlanId
    )

export const useCompleteMealPlan = (
    options: MutationOptions<MealPlanResponse> = {}
) =>
    useMealPlanMutation(mealPlanApi.complete, options, mealPlanId => mealPlanId)

export const useCancelMealPlan = (
    options: MutationOptions<MealPlanResponse> = {}
) => useMealPlanMutation(mealPlanApi.cancel, options, mealPlanId => mealPlanId)

export const useRecordMealPlan = (
    options: MutationOptions<MealPlanResponse> = {}
) =>
    useMealPlanMutation(mealPlanApi.recorded, options, mealPlanId => mealPlanId)

export const useRemoveMealPlanParticipant = (
    options: MutationOptions<MealPlanResponse> = {}
) =>
    useMealPlanMutation(
        mealPlanApi.removeParticipant,
        options,
        variables => variables.mealPlanId
    )

export const useSendMealPlanInvite = (
    options: MutationOptions<SendMealPlanInviteResponse> = {}
) =>
    useMealPlanMutation(
        mealPlanApi.invite,
        options,
        variables => variables.mealPlanId
    )

export const useAcceptMealPlanInvite = (
    options: MutationOptions<MealPlanResponse> = {}
) =>
    useMealPlanMutation(
        mealPlanApi.acceptInvite,
        options,
        (_inviteId, data) => data.mealPlanId
    )

export const useDeclineMealPlanInvite = (
    options: MutationOptions<NoContent> = {}
) => useMealPlanMutation(mealPlanApi.declineInvite, options)

export const useCreateMealPlanShareLink = (
    options: MutationOptions<MealPlanShareLinkSummary> = {}
) =>
    useMealPlanMutation(
        mealPlanApi.createShareLink,
        options,
        variables => variables.mealPlanId
    )

export const useJoinMealPlanGuest = (
    options: MutationOptions<
        Awaited<ReturnType<typeof mealPlanApi.joinGuest>>
    > = {}
) =>
    useMealPlanMutation(
        mealPlanApi.joinGuest,
        options,
        (_variables, data) => data.mealPlanId
    )

export const useExposeMealPlanToNearbyFriends = (
    options: MutationOptions<ExposeMealPlanToNearbyFriendsResponse> = {}
) =>
    useMealPlanMutation(
        mealPlanApi.exposeNearbyFriends,
        options,
        variables => variables.mealPlanId
    )

export const useCloseMealPlanNearbyFriends = (
    options: MutationOptions<NoContent> = {}
) =>
    useMealPlanMutation(
        mealPlanApi.closeNearbyFriends,
        options,
        mealPlanId => mealPlanId
    )

export const useRequestJoinMealPlan = (
    options: MutationOptions<
        Awaited<ReturnType<typeof mealPlanApi.requestJoin>>
    > = {}
) =>
    useMealPlanMutation(
        mealPlanApi.requestJoin,
        options,
        variables => variables.mealPlanId
    )

export const useAcceptMealPlanJoinRequest = (
    options: MutationOptions<MealPlanResponse> = {}
) =>
    useMealPlanMutation(
        mealPlanApi.acceptJoinRequest,
        options,
        (_requestId, data) => data.mealPlanId
    )

const removePendingJoinRequestFromCache = <TData>(
    data: TData,
    requestId: string
): TData => {
    if (!data || typeof data !== 'object') return data
    const maybeMealPlan = data as {
        pendingJoinRequests?: Array<{ joinRequestId: string }>
    }
    if (!Array.isArray(maybeMealPlan.pendingJoinRequests)) return data
    return {
        ...data,
        pendingJoinRequests: maybeMealPlan.pendingJoinRequests.filter(
            request => request.joinRequestId !== requestId
        )
    }
}

export const useRejectMealPlanJoinRequest = (
    options: MutationOptions<NoContent> = {}
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: mealPlanApi.rejectJoinRequest,
        onMutate: async requestId => {
            await queryClient.cancelQueries({
                queryKey: queryKeys.mealPlans.all
            })
            const snapshots = queryClient.getQueriesData({
                queryKey: queryKeys.mealPlans.all
            })
            queryClient.setQueriesData(
                { queryKey: queryKeys.mealPlans.all },
                old => removePendingJoinRequestFromCache(old, requestId)
            )
            return { snapshots }
        },
        onError: (error, requestId, context) => {
            context?.snapshots.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data)
            })
            options.onError?.(
                error instanceof Error
                    ? error
                    : new Error('Join request reject failed')
            )
        },
        onSuccess: data => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.notifications.all
            })
            queryClient.invalidateQueries({
                queryKey: queryKeys.mealPlans.homeDashboard
            })
            queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.map })
            options.onSuccess?.(data)
        },
        onSettled: (data, error, requestId, context) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.all })
            options.onSettled?.()
        }
    })
}

export const useCompleteMealPlanStage = (
    options: MutationOptions<MealPlanResponse> = {}
) =>
    useMealPlanMutation(
        mealPlanApi.completeStage,
        options,
        variables => variables.mealPlanId
    )

export const useMealPlanDecisionProgress = (
    mealPlanId: string,
    options?: { enabled?: boolean }
) =>
    useQuery({
        queryKey: [
            ...queryKeys.mealPlans.detail(mealPlanId),
            'decision-progress'
        ] as const,
        queryFn: () => mealPlanApi.getDecisionProgress(mealPlanId),
        enabled: (options?.enabled ?? true) && mealPlanId.length > 0
    })

export const useReopenMealPlanDecisionTask = (
    options: MutationOptions<MealPlanResponse> = {}
) =>
    useMealPlanMutation(
        mealPlanApi.reopenDecisionTask,
        options,
        variables => variables.mealPlanId
    )

export const useConfirmMealPlanDecisionSnapshot = (
    options: MutationOptions<MealPlanResponse> = {}
) =>
    useMealPlanMutation(
        mealPlanApi.confirmDecisionSnapshot,
        options,
        variables => variables.mealPlanId
    )

export const useReadyMealPlan = (
    options: MutationOptions<MealPlanResponse> = {}
) => useMealPlanMutation(mealPlanApi.ready, options, mealPlanId => mealPlanId)

export const useUnreadyMealPlan = (
    options: MutationOptions<MealPlanResponse> = {}
) => useMealPlanMutation(mealPlanApi.unready, options, mealPlanId => mealPlanId)

export const useCreateMealPlanChangeRequest = (
    options: MutationOptions<
        Awaited<ReturnType<typeof mealPlanApi.createChangeRequest>>
    > = {}
) =>
    useMealPlanMutation(
        mealPlanApi.createChangeRequest,
        options,
        variables => variables.mealPlanId
    )

export const useAcceptMealPlanChangeRequest = (
    options: MutationOptions<MealPlanResponse> = {}
) =>
    useMealPlanMutation(
        mealPlanApi.acceptChangeRequest,
        options,
        variables => variables.mealPlanId
    )

export const useConfirmMealPlan = (
    options: MutationOptions<MealPlanResponse> = {}
) => useMealPlanMutation(mealPlanApi.confirm, options, mealPlanId => mealPlanId)
