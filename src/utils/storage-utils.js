import { kvService } from '../services/db.js';

const KEYS = {
    LAST_READ: 'quran_last_read',
    BOOKMARKS: 'quran_bookmarks',
    KHITMA: 'khitma_state',
    THEME: 'theme'
};

// --- Migration Logic ---

/**
 * Migrate data from localStorage to IndexedDB
 */
export const migrateToIndexedDB = async () => {
    for (const [key, value] of Object.entries(localStorage)) {
        if (Object.values(KEYS).includes(key)) {
            try {
                const parsedValue = JSON.parse(value);
                await kvService.set(key, parsedValue);
            } catch (e) {
                await kvService.set(key, value);
            }
        }
    }
    // We keep localStorage for now as a fallback/sync, 
    // but the app should prefer DB going forward.
};

// --- Last Read ---

/**
 * Save the last read position
 * @param {object} data - { surahNumber, surahName, verseNumber }
 */
export const saveLastRead = async (data) => {
    try {
        const payload = {
            ...data,
            timestamp: Date.now()
        };
        // Save to both for reliability during migration phase
        localStorage.setItem(KEYS.LAST_READ, JSON.stringify(payload));
        await kvService.set(KEYS.LAST_READ, payload);
    } catch (error) {
        console.error('Error saving last read:', error);
    }
};

/**
 * Get the last read position
 * @returns {Promise<object|null>} - { surahNumber, surahName, verseNumber, timestamp }
 */
export const getLastRead = async () => {
    try {
        // Try IndexedDB first
        const dbData = await kvService.get(KEYS.LAST_READ);
        if (dbData) return dbData;

        // Fallback to localStorage
        const lsData = localStorage.getItem(KEYS.LAST_READ);
        return lsData ? JSON.parse(lsData) : null;
    } catch (error) {
        console.error('Error getting last read:', error);
        return null;
    }
};

// --- Bookmarks ---

/**
 * Toggle bookmark for a specific Surah
 * @param {object} surah - Full surah object (min: number, name)
 */
export const toggleBookmark = async (surah) => {
    try {
        const bookmarks = await getBookmarks();
        const existingIndex = bookmarks.findIndex(b => b.number === surah.number);

        let newBookmarks;
        if (existingIndex >= 0) {
            newBookmarks = bookmarks.filter(b => b.number !== surah.number);
        } else {
            newBookmarks = [{
                number: surah.number,
                name: surah.name,
                englishName: surah.englishName || surah.transliteration,
                verses: surah.verses || surah.numberOfAyahs,
                timestamp: Date.now()
            }, ...bookmarks];
        }

        localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(newBookmarks));
        await kvService.set(KEYS.BOOKMARKS, newBookmarks);
        return newBookmarks;
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        return [];
    }
};

/**
 * Get all bookmarks
 * @returns {Promise<array>}
 */
export const getBookmarks = async () => {
    try {
        const dbData = await kvService.get(KEYS.BOOKMARKS);
        if (dbData) return dbData;

        const lsData = localStorage.getItem(KEYS.BOOKMARKS);
        return lsData ? JSON.parse(lsData) : [];
    } catch (error) {
        console.error('Error getting bookmarks:', error);
        return [];
    }
};

/**
 * Check if a surah is bookmarked
 */
export const isBookmarked = async (surahNumber) => {
    const bookmarks = await getBookmarks();
    return bookmarks.some(b => b.number === surahNumber);
};

// --- Khitma State ---

export const saveKhitmaState = async (state) => {
    localStorage.setItem(KEYS.KHITMA, JSON.stringify(state));
    await kvService.set(KEYS.KHITMA, state);
};

export const getKhitmaState = async () => {
    const dbData = await kvService.get(KEYS.KHITMA);
    if (dbData) return dbData;

    const lsData = localStorage.getItem(KEYS.KHITMA);
    return lsData ? JSON.parse(lsData) : null;
};
