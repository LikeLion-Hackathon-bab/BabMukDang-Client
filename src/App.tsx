import {
    Suspense,
    lazy,
    useEffect,
    type ComponentType,
    type ReactNode
} from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout, RegisterLayout } from '@/components'
import { AuthGate } from './pages/AuthGate'
import { PublicOnlyRoute } from './pages/PublicOnlyRoute'
import { ProtectedRoute } from './pages/ProtectedRoute'
import { AppBootstrapProvider } from '@/contexts'
import { PushProvider } from '@/features/push'

const lazyNamed = <T extends ComponentType<Record<string, never>>>(
    loader: () => Promise<Record<string, unknown>>,
    exportName: string
) =>
    lazy(async () => ({
        default: (await loader())[exportName] as T
    }))

const LazyStartRegisterPage = lazyNamed(
    () => import('@/pages/register/StartRegisterPage'),
    'StartRegisterPage'
)
const LazyMakeProfilePage = lazyNamed(
    () => import('@/pages/register/MakeProfilePage'),
    'MakeProfilePage'
)
const LazyPreferMenuPage = lazyNamed(
    () => import('@/pages/register/PreferMenuPage'),
    'PreferMenuPage'
)
const LazyAllergicMenuPage = lazyNamed(
    () => import('@/pages/register/AllergicMenuPage'),
    'AllergicMenuPage'
)
const LazyFinishRegisterPage = lazyNamed(
    () => import('@/pages/register/FinishRegisterPage'),
    'FinishRegisterPage'
)
const LazyIntroStart = lazyNamed(
    () => import('./pages/intro/IntroStart'),
    'IntroStart'
)
const LazyIntroTutorial = lazyNamed(
    () => import('./pages/intro/IntroTutorial'),
    'IntroTutorial'
)
const LazyHomePage = lazyNamed(
    () => import('@/pages/navigation/HomePage'),
    'HomePage'
)
const LazyFriendPage = lazyNamed(
    () => import('@/pages/navigation/FriendPage'),
    'FriendPage'
)
const LazyMeetingPage = lazyNamed(
    () => import('@/pages/navigation/MeetingPage'),
    'MeetingPage'
)
const LazyProfilePage = lazyNamed(
    () => import('@/pages/navigation/ProfilePage'),
    'ProfilePage'
)
const LazyMealMapPage = lazyNamed(
    () => import('@/pages/navigation/MealMapPage'),
    'MealMapPage'
)
const LazyMealPlanStartPage = lazyNamed(
    () => import('@/pages/meal-plan/MealPlanStartPage'),
    'MealPlanStartPage'
)
const LazyMealPlanDetailPage = lazyNamed(
    () => import('@/pages/meal-plan/MealPlanDetailPage'),
    'MealPlanDetailPage'
)
const LazyMealPlanDecisionPage = lazyNamed(
    () => import('@/pages/meal-plan/MealPlanDecisionPage'),
    'MealPlanDecisionPage'
)
const LazyMealPlanDateVotePage = lazyNamed(
    () => import('@/pages/meal-plan/MealPlanStageVotePage'),
    'MealPlanDateVotePage'
)
const LazyMealPlanTimeVotePage = lazyNamed(
    () => import('@/pages/meal-plan/MealPlanStageVotePage'),
    'MealPlanTimeVotePage'
)
const LazyMealPlanAreaVotePage = lazyNamed(
    () => import('@/pages/meal-plan/MealPlanStageVotePage'),
    'MealPlanAreaVotePage'
)
const LazyMealPlanMenuVotePage = lazyNamed(
    () => import('@/pages/meal-plan/MealPlanStageVotePage'),
    'MealPlanMenuVotePage'
)
const LazyMealPlanRestaurantVotePage = lazyNamed(
    () => import('@/pages/meal-plan/MealPlanStageVotePage'),
    'MealPlanRestaurantVotePage'
)
const LazyMealPlanDecisionChatPage = lazyNamed(
    () => import('@/pages/meal-plan/MealPlanDecisionChatPage'),
    'MealPlanDecisionChatPage'
)
const LazyMealPlanFinalConfirmPage = lazyNamed(
    () => import('@/pages/meal-plan/MealPlanFinalConfirmPage'),
    'MealPlanFinalConfirmPage'
)
const LazyMealPlanRecordEntryPage = lazyNamed(
    () => import('@/pages/meal-plan/MealPlanRecordEntryPage'),
    'MealPlanRecordEntryPage'
)
const LazyMealPlanSharePreviewPage = lazyNamed(
    () => import('@/pages/meal-plan/MealPlanSharePreviewPage'),
    'MealPlanSharePreviewPage'
)
const LazyMealPlanGuestJoinPage = lazyNamed(
    () => import('@/pages/meal-plan/MealPlanGuestJoinPage'),
    'MealPlanGuestJoinPage'
)
const LazyMealPlanGuestSessionPage = lazyNamed(
    () => import('@/pages/meal-plan/MealPlanGuestSessionPage'),
    'MealPlanGuestSessionPage'
)
const LazyMealGroupListPage = lazyNamed(
    () => import('@/pages/meal-group/MealGroupListPage'),
    'MealGroupListPage'
)
const LazyMealGroupDetailPage = lazyNamed(
    () => import('@/pages/meal-group/MealGroupDetailPage'),
    'MealGroupDetailPage'
)
const LazySearchRestaurantPage = lazyNamed(
    () => import('@/pages/home/SearchRestaurantPage'),
    'SearchRestaurantPage'
)
const LazyNotiStoragePage = lazyNamed(
    () => import('@/pages/home/NotiStoragePage'),
    'NotiStoragePage'
)
const LazyUploadPage = lazyNamed(
    () => import('@/pages/home/UploadPage'),
    'UploadPage'
)
const LazyCommentPage = lazyNamed(
    () => import('@/pages/home/CommentPage'),
    'CommentPage'
)
const LazyCouponStoragePage = lazyNamed(
    () => import('@/pages/profile/CouponStoragePage'),
    'CouponStoragePage'
)
const LazyProfileEditPage = lazyNamed(
    () => import('@/pages/profile/ProfileEditPage'),
    'ProfileEditPage'
)
const LazyBobCheckHistoryPage = lazyNamed(
    () => import('@/pages/profile/BobCheckHistoryPage'),
    'BobCheckHistoryPage'
)
const LazyChallengePage = lazyNamed(
    () => import('@/pages/profile/ChallengePage'),
    'ChallengePage'
)
const LazyFriendProfilePage = lazyNamed(
    () => import('@/pages/profile/FriendProfilePage'),
    'FriendProfilePage'
)
const LazyGPSPage = lazyNamed(() => import('@/pages/test/GPSPage'), 'GPSPage')
const LazyNotificationPage = lazyNamed(
    () => import('@/pages/test/NotificationPage'),
    'NotificationPage'
)
const LazyPushNotificationPage = lazyNamed(
    () => import('@/pages/test/PushNotificationPage'),
    'PushNotificationPage'
)
const LazyTestPage = lazyNamed(
    () => import('@/pages/test/TestPage'),
    'TestPage'
)

const page = (element: ReactNode) => (
    <Suspense
        fallback={
            <div className="rounded-20 text-caption-regular text-gray-5 bg-white p-16">
                화면을 불러오는 중입니다.
            </div>
        }>
        {element}
    </Suspense>
)

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false
        }
    }
})

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AppBootstrapProvider>
                <Router>
                    <PushProvider>
                        <Routes>
                            <Route
                                path="/"
                                element={<AuthGate />}
                            />
                            <Route element={<PublicOnlyRoute />}>
                                <Route element={<RegisterLayout />}>
                                    <Route
                                        path="/login"
                                        element={page(
                                            <LazyStartRegisterPage />
                                        )}
                                    />
                                </Route>
                                <Route
                                    path="/intro"
                                    element={page(<LazyIntroStart />)}
                                />
                                <Route
                                    path="/intro/tutorial"
                                    element={page(<LazyIntroTutorial />)}
                                />
                            </Route>

                            <Route element={<RegisterLayout />}>
                                <Route
                                    path="/meal-plan-links/:token"
                                    element={page(
                                        <LazyMealPlanSharePreviewPage />
                                    )}
                                />
                                <Route
                                    path="/meal-plan-links/:token/join"
                                    element={page(
                                        <LazyMealPlanGuestJoinPage />
                                    )}
                                />
                                <Route
                                    path="/meal-plan-links/:token/session"
                                    element={page(
                                        <LazyMealPlanGuestSessionPage />
                                    )}
                                />
                            </Route>

                            <Route element={<ProtectedRoute />}>
                                <Route element={<Layout />}>
                                    <Route
                                        path="/home"
                                        element={page(<LazyHomePage />)}
                                    />
                                    <Route
                                        path="/profile"
                                        element={page(<LazyProfilePage />)}
                                    />
                                    <Route
                                        path="/friend"
                                        element={page(<LazyFriendPage />)}
                                    />
                                    <Route
                                        path="/meeting"
                                        element={page(<LazyMeetingPage />)}
                                    />
                                    <Route
                                        path="/meal-map"
                                        element={page(<LazyMealMapPage />)}
                                    />

                                    <Route
                                        path="/meal-plans"
                                        element={page(<LazyMeetingPage />)}
                                    />
                                    <Route
                                        path="/meal-plans/start"
                                        element={page(
                                            <LazyMealPlanStartPage />
                                        )}
                                    />
                                    <Route
                                        path="/meal-plans/:mealPlanId"
                                        element={page(
                                            <LazyMealPlanDetailPage />
                                        )}
                                    />
                                    <Route
                                        path="/meal-plans/:mealPlanId/decision"
                                        element={page(
                                            <LazyMealPlanDecisionPage />
                                        )}
                                    />
                                    <Route
                                        path="/meal-plans/:mealPlanId/decision/date"
                                        element={page(
                                            <LazyMealPlanDateVotePage />
                                        )}
                                    />
                                    <Route
                                        path="/meal-plans/:mealPlanId/decision/time"
                                        element={page(
                                            <LazyMealPlanTimeVotePage />
                                        )}
                                    />
                                    <Route
                                        path="/meal-plans/:mealPlanId/decision/area"
                                        element={page(
                                            <LazyMealPlanAreaVotePage />
                                        )}
                                    />
                                    <Route
                                        path="/meal-plans/:mealPlanId/decision/menu"
                                        element={page(
                                            <LazyMealPlanMenuVotePage />
                                        )}
                                    />
                                    <Route
                                        path="/meal-plans/:mealPlanId/decision/restaurant"
                                        element={page(
                                            <LazyMealPlanRestaurantVotePage />
                                        )}
                                    />
                                    <Route
                                        path="/meal-plans/:mealPlanId/decision/chat"
                                        element={page(
                                            <LazyMealPlanDecisionChatPage />
                                        )}
                                    />
                                    <Route
                                        path="/meal-plans/:mealPlanId/decision/final"
                                        element={page(
                                            <LazyMealPlanFinalConfirmPage />
                                        )}
                                    />
                                    <Route
                                        path="/meal-plans/:mealPlanId/record"
                                        element={page(
                                            <LazyMealPlanRecordEntryPage />
                                        )}
                                    />
                                    <Route
                                        path="/meal-groups"
                                        element={page(
                                            <LazyMealGroupListPage />
                                        )}
                                    />
                                    <Route
                                        path="/meal-groups/:mealGroupId"
                                        element={page(
                                            <LazyMealGroupDetailPage />
                                        )}
                                    />

                                    <Route
                                        path="/search-restaurant"
                                        element={page(
                                            <LazySearchRestaurantPage />
                                        )}
                                    />
                                    <Route
                                        path="/noti"
                                        element={page(<LazyNotiStoragePage />)}
                                    />
                                    <Route
                                        path="/upload"
                                        element={page(<LazyUploadPage />)}
                                    />
                                    <Route
                                        path="/post/:postId"
                                        element={page(<LazyCommentPage />)}
                                    />

                                    <Route
                                        path="/coupon"
                                        element={page(
                                            <LazyCouponStoragePage />
                                        )}
                                    />
                                    <Route
                                        path="/profile-edit"
                                        element={page(<LazyProfileEditPage />)}
                                    />
                                    <Route
                                        path="/bob-check-history"
                                        element={page(
                                            <LazyBobCheckHistoryPage />
                                        )}
                                    />
                                    <Route
                                        path="/challenge"
                                        element={page(<LazyChallengePage />)}
                                    />
                                    <Route
                                        path="/friend-profile"
                                        element={page(
                                            <LazyFriendProfilePage />
                                        )}
                                    />

                                    <Route element={<RegisterLayout />}>
                                        <Route
                                            path="/allergic-menu"
                                            element={page(
                                                <LazyAllergicMenuPage />
                                            )}
                                        />
                                        <Route
                                            path="/prefer-menu"
                                            element={page(
                                                <LazyPreferMenuPage />
                                            )}
                                        />
                                        <Route
                                            path="/onboarding"
                                            element={page(
                                                <LazyMakeProfilePage />
                                            )}
                                        />
                                        <Route
                                            path="/finish-register"
                                            element={page(
                                                <LazyFinishRegisterPage />
                                            )}
                                        />
                                    </Route>

                                    <Route
                                        path="/gps"
                                        element={page(<LazyGPSPage />)}
                                    />
                                    <Route
                                        path="/notifications"
                                        element={page(<LazyNotificationPage />)}
                                    />
                                    <Route
                                        path="/push"
                                        element={page(
                                            <LazyPushNotificationPage />
                                        )}
                                    />
                                    <Route
                                        path="/test"
                                        element={page(<LazyTestPage />)}
                                    />
                                </Route>
                            </Route>
                        </Routes>
                    </PushProvider>
                </Router>
            </AppBootstrapProvider>
        </QueryClientProvider>
    )
}

export default App
