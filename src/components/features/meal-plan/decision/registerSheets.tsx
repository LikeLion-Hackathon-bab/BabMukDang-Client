/** Persistent candidate-entry sheets. Candidate mutations remain normal votes so
 * the server owns materialization and all viewers receive the same stage data. */
import { useMemo, useState, type ReactNode } from 'react'
import type {
    MealPlanDecisionCandidate,
    MealPlanVoteType
} from '@kimdaegyu/babmukdang-shared/domain'
import { Calendar } from '@/components/ui/calendar'
import { FoodSearchField, PlaceSearchField } from '@/components/features/search'
import { KakaoMap, ThumbImg } from '@/components/features/onboarding'
import type { FoodSearchResult, PlaceSearchResult } from '@/services/search'
import { useMealPlanDecisionVote } from '@/socket/useMealPlanDecisionVote'
import { DecisionSheet } from './DecisionSheet'
import { CheckGlyph } from './glyphs'
import type { StageView } from './useDecisionStages'
import {
    toAreaCandidate,
    toDateCandidate,
    toMapMarkerAreaCandidate,
    toMenuCandidate,
    toRestaurantCandidate,
    toTimeCandidate
} from './candidateMappers'

type BaseProps = {
    mealPlanId: string
    stageId?: string
    onClose: () => void
    open?: boolean
    persistent?: boolean
    onOpen?: () => void
}

const sheetProps = (props: BaseProps) => ({
    open: props.open,
    persistent: props.persistent,
    onOpen: props.onOpen
})

function useAddCandidate(mealPlanId: string, stageId?: string) {
    const { mutate, isPending } = useMealPlanDecisionVote()
    const add = (
        candidate: MealPlanDecisionCandidate,
        voteType: Extract<
            MealPlanVoteType,
            'PICK' | 'PREFER' | 'EXCLUDE'
        > = 'PICK',
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

const TabButton = ({
    active,
    children,
    onClick
}: {
    active: boolean
    children: ReactNode
    onClick: () => void
}) => (
    <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        style={{
            flex: 1,
            border: 'none',
            borderBottom: active
                ? '2px solid var(--color-primary-main)'
                : '2px solid transparent',
            background: 'transparent',
            color: active ? 'var(--color-primary-main)' : 'var(--color-gray-5)',
            fontSize: 13,
            fontWeight: 700,
            padding: '10px 4px'
        }}>
        {children}
    </button>
)

/* ---------- DATE ---------- */
export function DateRegisterSheet(props: BaseProps) {
    const { mealPlanId, stageId, onClose } = props
    const { add, isPending } = useAddCandidate(mealPlanId, stageId)
    const [selected, setSelected] = useState<Date[]>([])
    const submit = () => {
        if (selected.length === 0) return
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
            {...sheetProps(props)}
            title="가능한 날 제안하기"
            hint="내가 되는 날을 눌러 후보로 올려요. 여러 날을 한 번에 제안할 수 있어요."
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

export function TimeRegisterSheet(props: BaseProps) {
    const { mealPlanId, stageId, onClose } = props
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
            <div
                className="flex flex-wrap"
                style={{ gap: 8, marginTop: 8 }}>
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
                            {on && (
                                <CheckGlyph
                                    size={13}
                                    color="#fff"
                                />
                            )}
                            {t}
                        </button>
                    )
                })}
            </div>
        </div>
    )
    return (
        <DecisionSheet
            {...sheetProps(props)}
            title="시간대 추가"
            hint="가능한 시간대를 골라 후보로 올려요."
            cta={
                picked.length > 0
                    ? `${picked.length}개 시간대 추가`
                    : '시간대를 선택하세요'
            }
            ctaDisabled={picked.length === 0 || isPending}
            onCta={submit}
            onClose={onClose}>
            <Group
                label="점심"
                slots={LUNCH}
            />
            <Group
                label="저녁"
                slots={DINNER}
            />
        </DecisionSheet>
    )
}

/* ---------- AREA ---------- */
export function AreaRegisterSheet(props: BaseProps) {
    const { mealPlanId, stageId, onClose } = props
    const { add, isPending } = useAddCandidate(mealPlanId, stageId)
    const [tab, setTab] = useState<'map' | 'search'>('map')
    const [marker, setMarker] = useState<{
        lat: number
        lng: number
        address: string
    } | null>(null)
    const onSelect = (place: PlaceSearchResult) =>
        add(toAreaCandidate(place), 'PICK', onClose)
    const submitMarker = () => {
        if (!marker) return
        add(toMapMarkerAreaCandidate(marker), 'PICK', onClose)
    }
    return (
        <DecisionSheet
            {...sheetProps(props)}
            title="지역 후보 추가"
            hint="지도에서 직접 찍거나 장소를 검색해서 만날 지점을 만들어요."
            cta={
                tab === 'map'
                    ? marker
                        ? '선택한 위치를 후보로 추가'
                        : '지도에서 위치를 선택하세요'
                    : undefined
            }
            ctaDisabled={tab === 'map' && (!marker || isPending)}
            onCta={tab === 'map' ? submitMarker : undefined}
            onClose={onClose}>
            <div
                className="no-drag flex"
                role="tablist"
                aria-label="지역 후보 추가 방식"
                style={{ borderBottom: '1px solid var(--color-gray-2)' }}>
                <TabButton
                    active={tab === 'map'}
                    onClick={() => setTab('map')}>
                    지도에서 마커로 추가
                </TabButton>
                <TabButton
                    active={tab === 'search'}
                    onClick={() => setTab('search')}>
                    검색해서 추가
                </TabButton>
            </div>
            {tab === 'map' ? (
                <div
                    className="no-drag"
                    style={{ display: 'grid', gap: 8 }}>
                    <KakaoMap
                        width="100%"
                        height="240px"
                        onLocationSelect={(lat, lng, address) =>
                            setMarker({ lat, lng, address })
                        }
                    />
                    <span
                        style={{
                            fontSize: 12,
                            color: 'var(--color-gray-5)'
                        }}>
                        {marker
                            ? marker.address
                            : '지도를 눌러 마커를 놓아 주세요.'}
                    </span>
                </div>
            ) : (
                <PlaceSearchField
                    label="지역 검색"
                    placeholder="역, 동네, 만날 지점 검색"
                    onSelect={onSelect}
                />
            )}
        </DecisionSheet>
    )
}

const Thumb = ({ candidate }: { candidate: MealPlanDecisionCandidate }) => {
    if (candidate.stageType !== 'MENU') return null
    const { menu, imageUrl, image } = candidate.value
    const item = {
        name: menu.label,
        imageUrl: image?.src ?? imageUrl ?? undefined,
        aspectRatio: image?.aspectRatio,
        images: image?.avifSrcset
            ? {
                  src: image.src,
                  avifSrcset: image.avifSrcset,
                  sizes: '48px'
              }
            : undefined,
        placeholder: image?.thumbhashDataURL
            ? { thumbhashDataURL: image.thumbhashDataURL }
            : undefined
    }
    return (
        <ThumbImg
            item={item}
            size={48}
            onClick={() => undefined}
        />
    )
}

const MenuActions = ({
    candidate,
    onAction,
    disabled
}: {
    candidate: MealPlanDecisionCandidate
    onAction: (
        type: Extract<MealPlanVoteType, 'PICK' | 'PREFER' | 'EXCLUDE'>
    ) => void
    disabled?: boolean
}) => {
    if (candidate.stageType !== 'MENU') return null
    const actions: Array<{
        label: string
        type: Extract<MealPlanVoteType, 'PICK' | 'PREFER' | 'EXCLUDE'>
    }> = [
        { label: '선호 메뉴로 추가', type: 'PREFER' },
        { label: '불호 메뉴로 추가', type: 'EXCLUDE' },
        { label: '투표 후보로 추가', type: 'PICK' }
    ]
    return (
        <div
            className="flex flex-wrap"
            style={{ gap: 6 }}>
            {actions.map(action => (
                <button
                    key={action.type}
                    type="button"
                    disabled={disabled}
                    onClick={() => onAction(action.type)}
                    style={{
                        border: '1px solid var(--color-gray-2)',
                        borderRadius: 9999,
                        background: 'var(--color-white)',
                        color: 'var(--color-gray-7)',
                        padding: '7px 10px',
                        fontSize: 11.5,
                        fontWeight: 700,
                        opacity: disabled ? 0.5 : 1
                    }}>
                    {action.label}
                </button>
            ))}
        </div>
    )
}

/* ---------- MENU ---------- */
export function MenuRegisterSheet(props: BaseProps & { stage?: StageView }) {
    const { mealPlanId, stageId, onClose, stage } = props
    const { add, isPending } = useAddCandidate(mealPlanId, stageId)
    const [tab, setTab] = useState<'search' | 'recent'>('search')
    const [selected, setSelected] = useState<FoodSearchResult | null>(null)
    const searchCandidate = useMemo(
        () => (selected ? toMenuCandidate(selected) : null),
        [selected]
    )
    const recentCandidates = (stage?.candidates ?? [])
        .map(item => item.candidate)
        .filter(
            (
                candidate
            ): candidate is Extract<
                MealPlanDecisionCandidate,
                { stageType: 'MENU' }
            > =>
                candidate.stageType === 'MENU' &&
                candidate.value.source === 'recent-menu'
        )
    const action = (
        candidate: MealPlanDecisionCandidate,
        type: Extract<MealPlanVoteType, 'PICK' | 'PREFER' | 'EXCLUDE'>
    ) => add(candidate, type, onClose)
    return (
        <DecisionSheet
            {...sheetProps(props)}
            title="메뉴 후보 추가"
            hint="검색한 음식 또는 참여자가 최근 먹은 메뉴를 취향·불호·투표 후보로 반영해요."
            onClose={onClose}>
            <div
                className="no-drag flex"
                role="tablist"
                aria-label="메뉴 후보 추가 방식"
                style={{ borderBottom: '1px solid var(--color-gray-2)' }}>
                <TabButton
                    active={tab === 'search'}
                    onClick={() => setTab('search')}>
                    음식 검색
                </TabButton>
                <TabButton
                    active={tab === 'recent'}
                    onClick={() => setTab('recent')}>
                    최근 먹은 메뉴
                </TabButton>
            </div>
            {tab === 'search' ? (
                <div
                    className="no-drag"
                    style={{ display: 'grid', gap: 12 }}>
                    <FoodSearchField
                        label="음식 검색"
                        placeholder="먹고 싶은 메뉴를 검색"
                        onSelect={food => setSelected(food)}
                    />
                    {searchCandidate?.stageType === 'MENU' && (
                        <div
                            className="flex items-center"
                            style={{
                                gap: 10,
                                padding: 10,
                                border: '1px solid var(--color-gray-2)',
                                borderRadius: 12
                            }}>
                            <Thumb candidate={searchCandidate} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <strong
                                    style={{
                                        fontSize: 14,
                                        color: 'var(--color-gray-8)'
                                    }}>
                                    {searchCandidate.value.menu.label}
                                </strong>
                                <div style={{ marginTop: 7 }}>
                                    <MenuActions
                                        candidate={searchCandidate}
                                        disabled={isPending}
                                        onAction={type =>
                                            action(searchCandidate, type)
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div
                    className="no-drag"
                    style={{ display: 'grid', gap: 8 }}>
                    {recentCandidates.length === 0 ? (
                        <p
                            style={{
                                margin: 0,
                                padding: '12px 0',
                                fontSize: 12,
                                color: 'var(--color-gray-5)'
                            }}>
                            최근 먹은 메뉴가 아직 없어요. 음식 검색 탭에서
                            추가해 보세요.
                        </p>
                    ) : (
                        recentCandidates.map(candidate => (
                            <div
                                key={candidate.value.menuCandidateId}
                                className="flex items-center"
                                style={{
                                    gap: 10,
                                    padding: 10,
                                    border: '1px solid var(--color-gray-2)',
                                    borderRadius: 12
                                }}>
                                <Thumb candidate={candidate} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <strong
                                        style={{
                                            display: 'block',
                                            fontSize: 14,
                                            color: 'var(--color-gray-8)'
                                        }}>
                                        {candidate.value.menu.label}
                                    </strong>
                                    <div style={{ marginTop: 7 }}>
                                        <MenuActions
                                            candidate={candidate}
                                            disabled={isPending}
                                            onAction={type =>
                                                action(candidate, type)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </DecisionSheet>
    )
}

/* ---------- RESTAURANT ---------- */
export function RestaurantRegisterSheet({
    mealPlanId,
    stageId,
    onClose,
    ...sheet
}: BaseProps & {
    areaContext?: { latitude: number; longitude: number }
}) {
    const { add } = useAddCandidate(mealPlanId, stageId)
    const onSelect = (place: PlaceSearchResult) =>
        add(toRestaurantCandidate(place), 'PICK', onClose)
    return (
        <DecisionSheet
            {...sheetProps({ mealPlanId, stageId, onClose, ...sheet })}
            title="식당 추가"
            hint="정해진 지역 근처 식당을 검색해 후보로 올려요."
            onClose={onClose}>
            <PlaceSearchField
                label="식당 검색"
                placeholder="식당 이름 검색"
                context={
                    sheet.areaContext
                        ? {
                              latitude: sheet.areaContext.latitude,
                              longitude: sheet.areaContext.longitude,
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
