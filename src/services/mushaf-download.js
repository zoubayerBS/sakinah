/**
 * Mushaf Offline Download Service
 * Downloads pages + fonts for offline reading (full Quran or per-surah)
 */
import { mushafCache } from './db.js';
import { quranAPI } from './quran-api.js';
import { surahPageMapping } from '../data/surah-pages.js';

const TOTAL_PAGES = 604;
const BATCH_SIZE = 5;
const FONT_BASE_URL = 'https://static-cdn.tarteel.ai/qul/fonts/quran_fonts/v2/woff2';
const STATUS_KEY = 'mushaf-offline-status';
const SURAH_STATUS_KEY = 'mushaf-surah-offline-status';

// ─── Status Helpers ──────────────────────────────────────────────

/**
 * Get overall download status
 */
export function getMushafDownloadStatus() {
    try {
        const raw = localStorage.getItem(STATUS_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return { downloaded: 0, total: TOTAL_PAGES, isComplete: false };
}

function saveStatus(downloaded, isComplete = false) {
    localStorage.setItem(STATUS_KEY, JSON.stringify({
        downloaded,
        total: TOTAL_PAGES,
        isComplete,
        lastUpdated: Date.now()
    }));
}

/**
 * Get per-surah download statuses  
 * @returns {Object} { [surahNumber]: true } for downloaded surahs
 */
export function getSurahDownloadStatuses() {
    try {
        const raw = localStorage.getItem(SURAH_STATUS_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return {};
}

function saveSurahStatus(surahNumber, isComplete) {
    const statuses = getSurahDownloadStatuses();
    if (isComplete) {
        statuses[surahNumber] = true;
    } else {
        delete statuses[surahNumber];
    }
    localStorage.setItem(SURAH_STATUS_KEY, JSON.stringify(statuses));
}

// ─── Font Preloading ─────────────────────────────────────────────

async function preloadFont(pageNumber) {
    const fontName = `p${pageNumber}-v2`;
    if (document.fonts.check(`12px "${fontName}"`)) return;

    const url = `${FONT_BASE_URL}/p${pageNumber}.woff2`;
    try {
        const font = new FontFace(fontName, `url('${url}')`);
        await font.load();
        document.fonts.add(font);

        if (!document.getElementById(`font-${fontName}`)) {
            const style = document.createElement('style');
            style.id = `font-${fontName}`;
            style.innerHTML = `
                @font-face {
                    font-family: '${fontName}';
                    src: url('${url}') format('woff2');
                    font-display: block;
                }
            `;
            document.head.appendChild(style);
        }
    } catch (err) {
        console.warn(`[MushafDownload] Font p${pageNumber} failed:`, err);
    }
}

// ─── Core Download Logic ─────────────────────────────────────────

/**
 * Download a range of pages with progress
 * @param {number[]} pageList - list of page numbers to download
 * @param {number} totalForProgress - total to use for percent calculation
 * @param {function} onProgress - callback({ downloaded, total, percent, currentPage, phase })
 * @param {object} abortRef - { aborted: boolean }
 * @returns {Promise<{ success: boolean, downloaded: number }>}
 */
async function downloadPages(pageList, totalForProgress, onProgress, abortRef) {
    let cachedPageNumbers;
    try {
        cachedPageNumbers = await mushafCache.getAllCachedPageNumbers();
    } catch (e) {
        cachedPageNumbers = new Set();
    }

    const pagesToDownload = pageList.filter(p => !cachedPageNumbers.has(p));
    let downloaded = pageList.length - pagesToDownload.length;

    if (pagesToDownload.length === 0) {
        onProgress?.({
            downloaded: totalForProgress,
            total: totalForProgress,
            percent: 100,
            currentPage: pageList[pageList.length - 1],
            phase: 'complete'
        });
        return { success: true, downloaded: totalForProgress };
    }

    onProgress?.({
        downloaded,
        total: totalForProgress,
        percent: Math.round((downloaded / totalForProgress) * 100),
        currentPage: pagesToDownload[0],
        phase: 'downloading'
    });

    for (let i = 0; i < pagesToDownload.length; i += BATCH_SIZE) {
        if (abortRef.aborted) {
            onProgress?.({
                downloaded,
                total: totalForProgress,
                percent: Math.round((downloaded / totalForProgress) * 100),
                currentPage: null,
                phase: 'cancelled'
            });
            return { success: false, downloaded, aborted: true };
        }

        const batch = pagesToDownload.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(
            batch.map(async (pageNum) => {
                if (abortRef.aborted) return;
                const data = await quranAPI.getMushafPage(pageNum);
                if (!data) throw new Error(`Failed to fetch page ${pageNum}`);
                await preloadFont(pageNum);
                return pageNum;
            })
        );

        for (const result of results) {
            if (result.status === 'fulfilled' && result.value) {
                downloaded++;
            }
        }

        onProgress?.({
            downloaded,
            total: totalForProgress,
            percent: Math.round((downloaded / totalForProgress) * 100),
            currentPage: batch[batch.length - 1],
            phase: downloaded >= totalForProgress ? 'complete' : 'downloading'
        });
    }

    return { success: downloaded >= totalForProgress, downloaded };
}

// ─── Public API ──────────────────────────────────────────────────

/**
 * Download ALL 604 pages (full Quran)
 */
export function startFullQuranDownload(onProgress) {
    const abortRef = { aborted: false };
    const abort = () => { abortRef.aborted = true; };

    const allPages = [];
    for (let i = 1; i <= TOTAL_PAGES; i++) allPages.push(i);

    const promise = (async () => {
        const result = await downloadPages(allPages, TOTAL_PAGES, onProgress, abortRef);
        saveStatus(result.downloaded, result.success);

        // If complete, mark all surahs as downloaded too
        if (result.success) {
            const statuses = {};
            for (let s = 1; s <= 114; s++) statuses[s] = true;
            localStorage.setItem(SURAH_STATUS_KEY, JSON.stringify(statuses));
        }
        return result;
    })();

    return { abort, promise };
}

/**
 * Download a single surah's pages
 */
export function startSurahDownload(surahNumber, onProgress) {
    const abortRef = { aborted: false };
    const abort = () => { abortRef.aborted = true; };

    const mapping = surahPageMapping[surahNumber];
    if (!mapping) {
        return {
            abort,
            promise: Promise.resolve({ success: false, downloaded: 0 })
        };
    }

    const pages = [];
    for (let p = mapping.start; p <= mapping.end; p++) pages.push(p);
    const total = pages.length;

    const promise = (async () => {
        const result = await downloadPages(pages, total, onProgress, abortRef);
        if (result.success) {
            saveSurahStatus(surahNumber, true);
        }

        // Also update global status
        try {
            const cachedCount = await mushafCache.countCachedPages();
            saveStatus(cachedCount, cachedCount >= TOTAL_PAGES);
        } catch (e) { /* ignore */ }

        return result;
    })();

    return { abort, promise };
}

/**
 * Check if a specific surah is fully cached
 */
export async function isSurahCached(surahNumber) {
    const mapping = surahPageMapping[surahNumber];
    if (!mapping) return false;

    try {
        const cachedPages = await mushafCache.getAllCachedPageNumbers();
        for (let p = mapping.start; p <= mapping.end; p++) {
            if (!cachedPages.has(p)) return false;
        }
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Refresh surah statuses by checking IndexedDB (for accurate state)
 */
export async function refreshSurahStatuses() {
    try {
        const cachedPages = await mushafCache.getAllCachedPageNumbers();
        const statuses = {};
        for (let s = 1; s <= 114; s++) {
            const mapping = surahPageMapping[s];
            if (!mapping) continue;
            let allCached = true;
            for (let p = mapping.start; p <= mapping.end; p++) {
                if (!cachedPages.has(p)) { allCached = false; break; }
            }
            if (allCached) statuses[s] = true;
        }
        localStorage.setItem(SURAH_STATUS_KEY, JSON.stringify(statuses));

        const totalCached = cachedPages.size;
        saveStatus(totalCached, totalCached >= TOTAL_PAGES);

        return statuses;
    } catch (e) {
        return {};
    }
}

/**
 * Delete all offline Mushaf data
 */
export async function deleteMushafOfflineData() {
    try {
        await mushafCache.clearAllPages();
        localStorage.removeItem(STATUS_KEY);
        localStorage.removeItem(SURAH_STATUS_KEY);
        return true;
    } catch (e) {
        console.error('[MushafDownload] Failed to clear data:', e);
        return false;
    }
}
