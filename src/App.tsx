import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
    AllergicMenuPage,
    BobCheckHistoryPage,
    ChallengePage,
    CommentPage,
    CouponStoragePage,
    FinishRegisterPage,
    FriendProfilePage,
    GPSPage,
    HomePage,
    MakeProfilePage,
    MealGroupDetailPage,
    MealGroupListPage,
    MealMapPage,
    MealPlanDecisionPage,
    MealPlanDetailPage,
    MealPlanGuestJoinPage,
    MealPlanGuestSessionPage,
    MealPlanRecordEntryPage,
    MealPlanSharePreviewPage,
    MealPlanStartPage,
    MeetingPage,
    NotiStoragePage,
    NotificationPage,
    PreferMenuPage,
    ProfileEditPage,
    ProfilePage,
    PushNotificationPage,
    SearchRestaurantPage,
    StartRegisterPage,
    TestPage,
    UploadPage
} from '@/pages'
import { Layout, RegisterLayout } from '@/components'
import { useEffect } from 'react'
import { IntroStart } from './pages/intro/IntroStart'
import { IntroTutorial } from './pages/intro/IntroTutorial'
import { FriendPage } from './pages/navigation/FriendPage'
import { AuthGate } from './pages/AuthGate'
import { PublicOnlyRoute } from './pages/PublicOnlyRoute'
import { ProtectedRoute } from './pages/ProtectedRoute'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false
        }
    }
})

function App() {
    useEffect(() => {
        // register()
    }, [])

    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <Routes>
                    <Route
                        path="/"
                        element={<AuthGate />}
                    />
                    <Route element={<PublicOnlyRoute />}>
                        <Route element={<RegisterLayout />}>
                            <Route
                                path="/login"
                                element={<StartRegisterPage />}
                            />
                        </Route>
                        <Route
                            path="/intro"
                            element={<IntroStart />}
                        />
                        <Route
                            path="/intro/tutorial"
                            element={<IntroTutorial />}
                        />
                    </Route>


                    <Route element={<RegisterLayout />}>
                        <Route
                            path="/meal-plan-links/:token"
                            element={<MealPlanSharePreviewPage />}
                        />
                        <Route
                            path="/meal-plan-links/:token/join"
                            element={<MealPlanGuestJoinPage />}
                        />
                        <Route
                            path="/meal-plan-links/:token/session"
                            element={<MealPlanGuestSessionPage />}
                        />
                    </Route>

                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route
                                path="/home"
                                element={<HomePage />}
                            />
                            <Route
                                path="/profile"
                                element={<ProfilePage />}
                            />
                            <Route
                                path="/friend"
                                element={<FriendPage />}
                            />
                            <Route
                                path="/meeting"
                                element={<MeetingPage />}
                            />
                            <Route
                                path="/meal-map"
                                element={<MealMapPage />}
                            />

                            <Route
                                path="/meal-plans"
                                element={<MeetingPage />}
                            />
                            <Route
                                path="/meal-plans/start"
                                element={<MealPlanStartPage />}
                            />
                            <Route
                                path="/meal-plans/:mealPlanId"
                                element={<MealPlanDetailPage />}
                            />
                            <Route
                                path="/meal-plans/:mealPlanId/decision"
                                element={<MealPlanDecisionPage />}
                            />
                            <Route
                                path="/meal-plans/:mealPlanId/record"
                                element={<MealPlanRecordEntryPage />}
                            />
                            <Route
                                path="/meal-groups"
                                element={<MealGroupListPage />}
                            />
                            <Route
                                path="/meal-groups/:mealGroupId"
                                element={<MealGroupDetailPage />}
                            />

                            <Route
                                path="/search-restaurant"
                                element={<SearchRestaurantPage />}
                            />
                            <Route
                                path="/noti"
                                element={<NotiStoragePage />}
                            />
                            <Route
                                path="/upload"
                                element={<UploadPage />}
                            />
                            <Route
                                path="/post/:postId"
                                element={<CommentPage />}
                            />

                            <Route
                                path="/coupon"
                                element={<CouponStoragePage />}
                            />
                            <Route
                                path="/profile-edit"
                                element={<ProfileEditPage />}
                            />
                            <Route
                                path="/bob-check-history"
                                element={<BobCheckHistoryPage />}
                            />
                            <Route
                                path="/challenge"
                                element={<ChallengePage />}
                            />
                            <Route
                                path="/friend-profile"
                                element={<FriendProfilePage />}
                            />

                            <Route element={<RegisterLayout />}>
                                <Route
                                    path="/allergic-menu"
                                    element={<AllergicMenuPage />}
                                />
                                <Route
                                    path="/prefer-menu"
                                    element={<PreferMenuPage />}
                                />
                                <Route
                                    path="/onboarding"
                                    element={<MakeProfilePage />}
                                />
                                <Route
                                    path="/finish-register"
                                    element={<FinishRegisterPage />}
                                />
                            </Route>

                            <Route
                                path="/gps"
                                element={<GPSPage />}
                            />
                            <Route
                                path="/notifications"
                                element={<NotificationPage />}
                            />
                            <Route
                                path="/push"
                                element={<PushNotificationPage />}
                            />
                            <Route
                                path="/test"
                                element={<TestPage />}
                            />
                        </Route>
                    </Route>
                </Routes>
            </Router>
        </QueryClientProvider>
    )
}

export default App
