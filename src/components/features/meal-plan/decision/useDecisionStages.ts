/**
 * Derives the redesign's stage/candidate view-model from the live store
 * (`decisionStages`, `participants`, `current`). Pure selectors — no fetching;
 * the page wraps everything in SocketProvider + useMealPlanDetail already.
 */
import { useMemo } from 'react'
import type {
    MealPlanDecisionCandidate,
    MealPlanDecisionStageResponse,
    MealPlanDecisionStageType,
    MealPlanParticipantResponse,
    MealPlanVote
} from '@kimdaegyu/babmukdang-shared/domain'
import { useMealPlanStore } from '@/store'
import { useAuthStore } from '@/store/authStore'
import type { AvatarPerson, VoteState } from './atoms'

export type StageKey = 'date' | 'time' | 'area' | 'menu' | 'restaurant'
export type BoardState = 'decided' | 'live' | 'open' | 'locked'

export const STAGE_DEFS: {
    key: StageKey
    type: MealPlanDecisionStageType
    label: string
}[] = [
    { key: 'date', type: 'DATE', label: '날짜' },
    { key: 'time', type: 'TIME', label: '시간' },
    { key: 'area', type: 'AREA', label: '지역' },
    { key: 'menu', type: 'MENU', label: '메뉴' },
    { key: 'restaurant', type: 'RESTAURANT', label: '식당' }
]

const KO_DOW = ['일', '월', '화', '수', '목', '금', '토']

export function formatDateLabel(iso: string): string {
    const d = new Date(`${iso}T00:00:00`)
    if (Number.isNaN(d.getTime())) return iso
    return `${d.getMonth() + 1}/${d.getDate()} (${KO_DOW[d.getDay()]})`
}

export function formatTimeLabel(hhmm: string): string {
    const [h, m] = hhmm.split(':')
    const hour = Number(h)
    if (Number.isNaN(hour)) return hhmm
    const period = hour < 11 ? '아침' : hour < 15 ? '점심' : hour < 18 ? '오후' : '저녁'
    return `${period} ${hhmm}`
}

export function candidateLabel(candidate: MealPlanDecisionCandidate): string {
    switch (candidate.stageType) {
        case 'DATE':
            return formatDateLabel(candidate.value)
        case 'TIME':
            return formatTimeLabel(candidate.value)
        case 'AREA':
            return candidate.value.placeName
        case 'MENU':
            return candidate.value.menu.label
        case 'RESTAURANT':
            return candidate.value.placeName
        default:
            return ''
    }
}

export function candidateCategory(
    candidate: MealPlanDecisionCandidate
): string | undefined {
    if (candidate.stageType === 'RESTAURANT')
        return candidate.value.categoryGroupName || candidate.value.categoryName
    return undefined
}

export function candidateSource(
    candidate: MealPlanDecisionCandidate
): string | undefined {
    if (
        candidate.stageType === 'AREA' ||
        candidate.stageType === 'MENU' ||
        candidate.stageType === 'RESTAURANT'
    )
        return candidate.value.source
    return undefined
}

const candidateKey = (candidate: MealPlanDecisionCandidate) =>
    JSON.stringify(candidate)

export interface CandidateView {
    key: string
    candidate: MealPlanDecisionCandidate
    label: string
    category?: string
    source?: string
    voteCount: number
    preferCount: number
    excludeCount: number
    pickers: AvatarPerson[]
    myState: VoteState
    selected: boolean
    isMine: boolean
}

export interface StageView {
    key: StageKey
    type: MealPlanDecisionStageType
    label: string
    stageId?: string
    boardState: BoardState
    selectedLabel?: string
    candidates: CandidateView[]
    tie: boolean
}

export function participantPerson(
    p: MealPlanParticipantResponse
): AvatarPerson {
    return {
        name: p.member?.username ?? p.guest?.nickname ?? '게스트',
        imageUrl: p.member?.profileImageUrl ?? null,
        ready: p.status === 'READY'
    }
}

function buildVoterLookup(participants: MealPlanParticipantResponse[]) {
    const byMember = new Map<string, MealPlanParticipantResponse>()
    const byGuest = new Map<string, MealPlanParticipantResponse>()
    for (const p of participants) {
        if (p.member) byMember.set(String(p.member.memberId), p)
        if (p.guest) byGuest.set(p.guest.guestId, p)
    }
    return { byMember, byGuest }
}

function votePerson(
    vote: MealPlanVote,
    lookup: ReturnType<typeof buildVoterLookup>
): AvatarPerson | null {
    const p = vote.voterId
        ? lookup.byMember.get(String(vote.voterId))
        : vote.guestId
          ? lookup.byGuest.get(vote.guestId)
          : null
    return p ? participantPerson(p) : null
}

function buildCandidates(
    stage: MealPlanDecisionStageResponse,
    participants: MealPlanParticipantResponse[],
    viewerId: string | null
): CandidateView[] {
    const lookup = buildVoterLookup(participants)
    const selectedKey = stage.selectedCandidate
        ? candidateKey(stage.selectedCandidate)
        : null

    return stage.candidates.map(candidate => {
        const key = candidateKey(candidate)
        const votes = stage.votes.filter(v => candidateKey(v.candidate) === key)
        const preferCount = votes.filter(v => v.voteType === 'PREFER').length
        const pickCount = votes.filter(v => v.voteType === 'PICK').length
        const excludeCount = votes.filter(v => v.voteType === 'EXCLUDE').length
        const pickers = votes
            .filter(v => v.voteType !== 'EXCLUDE')
            .map(v => votePerson(v, lookup))
            .filter((x): x is AvatarPerson => x !== null)

        const myVotes = votes.filter(
            v => v.voterId != null && String(v.voterId) === viewerId
        )
        const myState: VoteState = myVotes.some(v => v.voteType === 'EXCLUDE')
            ? 'excluded'
            : myVotes.some(v => v.voteType === 'PICK')
              ? 'pick'
              : myVotes.some(v => v.voteType === 'PREFER')
                ? 'prefer'
                : undefined

        return {
            key,
            candidate,
            label: candidateLabel(candidate),
            category: candidateCategory(candidate),
            source: candidateSource(candidate),
            voteCount: preferCount + pickCount,
            preferCount,
            excludeCount,
            pickers,
            myState,
            selected: selectedKey === key,
            isMine: candidateSource(candidate) === 'prefer-menu'
        }
    })
}

function detectTie(candidates: CandidateView[]): boolean {
    const counts = candidates
        .map(c => c.voteCount)
        .filter(n => n > 0)
        .sort((a, b) => b - a)
    return counts.length >= 2 && counts[0] === counts[1] && counts[0] > 0
}

export interface DecisionView {
    stages: StageView[]
    statesByKey: Record<StageKey, BoardState>
    participants: AvatarPerson[]
    readyCount: number
    participantCount: number
}

export function useDecisionStages(): DecisionView {
    const decisionStages = useMealPlanStore(state => state.decisionStages)
    const storeParticipants = useMealPlanStore(state => state.participants)
    const current = useMealPlanStore(state => state.current)
    const readyCount = useMealPlanStore(state => state.readyCount)
    const participantCount = useMealPlanStore(state => state.participantCount)
    const viewerId = useAuthStore(state => state.userId)

    return useMemo(() => {
        const activeParticipants = storeParticipants.filter(p =>
            ['JOINED', 'READY'].includes(p.status)
        )
        const stageByType = new Map(
            decisionStages.map(stage => [stage.stageType, stage])
        )
        const areaDecided = Boolean(
            current?.selectedArea ||
                stageByType.get('AREA')?.selectedCandidate ||
                stageByType.get('AREA')?.status === 'COMPLETED'
        )

        const selectedLabelByKey: Partial<Record<StageKey, string>> = {
            date: current?.selectedDate
                ? formatDateLabel(current.selectedDate)
                : undefined,
            time: current?.selectedTime
                ? formatTimeLabel(current.selectedTime)
                : undefined,
            area: current?.selectedArea?.placeName ?? undefined,
            restaurant: current?.selectedRestaurant?.placeName ?? undefined,
            menu: current?.selectedMenuCategory ?? undefined
        }

        const stages: StageView[] = STAGE_DEFS.map(def => {
            const stage = stageByType.get(def.type)
            const candidates = stage
                ? buildCandidates(stage, activeParticipants, viewerId)
                : []
            const selectedLabel =
                selectedLabelByKey[def.key] ??
                (stage?.selectedCandidate
                    ? candidateLabel(stage.selectedCandidate)
                    : undefined)

            let boardState: BoardState
            if (def.key === 'restaurant' && !areaDecided) {
                boardState = 'locked'
            } else if (
                selectedLabel ||
                stage?.status === 'COMPLETED' ||
                stage?.selectedCandidate
            ) {
                boardState = 'decided'
            } else if (
                stage &&
                (candidates.length > 0 || stage.votes.length > 0)
            ) {
                boardState = 'live'
            } else {
                boardState = 'open'
            }

            return {
                key: def.key,
                type: def.type,
                label: def.label,
                stageId: stage?.stageId,
                boardState,
                selectedLabel,
                candidates,
                tie: detectTie(candidates)
            }
        })

        const statesByKey = stages.reduce(
            (acc, s) => {
                acc[s.key] = s.boardState
                return acc
            },
            {} as Record<StageKey, BoardState>
        )

        return {
            stages,
            statesByKey,
            participants: activeParticipants.map(participantPerson),
            readyCount,
            participantCount: participantCount || activeParticipants.length
        }
    }, [
        decisionStages,
        storeParticipants,
        current,
        readyCount,
        participantCount,
        viewerId
    ])
}
