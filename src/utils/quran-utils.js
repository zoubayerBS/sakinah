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
 * Generates a Khitma reading schedule based on days and starting page.
 * @param {number} days - Number of days to complete the Khitma.
 * @param {number} startPage - The page number to start from (1-604).
 * @returns {Array} Array of daily reading blocks.
 */
export const generateKhitmaSchedule = (days = 30, startPage = 1) => {
    const TOTAL_PAGES = 604;
    const schedule = [];

    // We need to read exactly TOTAL_PAGES over the specified days
    const basePagesPerDay = Math.floor(TOTAL_PAGES / days);
    const remainder = TOTAL_PAGES % days;

    let currentPage = startPage;

    for (let day = 1; day <= days; day++) {
        // Distribute remainder pages early in the schedule
        const pagesToday = basePagesPerDay + (day <= remainder ? 1 : 0);

        // Calculate the end page for today, wrapping around if needed
        let endPage = currentPage + pagesToday - 1;
        if (endPage > TOTAL_PAGES) {
            endPage = endPage % TOTAL_PAGES;
        }

        schedule.push({
            day,
            startPage: currentPage,
            endPage,
            pagesCount: pagesToday,
            isCompleted: false,
            completedAt: null
        });

        currentPage = endPage + 1;
        if (currentPage > TOTAL_PAGES) {
            currentPage = 1;
        }
    }

    return schedule;
};

/**
 * Checks if a given page is within a specific daily Wird range.
 * This handles the wrap-around logic (e.g. range 600 -> 10).
 */
export const isPageInWird = (page, startPage, endPage) => {
    if (startPage <= endPage) {
        return page >= startPage && page <= endPage;
    } else {
        // Wraps around from end of Musaf to the beginning
        return page >= startPage || page <= endPage;
    }
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
