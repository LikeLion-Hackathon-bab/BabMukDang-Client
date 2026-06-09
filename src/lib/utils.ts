import { useAuthStore } from '@/store'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function isAuthorized(): boolean {
    let store = useAuthStore()
    return !!store.accessToken
}
