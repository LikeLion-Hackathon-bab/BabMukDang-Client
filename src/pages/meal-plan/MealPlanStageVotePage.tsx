import { useState } from 'react'
import { useParams } from '@/navigation'
import {
    AreaRegisterSheet,
    AreaVotePanel,
    DateRegisterSheet,
    DateVotePanel,
    DecisionSessionProvider,
    DecisionShell,
    FriendVotesSheet,
    Glyph,
    MenuRegisterSheet,
    MenuVotePanel,
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
    const {
        mealPlanId,
        mealPlan,
        permissions,
        isGuest,
        shareLinkToken
    } = useDecisionPageData()
    const decision = useDecisionStages()
    const [sheetOpen, setSheetOpen] = useState(false)
    const [showFriends, setShowFriends] = useState(false)
    const stage = decision.stages.find(s => s.key === stageKey)

    if (!stage) {
        return (
            <div className="text-gray-5 py-40 text-center">
                투표 단계를 불러오는 중입니다.
            </div>
        )
    }

    const stagePathFor = (key: StageKey) =>
        isGuest && shareLinkToken
            ? `/meal-plan-links/${shareLinkToken}/session/decision/${key}`
            : `/meal-plans/${mealPlanId}/decision/${key}`
    const canVote = permissions?.canVote ?? false
    const provisionalArea = decision.provisionalByKey.area
    const provisionalMenu = decision.provisionalByKey.menu
    const hasRestaurantProvisionContext =
        provisionalArea?.stageType === 'AREA' &&
        provisionalMenu?.stageType === 'MENU'


    const panel = (() => {
        switch (stageKey) {
            case 'date':
                return (
                    <DateVotePanel
                        mealPlanId={mealPlanId}
                        stage={stage}
                        canVote={canVote}
                    />
                )
            case 'time':
                return (
                    <TimeVotePanel
                        mealPlanId={mealPlanId}
                        stage={stage}
                        canVote={canVote}
                    />
                )
            case 'area':
                return (
                    <AreaVotePanel
                        mealPlanId={mealPlanId}
                        stage={stage}
                        canVote={canVote}
                    />
                )
            case 'menu':
                return (
                    <MenuVotePanel
                        mealPlanId={mealPlanId}
                        stage={stage}
                        canVote={canVote}
                    />
                )
            case 'restaurant':
                return (
                    <RestaurantVotePanel
                        mealPlanId={mealPlanId}
                        stage={stage}
                        canVote={canVote}
                        areaDecided={hasRestaurantProvisionContext}
                        areaName={
                            provisionalArea?.stageType === 'AREA'
                                ? provisionalArea.value.placeName
                                : undefined
                        }
                        menuName={
                            provisionalMenu?.stageType === 'MENU'
                                ? provisionalMenu.value.menu.label
                                : undefined
                        }
                    />
                )
        }
    })()

    const registerSheet = (() => {
        const base = {
            mealPlanId,
            stageId: stage.stageId,
            open: sheetOpen,
            persistent: true,
            onOpen: () => setSheetOpen(true),
            onClose: () => setSheetOpen(false)
        }
        switch (stageKey) {
            case 'date':
                return <DateRegisterSheet {...base} />
            case 'time':
                return <TimeRegisterSheet {...base} />
            case 'area':
                return <AreaRegisterSheet {...base} />
            case 'menu':
                return (
                    <MenuRegisterSheet
                        {...base}
                        stage={stage}
                    />
                )
            case 'restaurant':
                return (
                    <RestaurantRegisterSheet
                        {...base}
                        areaContext={
                            provisionalArea?.stageType === 'AREA'
                                ? {
                                      latitude: provisionalArea.value.lat as number,
                                      longitude: provisionalArea.value.lng as number
                                  }
                                : mealPlan?.selectedArea
                                  ? {
                                        latitude: mealPlan.selectedArea.lat as number,
                                        longitude: mealPlan.selectedArea.lng as number
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
                stagePathFor={stagePathFor}
                showChat={!isGuest}
                rightActions={
                    <button
                        type="button"
                        onClick={() => setShowFriends(true)}
                        className="grid h-34 w-34 place-items-center rounded-full bg-white"
                        aria-label="후보별 친구 투표">
                        <Glyph
                            name="people"
                            size={21}
                            color="var(--color-gray-7)"
                        />
                    </button>
                }>
                {panel}
            </DecisionShell>
            {registerSheet}
            {showFriends && (
                <FriendVotesSheet
                    stageType={STAGE_TYPE[stageKey]}
                    onClose={() => setShowFriends(false)}
                />
            )}
        </>
    )
}

function StageVotePage({ stageKey }: { stageKey: StageKey }) {
    return (
        <DecisionSessionProvider>
            <StageVoteContent stageKey={stageKey} />
        </DecisionSessionProvider>
    )
}

const isStageKey = (value: string | undefined): value is StageKey =>
    value === 'date' ||
    value === 'time' ||
    value === 'area' ||
    value === 'menu' ||
    value === 'restaurant'

export function MealPlanGuestStageVotePage() {
    const { stageKey } = useParams<{ stageKey: string }>()

    if (!isStageKey(stageKey)) {
        return (
            <div className="text-gray-5 py-40 text-center">
                존재하지 않는 투표 단계입니다.
            </div>
        )
    }

    return <StageVotePage stageKey={stageKey} />
}

export const MealPlanDateVotePage = () => <StageVotePage stageKey="date" />
export const MealPlanTimeVotePage = () => <StageVotePage stageKey="time" />
export const MealPlanAreaVotePage = () => <StageVotePage stageKey="area" />
export const MealPlanMenuVotePage = () => <StageVotePage stageKey="menu" />
export const MealPlanRestaurantVotePage = () => (
    <StageVotePage stageKey="restaurant" />
)
