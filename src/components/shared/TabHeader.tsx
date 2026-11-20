interface TabHeaderProps {
    tabs: { key: string; label: string }[]
    activeTab: string
    onTabChange: (tab: string) => void
}

export function TabHeader({ tabs, activeTab, onTabChange }: TabHeaderProps) {
    return (
        <div className="flex w-full flex-row justify-center bg-white pt-12">
            {tabs.map(tab => (
                <div
                    key={tab.key}
                    className="flex flex-1 cursor-pointer flex-col items-center"
                    onClick={() => onTabChange(tab.key)}>
                    <span
                        className={`text-title2-bold ${
                            activeTab === tab.key
                                ? 'text-primary-main'
                                : 'text-gray-3'
                        }`}>
                        {tab.label}
                    </span>
                    <div
                        className={`mt-6 h-2 w-full rounded-full ${
                            activeTab === tab.key
                                ? 'bg-primary-main'
                                : 'bg-white'
                        }`}></div>
                </div>
            ))}
        </div>
    )
}
