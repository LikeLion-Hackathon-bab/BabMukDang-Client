import { lazy, Suspense, type ComponentType } from 'react'
import { AuthGate } from '@/pages/AuthGate'
import { NavigationActivityShell } from './NavigationActivityShell'
import type { AppActivityName } from './routes'

const lazyNamed = <T extends ComponentType<any>>(
    loader: () => Promise<Record<string, unknown>>,
    exportName: string
) => lazy(async () => ({ default: (await loader())[exportName] as T }))

const pages = {
    LoginActivity: lazyNamed(
        () => import('@/pages/register/StartRegisterPage'),
        'StartRegisterPage'
    ),
    IntroActivity: lazyNamed(
        () => import('@/pages/intro/IntroStart'),
        'IntroStart'
    ),
    IntroTutorialActivity: lazyNamed(
        () => import('@/pages/intro/IntroTutorial'),
        'IntroTutorial'
    ),
    MealPlanSharePreviewActivity: lazyNamed(
        () => import('@/pages/meal-plan/MealPlanSharePreviewPage'),
        'MealPlanSharePreviewPage'
    ),
    MealPlanGuestJoinActivity: lazyNamed(
        () => import('@/pages/meal-plan/MealPlanGuestJoinPage'),
        'MealPlanGuestJoinPage'
    ),
    MealPlanGuestSessionActivity: lazyNamed(
        () => import('@/pages/meal-plan/MealPlanGuestSessionPage'),
        'MealPlanGuestSessionPage'
    ),
    HomeActivity: lazyNamed(
        () => import('@/pages/navigation/HomePage'),
        'HomePage'
    ),
    ProfileActivity: lazyNamed(
        () => import('@/pages/navigation/ProfilePage'),
        'ProfilePage'
    ),
    FriendActivity: lazyNamed(
        () => import('@/pages/navigation/FriendPage'),
        'FriendPage'
    ),
    MeetingActivity: lazyNamed(
        () => import('@/pages/navigation/MeetingPage'),
        'MeetingPage'
    ),
    MealMapActivity: lazyNamed(
        () => import('@/pages/navigation/MealMapPage'),
        'MealMapPage'
    ),
    MealPlanStartActivity: lazyNamed(
        () => import('@/pages/meal-plan/MealPlanStartPage'),
        'MealPlanStartPage'
    ),
    MealPlanDetailActivity: lazyNamed(
        () => import('@/pages/meal-plan/MealPlanDetailPage'),
        'MealPlanDetailPage'
    ),
    MealPlanDecisionActivity: lazyNamed(
        () => import('@/pages/meal-plan/MealPlanDecisionPage'),
        'MealPlanDecisionPage'
    ),
    MealPlanRecordEntryActivity: lazyNamed(
        () => import('@/pages/meal-plan/MealPlanRecordEntryPage'),
        'MealPlanRecordEntryPage'
    ),
    MealGroupListActivity: lazyNamed(
        () => import('@/pages/meal-group/MealGroupListPage'),
        'MealGroupListPage'
    ),
    MealGroupDetailActivity: lazyNamed(
        () => import('@/pages/meal-group/MealGroupDetailPage'),
        'MealGroupDetailPage'
    ),
    SearchRestaurantActivity: lazyNamed(
        () => import('@/pages/home/SearchRestaurantPage'),
        'SearchRestaurantPage'
    ),
    NotificationStorageActivity: lazyNamed(
        () => import('@/pages/home/NotiStoragePage'),
        'NotiStoragePage'
    ),
    UploadActivity: lazyNamed(
        () => import('@/pages/home/UploadPage'),
        'UploadPage'
    ),
    CommentActivity: lazyNamed(
        () => import('@/pages/home/CommentPage'),
        'CommentPage'
    ),
    CouponStorageActivity: lazyNamed(
        () => import('@/pages/profile/CouponStoragePage'),
        'CouponStoragePage'
    ),
    ProfileEditActivity: lazyNamed(
        () => import('@/pages/profile/ProfileEditPage'),
        'ProfileEditPage'
    ),
    BobCheckHistoryActivity: lazyNamed(
        () => import('@/pages/profile/BobCheckHistoryPage'),
        'BobCheckHistoryPage'
    ),
    ChallengeActivity: lazyNamed(
        () => import('@/pages/profile/ChallengePage'),
        'ChallengePage'
    ),
    FriendProfileActivity: lazyNamed(
        () => import('@/pages/profile/FriendProfilePage'),
        'FriendProfilePage'
    ),
    AllergicMenuActivity: lazyNamed(
        () => import('@/pages/register/AllergicMenuPage'),
        'AllergicMenuPage'
    ),
    PreferMenuActivity: lazyNamed(
        () => import('@/pages/register/PreferMenuPage'),
        'PreferMenuPage'
    ),
    OnboardingProfileActivity: lazyNamed(
        () => import('@/pages/register/MakeProfilePage'),
        'MakeProfilePage'
    ),
    FinishRegisterActivity: lazyNamed(
        () => import('@/pages/register/FinishRegisterPage'),
        'FinishRegisterPage'
    ),
    GpsTestActivity: lazyNamed(() => import('@/pages/test/GPSPage'), 'GPSPage'),
    NotificationTestActivity: lazyNamed(
        () => import('@/pages/test/NotificationPage'),
        'NotificationPage'
    ),
    PushTestActivity: lazyNamed(
        () => import('@/pages/test/PushNotificationPage'),
        'PushNotificationPage'
    ),
    TestActivity: lazyNamed(() => import('@/pages/test/TestPage'), 'TestPage')
} satisfies Partial<Record<AppActivityName, ComponentType<any>>>

const LoadingFallback = () => (
    <div className="bg-gray-1 text-caption-regular text-gray-5 flex min-h-screen items-center justify-center px-20">
        화면을 불러오는 중입니다.
    </div>
)

const createActivity = (Page: ComponentType<any>) =>
    function ActivityComponent() {
        return (
            <NavigationActivityShell>
                <Suspense fallback={<LoadingFallback />}>
                    <Page />
                </Suspense>
            </NavigationActivityShell>
        )
    }

export const stackflowActivityComponents = {
    RootActivity: createActivity(AuthGate),
    LoginActivity: createActivity(pages.LoginActivity),
    IntroActivity: createActivity(pages.IntroActivity),
    IntroTutorialActivity: createActivity(pages.IntroTutorialActivity),
    MealPlanSharePreviewActivity: createActivity(
        pages.MealPlanSharePreviewActivity
    ),
    MealPlanGuestJoinActivity: createActivity(pages.MealPlanGuestJoinActivity),
    MealPlanGuestSessionActivity: createActivity(
        pages.MealPlanGuestSessionActivity
    ),
    HomeActivity: createActivity(pages.HomeActivity),
    ProfileActivity: createActivity(pages.ProfileActivity),
    FriendActivity: createActivity(pages.FriendActivity),
    MeetingActivity: createActivity(pages.MeetingActivity),
    MealMapActivity: createActivity(pages.MealMapActivity),
    MealPlanStartActivity: createActivity(pages.MealPlanStartActivity),
    MealPlanDetailActivity: createActivity(pages.MealPlanDetailActivity),
    MealPlanDecisionActivity: createActivity(pages.MealPlanDecisionActivity),
    MealPlanRecordEntryActivity: createActivity(
        pages.MealPlanRecordEntryActivity
    ),
    MealGroupListActivity: createActivity(pages.MealGroupListActivity),
    MealGroupDetailActivity: createActivity(pages.MealGroupDetailActivity),
    SearchRestaurantActivity: createActivity(pages.SearchRestaurantActivity),
    NotificationStorageActivity: createActivity(
        pages.NotificationStorageActivity
    ),
    UploadActivity: createActivity(pages.UploadActivity),
    CommentActivity: createActivity(pages.CommentActivity),
    CouponStorageActivity: createActivity(pages.CouponStorageActivity),
    ProfileEditActivity: createActivity(pages.ProfileEditActivity),
    BobCheckHistoryActivity: createActivity(pages.BobCheckHistoryActivity),
    ChallengeActivity: createActivity(pages.ChallengeActivity),
    FriendProfileActivity: createActivity(pages.FriendProfileActivity),
    AllergicMenuActivity: createActivity(pages.AllergicMenuActivity),
    PreferMenuActivity: createActivity(pages.PreferMenuActivity),
    OnboardingProfileActivity: createActivity(pages.OnboardingProfileActivity),
    FinishRegisterActivity: createActivity(pages.FinishRegisterActivity),
    GpsTestActivity: createActivity(pages.GpsTestActivity),
    NotificationTestActivity: createActivity(pages.NotificationTestActivity),
    PushTestActivity: createActivity(pages.PushTestActivity),
    TestActivity: createActivity(pages.TestActivity)
}
