import { defineConfig } from '@stackflow/config'
import { appActivityRoutes, type NavigationActivityParams } from './routes'

declare module '@stackflow/config' {
    interface Register {
        RootActivity: NavigationActivityParams
        LoginActivity: NavigationActivityParams
        IntroActivity: NavigationActivityParams
        IntroTutorialActivity: NavigationActivityParams
        MealPlanSharePreviewActivity: NavigationActivityParams
        MealPlanGuestJoinActivity: NavigationActivityParams
        MealPlanGuestSessionActivity: NavigationActivityParams
        HomeActivity: NavigationActivityParams
        ProfileActivity: NavigationActivityParams
        FriendActivity: NavigationActivityParams
        MeetingActivity: NavigationActivityParams
        MealMapActivity: NavigationActivityParams
        MealPlanStartActivity: NavigationActivityParams
        MealPlanDetailActivity: NavigationActivityParams
        MealPlanDecisionActivity: NavigationActivityParams
        MealPlanRecordEntryActivity: NavigationActivityParams
        MealGroupListActivity: NavigationActivityParams
        MealGroupDetailActivity: NavigationActivityParams
        SearchRestaurantActivity: NavigationActivityParams
        NotificationStorageActivity: NavigationActivityParams
        UploadActivity: NavigationActivityParams
        CommentActivity: NavigationActivityParams
        CouponStorageActivity: NavigationActivityParams
        ProfileEditActivity: NavigationActivityParams
        BobCheckHistoryActivity: NavigationActivityParams
        ChallengeActivity: NavigationActivityParams
        FriendProfileActivity: NavigationActivityParams
        AllergicMenuActivity: NavigationActivityParams
        PreferMenuActivity: NavigationActivityParams
        OnboardingProfileActivity: NavigationActivityParams
        FinishRegisterActivity: NavigationActivityParams
        GpsTestActivity: NavigationActivityParams
        NotificationTestActivity: NavigationActivityParams
        PushTestActivity: NavigationActivityParams
        TestActivity: NavigationActivityParams
    }
}

export const stackflowConfig = defineConfig({
    activities: appActivityRoutes.map(route => ({
        name: route.name,
        route: route.path
    })),
    initialActivity: () => 'RootActivity',
    transitionDuration: 280
})
