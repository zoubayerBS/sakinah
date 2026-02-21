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
 * Calculates wird progress (today's goal) based on progress made today.
 * @param {object} khitma - The khitma state object.
 * @param {number} dailyTarget - The calculated daily target from planner.
 * @returns {number} Percentage progress (0-100).
 */
export const calculateWirdProgress = (khitma, dailyTarget = 1) => {
    if (!khitma?.progressLog) return 0;
    const todayKey = new Date().toISOString().split('T')[0];
    const todayProgress = khitma.progressLog[todayKey] || 0;
    return Math.min(100, (todayProgress / dailyTarget) * 100);
};

/**
 * Calculates total khitma completion percentage.
 * @param {object} khitma - The khitma state object.
 * @returns {number} Percentage progress (0-100).
 */
export const calculateKhitmaProgress = (khitma) => {
    if (!khitma || !khitma.isStarted) return 0;
    const total = khitma.mode === 'pages' ? 604 : 6236;
    return Math.min(100, (khitma.progress / total) * 100);
};

/**
 * Calculates the daily target based on the khitma plan.
 * @param {object} khitma - The khitma state object.
 * @returns {number} The daily target (pages or ayahs).
 */
export const getKhitmaDailyTarget = (khitma) => {
    if (!khitma?.days) return 0;
    const total = khitma.mode === 'pages' ? 604 : 6236;
    return Math.ceil(total / khitma.days);
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
