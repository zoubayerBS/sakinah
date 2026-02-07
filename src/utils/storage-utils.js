/**
 * Storage Utilities for Quran App
 * Handles persistence for Last Read and Bookmarks
 */

const KEYS = {
    LAST_READ: 'quran_last_read',
    BOOKMARKS: 'quran_bookmarks'
};

// --- Last Read ---

/**
 * Save the last read position
 * @param {object} data - { surahNumber, surahName, verseNumber }
 */
export const saveLastRead = (data) => {
    try {
        localStorage.setItem(KEYS.LAST_READ, JSON.stringify({
            ...data,
            timestamp: Date.now()
        }));
    } catch (error) {
        console.error('Error saving last read:', error);
    }
};

/**
 * Get the last read position
 * @returns {object|null} - { surahNumber, surahName, verseNumber, timestamp }
 */
export const getLastRead = () => {
    try {
        const data = localStorage.getItem(KEYS.LAST_READ);
        return data ? JSON.parse(data) : null;
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
export const toggleBookmark = (surah) => {
    try {
        const bookmarks = getBookmarks();
        const existingIndex = bookmarks.findIndex(b => b.number === surah.number);

        let newBookmarks;
        if (existingIndex >= 0) {
            // Remove
            newBookmarks = bookmarks.filter(b => b.number !== surah.number);
        } else {
            // Add (store minimal data)
            newBookmarks = [{
                number: surah.number,
                name: surah.name,
                englishName: surah.englishName || surah.transliteration, // Handle different API shapes
                verses: surah.verses || surah.numberOfAyahs,
                timestamp: Date.now()
            }, ...bookmarks];
        }

        localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(newBookmarks));
        return newBookmarks;
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        return [];
    }
};

/**
 * Check if a surah is bookmarked
 * @param {number} surahNumber
 * @returns {boolean}
 */
export const isBookmarked = (surahNumber) => {
    try {
        const bookmarks = getBookmarks();
        return bookmarks.some(b => b.number === surahNumber);
    } catch (error) {
        return false;
    }
};

/**
 * Get all bookmarks
 * @returns {array}
 */
export const getBookmarks = () => {
    try {
        const data = localStorage.getItem(KEYS.BOOKMARKS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting bookmarks:', error);
        return [];
    }
};
