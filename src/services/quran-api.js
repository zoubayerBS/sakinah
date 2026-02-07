/**
 * Quran API Service
 * Handles data fetching from alquran.cloud with caching and optimization
 */

class QuranService {
    constructor() {
        this.baseUrl = 'https://api.alquran.cloud/v1';
        this.cache = new Map();
    }

    /**
     * Fetch all surahs metadata
     */
    async getAllSurahs() {
        if (this.cache.has('allSurahs')) {
            return this.cache.get('allSurahs');
        }

        try {
            const response = await fetch(`${this.baseUrl}/surah`, {
                headers: {
                    'Accept-Encoding': 'gzip'
                }
            });
            const data = await response.json();

            if (data.code === 200) {
                // Regex to remove Arabic diacritics (Tashkeel)
                const removeTashkeel = (text) => text.replace(/[\u064B-\u0652\u06D6-\u06ED]/g, '');

                // Map API data to our application's expected format
                const surahs = data.data.map(surah => ({
                    number: surah.number,
                    name: removeTashkeel(surah.name),
                    transliteration: surah.englishName,
                    translation: surah.englishNameTranslation,
                    verses: surah.numberOfAyahs,
                    revelation: surah.revelationType // 'Meccan' or 'Medinan'
                }));

                this.cache.set('allSurahs', surahs);
                return surahs;
            }
            throw new Error('Failed to fetch surahs');
        } catch (error) {
            console.error('[QuranAPI] Error fetching all surahs:', error);
            return [];
        }
    }

    /**
     * Fetch a specific surah with its verses and translations
     * @param {number} surahNumber 
     * @param {string} edition - e.g., 'quran-uthmani' or 'en.sahih'
     */
    async getSurah(surahNumber, edition = 'quran-uthmani') {
        const cacheKey = `surah-${surahNumber}-${edition}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const response = await fetch(`${this.baseUrl}/surah/${surahNumber}/${edition}`, {
                headers: {
                    'Accept-Encoding': 'gzip'
                }
            });
            const data = await response.json();

            if (data.code === 200) {
                this.cache.set(cacheKey, data.data);
                return data.data;
            }
            throw new Error(`Failed to fetch surah ${surahNumber}`);
        } catch (error) {
            console.error(`[QuranAPI] Error fetching surah ${surahNumber}:`, error);
            return null;
        }
    }

    /**
     * Fetch specific surah with both Arabic and Translation combined
     */
    async getSurahWithTranslation(surahNumber, translationEdition = 'en.sahih') {
        const cacheKey = `surah-full-${surahNumber}-${translationEdition}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const response = await fetch(`${this.baseUrl}/surah/${surahNumber}/editions/quran-uthmani,${translationEdition}`, {
                headers: {
                    'Accept-Encoding': 'gzip'
                }
            });
            const data = await response.json();

            if (data.code === 200) {
                // Combine editions into a single structure
                const arabic = data.data[0];
                const translation = data.data[1];

                const combined = {
                    ...arabic,
                    name: arabic.name.replace(/[\u064B-\u0652\u06D6-\u06ED]/g, ''),
                    ayahs: arabic.ayahs.map((ayah, idx) => ({
                        ...ayah,
                        translation: translation.ayahs[idx].text
                    }))
                };

                this.cache.set(cacheKey, combined);
                return combined;
            }
            throw new Error(`Failed to fetch combined surah ${surahNumber}`);
        } catch (error) {
            console.error(`[QuranAPI] Error in combined fetch:`, error);
            return null;
        }
    }

    /**
     * Fetch surah audio data (recitation)
     */
    async getSurahAudioData(surahNumber, reciter = 'ar.alafasy') {
        const cacheKey = `surah-audio-${surahNumber}-${reciter}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const response = await fetch(`${this.baseUrl}/surah/${surahNumber}/${reciter}`, {
                headers: {
                    'Accept-Encoding': 'gzip'
                }
            });
            const data = await response.json();

            if (data.code === 200) {
                this.cache.set(cacheKey, data.data);
                return data.data;
            }
            throw new Error(`Failed to fetch audio for surah ${surahNumber}`);
        } catch (error) {
            console.error(`[QuranAPI] Error fetching audio:`, error);
            return null;
        }
    }

    /**
     * Fetch list of available reciters (audio editions)
     */
    async getReciters() {
        if (this.cache.has('reciters')) {
            return this.cache.get('reciters');
        }

        try {
            const response = await fetch(`${this.baseUrl}/edition?format=audio&language=ar&type=versebyverse`, {
                headers: {
                    'Accept-Encoding': 'gzip'
                }
            });
            const data = await response.json();

            if (data.code === 200) {
                this.cache.set('reciters', data.data);
                return data.data;
            }
            throw new Error('Failed to fetch reciters');
        } catch (error) {
            console.error('[QuranAPI] Error fetching reciters:', error);
            return [];
        }
    }
}

export const quranAPI = new QuranService();
