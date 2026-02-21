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
 * Returns the number of days elapsed since the Khitma started.
 */
export const getDaysElapsed = (khitma) => {
    if (!khitma?.startDate) return 0;
    const start = new Date(khitma.startDate);
    const today = new Date();
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return Math.max(1, Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1);
};

/**
 * Returns the actual average units read per day from the progressLog.
 */
export const getDailyAverage = (khitma) => {
    if (!khitma?.progressLog) return 0;
    const log = khitma.progressLog;
    const entries = Object.values(log);
    if (entries.length === 0) return 0;
    const total = entries.reduce((sum, v) => sum + v, 0);
    return Math.round((total / entries.length) * 10) / 10;
};

/**
 * Returns the estimated end date based on actual average daily progress.
 */
export const getEstimatedEndDate = (khitma) => {
    const avg = getDailyAverage(khitma);
    if (avg <= 0) return null;
    const total = khitma.mode === 'pages' ? 604 : 6236;
    const remaining = total - (khitma.progress || 0);
    if (remaining <= 0) return new Date(); // Already done
    const daysRemaining = Math.ceil(remaining / avg);
    const end = new Date();
    end.setDate(end.getDate() + daysRemaining);
    return end;
};

/**
 * Returns true if the Khitma is complete.
 */
export const isKhitmaComplete = (khitma) => {
    if (!khitma?.isStarted) return false;
    const total = khitma.mode === 'pages' ? 604 : 6236;
    return (khitma.progress || 0) >= total;
};

/**
 * Returns the last 7 days of reading progress for a mini chart.
 * Returns an array of { date, label, value, target }.
 */
export const getWeeklyHistory = (khitma) => {
    const log = khitma?.progressLog || {};
    const target = getKhitmaDailyTarget(khitma);
    const days = [];
    const dayLabels = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        days.push({
            date: key,
            label: dayLabels[d.getDay()],
            value: log[key] || 0,
            target
        });
    }
    return days;
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
