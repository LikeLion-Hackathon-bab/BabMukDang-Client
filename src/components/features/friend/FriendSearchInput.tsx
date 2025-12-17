import { SearchInput } from '@/components/shared'

export function FriendSearchInput({
    handleSearch
}: {
    handleSearch: (search: string) => void
}) {
    return (
        <SearchInput
            handleSearch={handleSearch}
            placeholder="친구 검색하기"
        />
    )
}
