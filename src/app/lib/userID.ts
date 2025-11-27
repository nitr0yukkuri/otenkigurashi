// src/app/lib/userId.ts

export function getUserId(): string {
    if (typeof window === 'undefined') return '';

    const STORAGE_KEY = 'otenki_user_id';
    let userId = localStorage.getItem(STORAGE_KEY);

    if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY, userId);
    }

    return userId;
}