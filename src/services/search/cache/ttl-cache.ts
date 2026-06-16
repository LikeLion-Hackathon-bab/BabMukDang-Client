interface TtlCacheEntry<TValue> {
    value: TValue
    expiresAt: number
}

export class TtlCache<TKey, TValue> {
    private readonly entries = new Map<TKey, TtlCacheEntry<TValue>>()

    constructor(private readonly ttlMs: number) {}

    get(key: TKey): TValue | undefined {
        const entry = this.entries.get(key)

        if (!entry) return undefined

        if (Date.now() >= entry.expiresAt) {
            this.entries.delete(key)
            return undefined
        }

        return entry.value
    }

    set(key: TKey, value: TValue): void {
        this.entries.set(key, {
            value,
            expiresAt: Date.now() + this.ttlMs
        })
    }

    clear(): void {
        this.entries.clear()
    }
}
