/**
 * Utility functions for the Sakinah Quran PWA
 */

/**
 * Converts Western Arabic digits (0-9) to Arabic-Indic digits (٠-٩).
 * @param {number|string} value - The number or string to convert.
 * @returns {string} The converted string.
 */
export const toArabicIndicDigits = (value) => {
    if (value === undefined || value === null) return '';
    const digits = String(value).split('');
    const map = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return digits.map((d) => (/\d/.test(d) ? map[Number(d)] : d)).join('');
};

/**
 * Formats a surah name by adding the "سورة" prefix if missing.
 * @param {string} name - The surah name.
 * @returns {string} The formatted surah name.
 */
export const formatSurahTitle = (name) => {
    if (!name) return '';
    // Special case for surah names that include "سورة" already or ligatures
    if (name.startsWith('سورة')) return name;
    // Check if it's a ligature like "surah001"
    if (name.includes('surah')) return name;
    return `سورة ${name}`;
};

/**
 * Calculates wird progress based on portions read today.
 * @param {object} khitma - The khitma state object.
 * @param {number} portionsPerDay - Number of portions per day (default 5 for one juz).
 * @returns {number} Percentage progress (0-100).
 */
export const calculateWirdProgress = (khitma, portionsPerDay = 5) => {
    if (!khitma || !khitma.progressLog) return 0;
    const todayKey = new Date().toISOString().split('T')[0];
    const todayPortions = khitma.progressLog[todayKey] || 0;
    return Math.min(100, (todayPortions / portionsPerDay) * 100);
};

/**
 * Finds the juz containing a given page number.
 * @param {number} pageNumber - The page number (1-604).
 * @param {Array} juzPages - Array of {juz, page} mappings.
 * @returns {number} The juz number.
 */
export const findJuzForPage = (pageNumber, juzPages) => {
    return juzPages.reduce((acc, j) => pageNumber >= j.page ? j.juz : acc, 1);
};
