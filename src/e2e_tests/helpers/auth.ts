export interface TestAuthContext {
    accessToken: string
    memberId: number
}

export const createUnauthenticatedTestAuthContext = (): TestAuthContext => ({
    accessToken: '',
    memberId: 0
})
