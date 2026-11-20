import type { ChangeEvent } from 'react'
import { useState } from 'react'
import { useSearchController } from '@/services/search/react'
import type {
    FoodSearchResult,
    FriendSearchResult,
    PlaceSearchResult,
    SearchContext
} from '@/services/search'

const emptyClass = 'text-caption-regular text-gray-5'

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message
    if (typeof error === 'string') return error
    return '검색을 완료하지 못했습니다.'
}

export function FoodSearchField({
    label,
    placeholder = '메뉴를 검색해 주세요.',
    helperText,
    selected = [],
    onSelect,
    onRemove
}: {
    label: string
    placeholder?: string
    helperText?: string
    selected?: string[]
    onSelect: (food: FoodSearchResult) => void
    onRemove?: (name: string) => void
}) {
    const [input, setInput] = useState('')
    const search = useSearchController({ domains: ['food'] })
    const foodState = search.state.food

    const updateQuery = (event: ChangeEvent<HTMLInputElement>) => {
        const next = event.target.value
        setInput(next)
        search.setQuery(next)
    }

    const selectFood = (food: FoodSearchResult) => {
        onSelect(food)
        setInput('')
        search.clear()
    }

    return (
        <div className="flex flex-col gap-8">
            <label className="text-caption-medium text-gray-7 flex flex-col gap-6">
                {label}
                <input
                    value={input}
                    onChange={updateQuery}
                    className="rounded-14 bg-gray-1 px-12 py-10 outline-none"
                    placeholder={placeholder}
                />
            </label>
            {helperText && <p className={emptyClass}>{helperText}</p>}
            {selected.length > 0 && (
                <div className="flex flex-wrap gap-6">
                    {selected.map(name => (
                        <button
                            key={name}
                            type="button"
                            onClick={() => onRemove?.(name)}
                            className="bg-primary-100 text-caption-medium text-primary-main rounded-full px-10 py-5">
                            {name}
                            {onRemove ? ' ×' : ''}
                        </button>
                    ))}
                </div>
            )}
            {foodState.status === 'loading' && (
                <p className={emptyClass}>메뉴를 검색하고 있습니다.</p>
            )}
            {foodState.status === 'empty' && (
                <p className={emptyClass}>검색된 메뉴가 없습니다.</p>
            )}
            {foodState.status === 'error' && (
                <p className="text-caption-regular text-red-500">
                    {getErrorMessage(foodState.error)}
                </p>
            )}
            {foodState.results.length > 0 && (
                <div className="rounded-16 bg-gray-1 flex flex-col gap-6 p-8">
                    {foodState.results.slice(0, 8).map(food => (
                        <button
                            key={food.code}
                            type="button"
                            onClick={() => selectFood(food)}
                            className="rounded-12 bg-white px-12 py-9 text-left">
                            <span className="text-body2-semibold text-gray-8">
                                {food.label}
                            </span>
                            <span className="ml-6 text-caption-regular text-gray-5">{food.parentCategory}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export function FriendSearchField({
    label,
    placeholder = '친구 닉네임이나 handle을 검색해 주세요.',
    helperText,
    selected = [],
    excludedMemberIds = [],
    onSelect,
    onRemove
}: {
    label: string
    placeholder?: string
    helperText?: string
    selected?: FriendSearchResult[]
    excludedMemberIds?: Array<number | string>
    onSelect: (friend: FriendSearchResult) => void
    onRemove?: (friend: FriendSearchResult) => void
}) {
    const [input, setInput] = useState('')
    const search = useSearchController({ domains: ['friend'] })
    const friendState = search.state.friend
    const excludedSet = new Set(excludedMemberIds.map(String))

    const updateQuery = (event: ChangeEvent<HTMLInputElement>) => {
        const next = event.target.value
        setInput(next)
        search.setQuery(next)
    }

    const selectFriend = (friend: FriendSearchResult) => {
        onSelect(friend)
        setInput('')
        search.clear()
    }

    return (
        <div className="flex flex-col gap-8">
            <label className="text-caption-medium text-gray-7 flex flex-col gap-6">
                {label}
                <input
                    value={input}
                    onChange={updateQuery}
                    className="rounded-14 bg-gray-1 px-12 py-10 outline-none"
                    placeholder={placeholder}
                />
            </label>
            {helperText && <p className={emptyClass}>{helperText}</p>}
            {selected.length > 0 && (
                <div className="flex flex-wrap gap-6">
                    {selected.map(friend => (
                        <button
                            key={String(friend.memberId)}
                            type="button"
                            onClick={() => onRemove?.(friend)}
                            className="bg-primary-100 text-caption-medium text-primary-main rounded-full px-10 py-5">
                            {friend.nickname}
                            {onRemove ? ' ×' : ''}
                        </button>
                    ))}
                </div>
            )}
            {friendState.status === 'loading' && (
                <p className={emptyClass}>친구를 검색하고 있습니다.</p>
            )}
            {friendState.status === 'empty' && (
                <p className={emptyClass}>검색된 친구가 없습니다.</p>
            )}
            {friendState.status === 'error' && (
                <p className="text-caption-regular text-red-500">
                    {getErrorMessage(friendState.error)}
                </p>
            )}
            {friendState.results.length > 0 && (
                <div className="rounded-16 bg-gray-1 flex flex-col gap-6 p-8">
                    {friendState.results.slice(0, 8).map(friend => {
                        const disabled = excludedSet.has(
                            String(friend.memberId)
                        )
                        return (
                            <button
                                key={String(friend.memberId)}
                                type="button"
                                disabled={disabled}
                                onClick={() => selectFriend(friend)}
                                className="rounded-12 bg-white px-12 py-9 text-left disabled:opacity-45">
                                <span className="text-body2-semibold text-gray-8">
                                    {friend.nickname}
                                </span>
                                {friend.handle && (
                                    <span className="text-caption-regular text-gray-5 ml-6">
                                        @{friend.handle}
                                    </span>
                                )}
                                <span className="text-caption-regular text-gray-5 block">
                                    {disabled
                                        ? '이미 선택됨'
                                        : (friend.friendStatus ?? '친구')}
                                </span>
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export function PlaceSearchField({
    label,
    placeholder = '장소를 검색해 주세요.',
    helperText,
    context,
    selectedName,
    onSelect
}: {
    label: string
    placeholder?: string
    helperText?: string
    context?: SearchContext
    selectedName?: string | null
    onSelect: (place: PlaceSearchResult) => void
}) {
    const [input, setInput] = useState('')
    const search = useSearchController({ domains: ['place'], context })
    const placeState = search.state.place

    const updateQuery = (event: ChangeEvent<HTMLInputElement>) => {
        const next = event.target.value
        setInput(next)
        search.setQuery(next)
    }

    const selectPlace = (place: PlaceSearchResult) => {
        onSelect(place)
        setInput('')
        search.clear()
    }

    return (
        <div className="flex flex-col gap-8">
            <label className="text-caption-medium text-gray-7 flex flex-col gap-6">
                {label}
                <input
                    value={input}
                    onChange={updateQuery}
                    className="rounded-14 bg-gray-1 px-12 py-10 outline-none"
                    placeholder={placeholder}
                />
            </label>
            {helperText && <p className={emptyClass}>{helperText}</p>}
            {selectedName && (
                <div className="rounded-16 bg-primary-100 text-body2-medium text-primary-main p-10">
                    선택됨: {selectedName}
                </div>
            )}
            {placeState.status === 'loading' && (
                <p className={emptyClass}>장소를 검색하고 있습니다.</p>
            )}
            {placeState.status === 'empty' && (
                <p className={emptyClass}>검색된 장소가 없습니다.</p>
            )}
            {placeState.status === 'error' && (
                <p className="text-caption-regular text-red-500">
                    {getErrorMessage(placeState.error)}
                </p>
            )}
            {placeState.results.length > 0 && (
                <div className="rounded-16 bg-gray-1 flex flex-col gap-6 p-8">
                    {placeState.results.slice(0, 8).map(place => (
                        <button
                            key={place.placeId}
                            type="button"
                            onClick={() => selectPlace(place)}
                            className="rounded-12 bg-white px-12 py-9 text-left">
                            <span className="text-body2-semibold text-gray-8">
                                {place.placeName}
                            </span>
                            <span className="text-caption-regular text-gray-5 block">
                                {place.roadAddressName ||
                                    place.addressName ||
                                    place.categoryName ||
                                    '주소 정보 없음'}
                            </span>
                            {place.distance != null && (
                                <span className="text-caption-regular text-gray-5 block">
                                    {place.distance}m
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
