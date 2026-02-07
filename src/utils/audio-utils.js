/**
 * Audio Utilities for Quran App
 * Handles URL generation for different reciters and CDN failovers
 */

// Mapping of reciter identifiers (from API) to mp3quran.net server configurations
// server: The server subdomain (e.g., 'server11' for server11.mp3quran.net)
// path: The path component for the reciter (e.g., 'sds' for Sudais)
const RECITER_MAPPINGS = {
    'ar.abdurrahmaansudais': { server: 'server11', path: 'sds' },
    'ar.alafasy': { server: 'server8', path: 'afs' },
    'ar.saudashshuraim': { server: 'server7', path: 'shur' },
    'ar.mahermuaiqly': { server: 'server12', path: 'maher' },
    'ar.ahmedajamy': { server: 'server10', path: 'ajm' },
    'ar.husary': { server: 'server13', path: 'husr' },
    'ar.hudhaify': { server: 'server6', path: 'hthfi' },
    'ar.abdulbasit': { server: 'server7', path: 'basit' }, // AbdulBaset AbdulSamad
    'ar.minshawi': { server: 'server10', path: 'minsh' } // Minshawi
};

/**
     * Get valid audio URLs for a specific surah and reciter
     * Returns an array of URLs to try in order
     * 
     * @param {string} reciterId - The reciter identifier (e.g., 'ar.alafasy')
     * @param {number} surahNumber - The surah number (1-114)
     * @returns {string[]} Array of potential audio URLs
     */
export const getAudioUrls = (reciterId, surahNumber) => {
    const paddedNum = surahNumber.toString().padStart(3, '0');
    const urls = [];

    // 1. First priority: Direct mp3quran.net mapping if available (High quality, reliable)
    const mapping = RECITER_MAPPINGS[reciterId];
    if (mapping) {
        // High quality (often 128kbps or higher)
        urls.push(`https://${mapping.server}.mp3quran.net/${mapping.path}/${paddedNum}.mp3`);
    }

    // 2. Second priority: Standard Islamic Network CDN 
    // This uses the specific reciter ID from the API
    urls.push(`https://cdn.islamic.network/quran/audio-surah/128/${reciterId}/${surahNumber}.mp3`);

    // 3. Fallbacks for specific popular reciters to other known CDNs/paths if needed
    if (reciterId === 'ar.alafasy') {
        urls.push(`https://download.quranicaudio.com/quran/mishari_al_afasy/${paddedNum}.mp3`);
    }

    return urls;
};
