export function Filter({
    filter,
    onClick,
    activeFilter
}: {
    filter: { key: string; label: string }
    onClick: () => void
    activeFilter: { key: string; label: string }
}) {
    return (
        <div
            className={`flex cursor-pointer flex-row gap-10 rounded-full px-12 py-6 ${filter.key === activeFilter.key ? 'bg-primary-main' : 'bg-gray-2'}`}
            onClick={onClick}>
            <span
                className={`text-caption-medium ${filter.key === activeFilter.key ? 'text-white' : 'text-gray-4'}`}>
                {filter.label}
            </span>
        </div>
    )
}
