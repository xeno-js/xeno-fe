// infrastructure/auth/memory-storage.adapter.ts
export const createMemoryStorage = (): {
    getItem: (key: string) => string | null
    setItem: (key: string, value: string) => void
    removeItem: (key: string) => void
} => {
    const store = new Map<string, string>()
    return {
        getItem: (key: string): string | null => store.get(key) ?? null,
        setItem: (key: string, value: string): void => {
            store.set(key, value)
        },
        removeItem: (key: string): void => {
            store.delete(key)
        },
    }
}