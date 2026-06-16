import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LogoTextIcon } from '@/assets/icons'
import { PostCard, PostEmptyView, UploadButton, HomeBannerSection } from '@/components'
import { COLORS } from '@/constants/colors'
import { useGetHomeArticles, useMyMealPlanCards } from '@/apis'
import { toPostCardView } from '@/viewModels'
import { useHeaderStore } from '@/store'
import { usePullToRefresh } from '@/hooks'
import { MyMealPlanCard } from '@/components/features/meal-plan'

export function HomePage() {
    const { setLeftElement, hideCenterElement, resetHeader, showRightButton } =
        useHeaderStore()
    const { data: postListData } = useGetHomeArticles()
    const { data: mealPlanCards } = useMyMealPlanCards()
    const postList = (postListData?.items ?? []).map(toPostCardView)
    const { pullPosition, menu } = usePullToRefresh()

    const currentMealPlan = mealPlanCards?.deciding[0]
    const todayMealPlan = mealPlanCards?.upcoming[0]
    const recordNeededMealPlan = mealPlanCards?.recordNeeded[0]

    useEffect(() => {
        setLeftElement(<LogoTextIcon fillcolor={COLORS.primary500} />)
        hideCenterElement()
        showRightButton()
        return () => resetHeader()
    }, [setLeftElement, hideCenterElement, showRightButton, resetHeader])

    return (
        <div className="flex flex-col gap-24 pb-20">
            <HomeBannerSection
                menu={menu}
                pullPosition={pullPosition}
            />
            <section className="rounded-24 bg-primary-100 border-primary-300 flex flex-col gap-14 border p-18">
                <div>
                    <h1 className="text-title2-semibold text-gray-8">
                        오늘 뭐 먹지?
                    </h1>
                    <p className="text-body2-medium text-gray-6">
                        MealPlan을 만들고, 필요하면 친구를 부르고, 먹은 뒤 기록까지 이어갑니다.
                    </p>
                </div>
                <Link
                    to="/meal-plans/start"
                    className="rounded-30 bg-primary-main text-body1-semibold flex justify-center py-12 text-white">
                    MealPlan 시작하기
                </Link>
            </section>
            <section className="flex flex-col gap-12">
                <h2 className="text-body1-semibold text-gray-8">다음 행동</h2>
                {currentMealPlan && <MyMealPlanCard mealPlan={currentMealPlan} />}
                {todayMealPlan && <MyMealPlanCard mealPlan={todayMealPlan} />}
                {recordNeededMealPlan && <MyMealPlanCard mealPlan={recordNeededMealPlan} />}
                {!currentMealPlan && !todayMealPlan && !recordNeededMealPlan && (
                    <div className="rounded-20 bg-white p-16 text-caption-regular text-gray-5">
                        지금 이어서 할 밥약이 없습니다.
                    </div>
                )}
            </section>
            <section className="flex flex-col gap-12">
                <h2 className="text-body1-semibold text-gray-8">친구들의 밥 기록</h2>
                {postList.length === 0 ? (
                    <PostEmptyView />
                ) : (
                    <div className="flex flex-col items-center justify-center gap-48">
                        {postList.map((post, index) => (
                            <PostCard
                                key={index}
                                post={post}
                                isComment={false}
                            />
                        ))}
                    </div>
                )}
            </section>
            <UploadButton />
        </div>
    )
}
