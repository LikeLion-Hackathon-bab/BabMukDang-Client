import { useState } from 'react'
import { SocketProvider } from '@/contexts/SocketContext'
import {
    AreaRegisterSheet,
    AreaVotePanel,
    DateRegisterSheet,
    DateVotePanel,
    DecisionShell,
    FriendVotesSheet,
    MenuRegisterSheet,
    MenuVotePanel,
    ReadyFooter,
    RestaurantRegisterSheet,
    RestaurantVotePanel,
    TimeRegisterSheet,
    TimeVotePanel,
    mealPlanTitle,
    useDecisionPageData,
    useDecisionStages,
    type StageKey
} from '@/components/features/meal-plan/decision'
import type { MealPlanDecisionStageType } from '@kimdaegyu/babmukdang-shared/domain'

const STAGE_TYPE: Record<StageKey, MealPlanDecisionStageType> = {
    date: 'DATE',
    time: 'TIME',
    area: 'AREA',
    menu: 'MENU',
    restaurant: 'RESTAURANT'
}

function StageVoteContent({ stageKey }: { stageKey: StageKey }) {
    const { mealPlanId, mealPlan, permissions, isSelfReady, status } =
        useDecisionPageData()
    const decision = useDecisionStages()
    const stage = decision.stages.find(s => s.key === stageKey)!
    const [showRegister, setShowRegister] = useState(false)
    const [showFriends, setShowFriends] = useState(false)
    const canVote = permissions?.canVote ?? false
    const openRegister = () => {
        setShowFriends(false)
        setShowRegister(true)
    }

    const areaDecided = Boolean(
        decision.statesByKey.area === 'decided' || mealPlan?.selectedArea
    )

    const panel = (() => {
        switch (stageKey) {
            case 'date':
                return (
                    <DateVotePanel
                        mealPlanId={mealPlanId}
                        stage={stage}
                        canVote={canVote}
                        onAdd={openRegister}
                    />
                )
            case 'time':
                return (
                    <TimeVotePanel
                        mealPlanId={mealPlanId}
                        stage={stage}
                        canVote={canVote}
                        onAdd={openRegister}
                    />
                )
            case 'area':
                return (
                    <AreaVotePanel
                        mealPlanId={mealPlanId}
                        stage={stage}
                        canVote={canVote}
                        onAdd={openRegister}
                    />
                )
            case 'menu':
                return (
                    <MenuVotePanel
                        mealPlanId={mealPlanId}
                        stage={stage}
                        canVote={canVote}
                        onAdd={openRegister}
                    />
                )
            case 'restaurant':
                return (
                    <RestaurantVotePanel
                        mealPlanId={mealPlanId}
                        stage={stage}
                        canVote={canVote}
                        onAdd={openRegister}
                        areaDecided={areaDecided}
                        areaName={
                            mealPlan?.selectedArea?.placeName ?? undefined
                        }
                        menuName={mealPlan?.selectedMenuCategory ?? undefined}
                    />
                )
        }
    })()

    const registerSheet = (() => {
        if (!showRegister) return null
        const close = () => setShowRegister(false)
        switch (stageKey) {
            case 'date':
                return (
                    <DateRegisterSheet
                        mealPlanId={mealPlanId}
                        stageId={stage.stageId}
                        onClose={close}
                    />
                )
            case 'time':
                return (
                    <TimeRegisterSheet
                        mealPlanId={mealPlanId}
                        stageId={stage.stageId}
                        onClose={close}
                    />
                )
            case 'area':
                return (
                    <AreaRegisterSheet
                        mealPlanId={mealPlanId}
                        stageId={stage.stageId}
                        onClose={close}
                    />
                )
            case 'menu':
                return (
                    <MenuRegisterSheet
                        mealPlanId={mealPlanId}
                        stageId={stage.stageId}
                        onClose={close}
                    />
                )
            case 'restaurant':
                return (
                    <RestaurantRegisterSheet
                        mealPlanId={mealPlanId}
                        stageId={stage.stageId}
                        onClose={close}
                        areaContext={
                            mealPlan?.selectedArea
                                ? {
                                      latitude: mealPlan.selectedArea
                                          .lat as number,
                                      longitude: mealPlan.selectedArea
                                          .lng as number
                                  }
                                : undefined
                        }
                    />
                )
        }
    })()

    return (
        <>
            <DecisionShell
                mealPlanId={mealPlanId}
                title={mealPlanTitle(mealPlan?.title)}
                sub={`${decision.participantCount}명`}
                active={stageKey}
                states={decision.statesByKey}
                footer={
                    <ReadyFooter
                        mealPlanId={mealPlanId}
                        isSelfReady={isSelfReady}
                        status={status}
                        canReady={permissions?.canReadyMealPlan}
                        onFriends={() => {
                            setShowRegister(false)
                            setShowFriends(true)
                        }}
                        friendsActive={showFriends}
                    />
                }>
                {panel}
            </DecisionShell>
            {registerSheet ??
                (showFriends ? (
                    <FriendVotesSheet
                        stageType={STAGE_TYPE[stageKey]}
                        onClose={() => setShowFriends(false)}
                    />
                ) : null)}
        </>
    )
}

function StageVotePage({ stageKey }: { stageKey: StageKey }) {
    return (
        <SocketProvider>
            <StageVoteContent stageKey={stageKey} />
        </SocketProvider>
    )
}

export const MealPlanDateVotePage = () => <StageVotePage stageKey="date" />
export const MealPlanTimeVotePage = () => <StageVotePage stageKey="time" />
export const MealPlanAreaVotePage = () => <StageVotePage stageKey="area" />
export const MealPlanMenuVotePage = () => <StageVotePage stageKey="menu" />
export const MealPlanRestaurantVotePage = () => (
    <StageVotePage stageKey="restaurant" />
)
