/**
 * Final confirmation prompt + confirmed state.
 * - FinalConfirmPanel: agreement summary + owner "최종 확정하기" (useConfirmMealPlan).
 * - FinalDonePanel: post-confirm success view with the confirmed meal plan.
 *
 * The per-stage owner snapshot-confirm / change-request / reopen affordances from
 * the old workflow panel are intentionally dropped per the redesign (reported to
 * the user); confirmation is a single owner action here.
 */
import { useTabNavigation } from '@/navigation/useTabNavigation'
import type { MealPlanResponse } from '@kimdaegyu/babmukdang-shared/domain'
import { useConfirmMealPlan } from '@/apis'
import {
    AvatarStack,
    Card,
    InlineBanner,
    StatusBadge,
    type AvatarPerson
} from './atoms'
import { CheckGlyph, Glyph, type GlyphName } from './glyphs'
import {
    formatDateLabel,
    formatTimeLabel,
    type DecisionView
} from './useDecisionStages'

function summaryLines(mealPlan: MealPlanResponse) {
    const lines: { icon: GlyphName; label: string; value: string }[] = []
    if (mealPlan.selectedDate)
        lines.push({
            icon: 'calendar',
            label: '날짜',
            value: formatDateLabel(mealPlan.selectedDate)
        })
    if (mealPlan.selectedTime)
        lines.push({
            icon: 'time',
            label: '시간',
            value: formatTimeLabel(mealPlan.selectedTime)
        })
    if (mealPlan.selectedArea?.placeName)
        lines.push({
            icon: 'location',
            label: '지역',
            value: mealPlan.selectedArea.placeName
        })
    if (mealPlan.selectedMenuCategory)
        lines.push({
            icon: 'dish',
            label: '메뉴',
            value: mealPlan.selectedMenuCategory
        })
    if (mealPlan.selectedRestaurant?.placeName)
        lines.push({
            icon: 'meeting',
            label: '식당',
            value: mealPlan.selectedRestaurant.placeName
        })
    return lines
}

export function FinalConfirmPanel({
    mealPlan,
    isOwner,
    canConfirm,
    decision
}: {
    mealPlan: MealPlanResponse
    isOwner: boolean
    canConfirm: boolean
    decision: DecisionView
}) {
    const { mutate: confirm, isPending } = useConfirmMealPlan()
    const lines = summaryLines(mealPlan)
    const allReady =
        decision.participantCount > 0 &&
        decision.readyCount >= decision.participantCount
    const people: AvatarPerson[] = decision.participants

    return (
        <div className="flex min-h-full flex-col">
            <div
                className="flex flex-col"
                style={{ flex: 1, padding: 16, gap: 13 }}>
                <Card
                    tint
                    pad={14}>
                    <div
                        className="flex items-center"
                        style={{ gap: 7 }}>
                        <CheckGlyph
                            size={16}
                            color="var(--color-primary-main)"
                        />
                        <span
                            style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: 'var(--color-primary-main)'
                            }}>
                            {allReady ? '모두 합의했어요' : '준비 중'} ·{' '}
                            {decision.readyCount}/{decision.participantCount}명
                            준비됨
                        </span>
                    </div>
                    <div style={{ marginTop: 9 }}>
                        <AvatarStack
                            people={people}
                            size={26}
                        />
                    </div>
                </Card>
                <Card pad={16}>
                    {lines.length === 0 ? (
                        <span
                            style={{
                                fontSize: 12.5,
                                color: 'var(--color-gray-5)'
                            }}>
                            아직 정해진 항목이 없어요.
                        </span>
                    ) : (
                        lines.map((line, i) => (
                            <div key={line.label}>
                                {i > 0 && (
                                    <div
                                        style={{
                                            height: 1,
                                            background: 'var(--color-gray-1)'
                                        }}
                                    />
                                )}
                                <div
                                    className="flex items-center"
                                    style={{ gap: 11, padding: '11px 0' }}>
                                    <Glyph
                                        name={line.icon}
                                        size={18}
                                        color="var(--color-gray-4)"
                                    />
                                    <span
                                        style={{
                                            fontSize: 12.5,
                                            color: 'var(--color-gray-5)',
                                            width: 40
                                        }}>
                                        {line.label}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: 'var(--color-gray-8)'
                                        }}>
                                        {line.value}
                                    </span>
                                    <span style={{ marginLeft: 'auto' }}>
                                        <CheckGlyph
                                            size={15}
                                            color="#1f8a5b"
                                        />
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </Card>
                <InlineBanner
                    tone="gray"
                    icon="modify"
                    title="확정하면 일정·식당이 잠겨요"
                    body="확정 후에는 당일 기록으로 이어져요."
                />
            </div>
            <div
                className="flex items-center"
                style={{
                    flex: 'none',
                    padding: 16,
                    background: 'var(--color-white)',
                    borderTop: '1px solid var(--color-gray-2)',
                    gap: 10,
                    position: 'sticky',
                    bottom: 0
                }}>
                {isOwner ? (
                    <button
                        type="button"
                        disabled={!canConfirm || isPending}
                        onClick={() => confirm(mealPlan.mealPlanId)}
                        style={{
                            flex: 1,
                            height: 48,
                            borderRadius: 9999,
                            border: 'none',
                            background: 'var(--color-primary-main)',
                            color: '#fff',
                            fontSize: 15,
                            fontWeight: 700,
                            opacity: !canConfirm || isPending ? 0.5 : 1
                        }}>
                        {isPending ? '확정하는 중…' : '최종 확정하기'}
                    </button>
                ) : (
                    <div
                        className="flex w-full items-center justify-center"
                        style={{
                            height: 48,
                            borderRadius: 9999,
                            background: 'var(--color-gray-1)',
                            color: 'var(--color-gray-5)',
                            fontSize: 14,
                            fontWeight: 700
                        }}>
                        소유자가 확정하면 알림을 받아요
                    </div>
                )}
            </div>
        </div>
    )
}

export function FinalDonePanel({
    mealPlan,
    decision
}: {
    mealPlan: MealPlanResponse
    decision: DecisionView
}) {
    const navigateTab = useTabNavigation()
    const dateTime = [
        mealPlan.selectedDate ? formatDateLabel(mealPlan.selectedDate) : '',
        mealPlan.selectedTime ? formatTimeLabel(mealPlan.selectedTime) : ''
    ]
        .filter(Boolean)
        .join(' ')
    const place =
        mealPlan.selectedRestaurant?.placeName ??
        mealPlan.selectedArea?.placeName ??
        '장소 미정'

    return (
        <div className="flex min-h-full flex-col">
            <div
                className="flex flex-col"
                style={{ flex: 1, padding: 16, gap: 14 }}>
                <div
                    className="flex flex-col items-center"
                    style={{
                        textAlign: 'center',
                        gap: 10,
                        padding: '18px 16px 2px'
                    }}>
                    <div
                        style={{
                            width: 72,
                            height: 72,
                            borderRadius: 9999,
                            background: 'var(--color-primary-main)',
                            display: 'grid',
                            placeItems: 'center'
                        }}>
                        <CheckGlyph
                            size={36}
                            color="#fff"
                        />
                    </div>
                    <div
                        style={{
                            fontSize: 21,
                            fontWeight: 700,
                            color: 'var(--color-gray-8)'
                        }}>
                        밥약이 확정됐어요!
                    </div>
                    <div
                        style={{
                            fontSize: 13,
                            color: 'var(--color-gray-5)',
                            lineHeight: 1.5,
                            maxWidth: 270
                        }}>
                        참여자 모두에게 알림을 보냈어요. 당일엔 사진 기록으로
                        이어가요.
                    </div>
                </div>
                <Card
                    pad={14}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 9
                    }}>
                    <div
                        className="flex items-center"
                        style={{ gap: 8 }}>
                        <StatusBadge status={mealPlan.status} />
                        <span
                            style={{
                                fontSize: 16,
                                fontWeight: 700,
                                color: 'var(--color-gray-8)'
                            }}>
                            {place}
                        </span>
                    </div>
                    <div
                        className="flex items-center"
                        style={{
                            gap: 7,
                            fontSize: 13,
                            color: 'var(--color-gray-6)',
                            fontWeight: 500
                        }}>
                        <Glyph
                            name="calendar"
                            size={15}
                            color="var(--color-gray-4)"
                        />
                        {dateTime || '시간 미정'}
                    </div>
                    {mealPlan.selectedArea?.placeName && (
                        <div
                            className="flex items-center"
                            style={{
                                gap: 7,
                                fontSize: 13,
                                color: 'var(--color-gray-6)',
                                fontWeight: 500
                            }}>
                            <Glyph
                                name="location"
                                size={15}
                                color="var(--color-gray-4)"
                            />
                            {mealPlan.selectedArea.placeName}
                        </div>
                    )}
                    <div style={{ marginTop: 3 }}>
                        <AvatarStack
                            people={decision.participants}
                            size={26}
                        />
                    </div>
                </Card>
            </div>
            <div
                className="flex"
                style={{
                    flex: 'none',
                    padding: 16,
                    background: 'var(--color-white)',
                    borderTop: '1px solid var(--color-gray-2)',
                    gap: 10,
                    position: 'sticky',
                    bottom: 0
                }}>
                <button
                    type="button"
                    onClick={() =>
                        navigateTab(
                            `/meal-plans/${mealPlan.mealPlanId}/decision/chat`
                        )
                    }
                    style={{
                        flex: 'none',
                        width: 92,
                        height: 48,
                        borderRadius: 9999,
                        border: '1px solid var(--color-gray-2)',
                        background: '#fff',
                        color: 'var(--color-gray-6)',
                        fontSize: 14,
                        fontWeight: 700
                    }}>
                    채팅
                </button>
                <button
                    type="button"
                    onClick={() =>
                        navigateTab(
                            `/meal-plans/${mealPlan.mealPlanId}/decision`
                        )
                    }
                    style={{
                        flex: 1,
                        height: 48,
                        borderRadius: 9999,
                        border: 'none',
                        background: 'var(--color-primary-main)',
                        color: '#fff',
                        fontSize: 15,
                        fontWeight: 700
                    }}>
                    밥약방으로 가기
                </button>
            </div>
        </div>
    )
}
