/**
 * Candidate-register sheets, one per stage. Each adds a candidate by casting a
 * vote with the new candidate (the server materializes the candidate), reusing
 * the existing search fields, mappers, and `components/ui/calendar`.
 */
import { useState } from 'react'
import type { MealPlanDecisionCandidate } from '@kimdaegyu/babmukdang-shared/domain'
import { Calendar } from '@/components/ui/calendar'
import { FoodSearchField, PlaceSearchField } from '@/components/features/search'
import type {
    FoodSearchResult,
    PlaceSearchResult
} from '@/services/search'
import { useCreateMealPlanVote } from '@/apis'
import { DecisionSheet } from './DecisionSheet'
import { CheckGlyph } from './glyphs'
import {
    toAreaCandidate,
    toDateCandidate,
    toMenuCandidate,
    toRestaurantCandidate,
    toTimeCandidate
} from './candidateMappers'

type BaseProps = {
    mealPlanId: string
    stageId?: string
    onClose: () => void
}

function useAddCandidate(mealPlanId: string, stageId?: string) {
    const { mutate, isPending } = useCreateMealPlanVote()
    const add = (
        candidate: MealPlanDecisionCandidate,
        voteType: 'PICK' | 'PREFER' = 'PICK',
        onDone?: () => void
    ) => {
        if (!stageId) return
        mutate(
            { mealPlanId, stageId, body: { voteType, candidate } },
            { onSuccess: () => onDone?.() }
        )
    }
    return { add, isPending }
}

const toIsoDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
    ).padStart(2, '0')}`

/* ---------- DATE ---------- */
export function DateRegisterSheet({ mealPlanId, stageId, onClose }: BaseProps) {
    const { add, isPending } = useAddCandidate(mealPlanId, stageId)
    const [selected, setSelected] = useState<Date[]>([])

    const submit = () => {
        if (selected.length === 0) return
        // cast each picked day; close once the last resolves
        selected.forEach((d, i) =>
            add(
                toDateCandidate(toIsoDate(d)),
                'PICK',
                i === selected.length - 1 ? onClose : undefined
            )
        )
    }

    return (
        <DecisionSheet
            title="가능한 날 제안하기"
            hint="내가 되는 날을 눌러 후보로 올려요. 여러 날 한 번에 제안할 수 있어요."
            cta={
                selected.length > 0
                    ? `${selected.length}일 후보로 제안`
                    : '날짜를 선택하세요'
            }
            ctaDisabled={selected.length === 0 || isPending}
            onCta={submit}
            onClose={onClose}>
            <div className="no-drag flex justify-center">
                <Calendar
                    mode="multiple"
                    selected={selected}
                    onSelect={days => setSelected(days ?? [])}
                />
            </div>
        </DecisionSheet>
    )
}

/* ---------- TIME ---------- */
const LUNCH = ['11:30', '12:00', '12:30', '13:00']
const DINNER = ['18:00', '18:30', '19:00', '19:30']

export function TimeRegisterSheet({ mealPlanId, stageId, onClose }: BaseProps) {
    const { add, isPending } = useAddCandidate(mealPlanId, stageId)
    const [picked, setPicked] = useState<string[]>([])
    const toggle = (t: string) =>
        setPicked(prev =>
            prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
        )

    const submit = () => {
        if (picked.length === 0) return
        picked.forEach((t, i) =>
            add(
                toTimeCandidate(t),
                'PICK',
                i === picked.length - 1 ? onClose : undefined
            )
        )
    }

    const Group = ({ label, slots }: { label: string; slots: string[] }) => (
        <div>
            <span
                style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: 'var(--color-gray-4)'
                }}>
                {label}
            </span>
            <div className="flex flex-wrap" style={{ gap: 8, marginTop: 8 }}>
                {slots.map(t => {
                    const on = picked.includes(t)
                    return (
                        <button
                            key={t}
                            type="button"
                            onClick={() => toggle(t)}
                            className="inline-flex items-center"
                            style={{
                                gap: 5,
                                padding: '9px 14px',
                                borderRadius: 9999,
                                fontSize: 13.5,
                                fontWeight: 700,
                                background: on
                                    ? 'var(--color-primary-main)'
                                    : 'var(--color-white)',
                                color: on ? '#fff' : 'var(--color-gray-6)',
                                border: on
                                    ? 'none'
                                    : '1px solid var(--color-gray-2)'
                            }}>
                            {on && <CheckGlyph size={13} color="#fff" />}
                            {t}
                        </button>
                    )
                })}
            </div>
        </div>
    )

    return (
        <DecisionSheet
            title="시간대 추가"
            hint="가능한 시간대를 골라 후보로 올려요."
            cta={picked.length > 0 ? `${picked.length}개 시간대 추가` : '시간대를 선택하세요'}
            ctaDisabled={picked.length === 0 || isPending}
            onCta={submit}
            onClose={onClose}>
            <Group label="점심" slots={LUNCH} />
            <Group label="저녁" slots={DINNER} />
        </DecisionSheet>
    )
}

/* ---------- AREA ---------- */
export function AreaRegisterSheet({ mealPlanId, stageId, onClose }: BaseProps) {
    const { add } = useAddCandidate(mealPlanId, stageId)
    const onSelect = (place: PlaceSearchResult) =>
        add(toAreaCandidate(place), 'PICK', onClose)

    return (
        <DecisionSheet
            title="지역 추가"
            hint="검색해서 만날 동네를 후보로 올려요."
            onClose={onClose}>
            <PlaceSearchField
                label="지역 검색"
                placeholder="역, 동네, 만날 지점 검색"
                onSelect={onSelect}
            />
        </DecisionSheet>
    )
}

/* ---------- MENU ---------- */
export function MenuRegisterSheet({ mealPlanId, stageId, onClose }: BaseProps) {
    const { add } = useAddCandidate(mealPlanId, stageId)
    const onSelect = (food: FoodSearchResult) =>
        add(toMenuCandidate(food), 'PREFER', onClose)

    return (
        <DecisionSheet
            title="메뉴 후보 추가"
            hint="참여자 취향(좋아요·못먹어요)을 반영해 추천해요."
            onClose={onClose}>
            <FoodSearchField
                label="먹고 싶은 메뉴"
                placeholder="메뉴 검색"
                onSelect={onSelect}
            />
        </DecisionSheet>
    )
}

/* ---------- RESTAURANT ---------- */
export function RestaurantRegisterSheet({
    mealPlanId,
    stageId,
    onClose,
    areaContext
}: BaseProps & {
    areaContext?: { latitude: number; longitude: number }
}) {
    const { add } = useAddCandidate(mealPlanId, stageId)
    const onSelect = (place: PlaceSearchResult) =>
        add(toRestaurantCandidate(place), 'PICK', onClose)

    return (
        <DecisionSheet
            title="식당 추가"
            hint="정해진 지역 근처 식당을 검색해 후보로 올려요."
            onClose={onClose}>
            <PlaceSearchField
                label="식당 검색"
                placeholder="식당 이름 검색"
                context={
                    areaContext
                        ? {
                              latitude: areaContext.latitude,
                              longitude: areaContext.longitude,
                              radius: 1000,
                              sort: 'distance'
                          }
                        : undefined
                }
                onSelect={onSelect}
            />
        </DecisionSheet>
    )
}
