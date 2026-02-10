import { QuranClient } from '@quranjs/api';

/**
 * Quran API Service
 * Migrated to use the official @quranjs/api SDK while maintaining
 * backward compatibility for the existing PWA UI.
 */
class QuranService {
    constructor() {
        this.cache = new Map();

        // Configuration from environment variables
        const clientId = (import.meta.env.VITE_QURAN_CLIENT_ID || '').trim();
        const clientSecret = (import.meta.env.VITE_QURAN_CLIENT_SECRET || '').trim();
        const contentBaseUrl = import.meta.env.VITE_QURAN_API_BASE;
        const authBaseUrl = import.meta.env.VITE_QURAN_OAUTH_ENDPOINT;

        this.accessToken = null;
        this.isPreliveFallback = false;
        this.useSdk = !!(clientId && clientSecret); // Only use SDK if we have valid credentials

        // Initialize SDK Client if credentials are available
        if (this.useSdk) {
            // Helper to robustly set headers on either plain objects or Headers instances
            const robustSetHeader = (headers, key, value) => {
                if (headers instanceof Headers) {
                    headers.set(key, value);
                } else {
                    headers[key] = value;
                }
            };

            const customFetcher = async (url, options = {}) => {
                const isTokenRequest = url.includes('/oauth2/token') || url.includes('oauth2.foundation');

                // Ensure headers object exists
                options.headers = options.headers || {};

                try {
                    const response = await fetch(url, options);

                    // Handle Token Capture
                    if (isTokenRequest && response.ok) {
                        const clonedResponse = response.clone();
                        const data = await clonedResponse.json();
                        if (data.access_token) {
                            this.accessToken = data.access_token;
                        }
                    }

                    // Error diagnostics
                    if (!response.ok && response.status >= 400) {
                        try {
                            const errorClone = response.clone();
                            const errorText = await errorClone.text();
                            console.error(`[QuranAPI] ${response.status} Error at ${url}. Body:`, errorText.substring(0, 200));
                        } catch (e) { }
                    }

                    return response;
                } catch (err) {
                    console.error(`[QuranAPI] SDK Fetch Failure:`, err);
                    throw err;
                }
            };

            this.client = new QuranClient({
                clientId,
                clientSecret,
                contentBaseUrl: contentBaseUrl || 'https://apis.quran.foundation',
                authBaseUrl: authBaseUrl || 'https://oauth2.quran.foundation',
                fetch: customFetcher
            });
        }

        // Public API endpoints for fallback
        this.publicBase = 'https://api.quran.com/api/v4';
        this.legacyBase = 'https://api.alquran.cloud/v1';
    }

    /**
     * Map SDK Chapter to UI Surah format
     */
    _mapChapterToSurah(chapter) {
        return {
            number: chapter.id,
            name: chapter.nameArabic,
            transliteration: chapter.transliteratedName,
            translation: chapter.translatedName.name,
            verses: chapter.versesCount,
            revelation: chapter.revelationPlace // 'makkah' or 'madinah'
        };
    }

    /**
     * Fetch all surahs metadata
     */
    async getAllSurahs() {
        if (this.cache.has('allSurahs')) return this.cache.get('allSurahs');

        // Try SDK first if available
        if (this.useSdk) {
            try {
                const chapters = await this.client.chapters.findAll();
                const surahs = chapters.map(c => this._mapChapterToSurah(c));
                this.cache.set('allSurahs', surahs);
                return surahs;
            } catch (error) {
                console.error('[QuranAPI] Error fetching all surahs via SDK:', error);
            }
        }

        // Fallback to public API
        try {
            const response = await fetch(`${this.legacyBase}/surah`);
            const data = await response.json();
            if (data.code === 200) {
                const surahs = data.data.map(surah => ({
                    number: surah.number,
                    name: surah.name.replace(/[\u064B-\u0652\u06D6-\u06ED]/g, ''),
                    transliteration: surah.englishName,
                    translation: surah.englishNameTranslation,
                    verses: surah.numberOfAyahs,
                    revelation: surah.revelationType
                }));
                this.cache.set('allSurahs', surahs);
                return surahs;
            }
        } catch (fallbackError) {
            console.error('[QuranAPI] Fallback also failed:', fallbackError);
        }
        return [];
    }

    /**
     * Fetch a specific surah with its verses
     */
    async getSurah(surahNumber) {
        const cacheKey = `surah-${surahNumber}`;
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

        // Try SDK first if available
        if (this.useSdk) {
            try {
                const verses = await this.client.verses.findByChapter(surahNumber);
                this.cache.set(cacheKey, verses);
                return verses;
            } catch (error) {
                console.error(`[QuranAPI] Error fetching surah ${surahNumber} via SDK:`, error);
            }
        }

        // Fallback to public API
        return null;
    }

    /**
     * Get Mushaf page data (verses with King Fahad Complex V2 glyphs and full text)
     */
    async getMushafPage(pageNumber) {
        const cacheKey = `mushaf-page-${pageNumber}`;
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

        // Try SDK first if available
        if (this.useSdk) {
            try {
                const verses = await this.client.verses.findByPage(pageNumber, {
                    fields: {
                        codeV2: true,
                        imageUrl: true,
                        imageWidth: true,
                        chapterId: true,
                        textUthmani: true,
                        juzNumber: true,
                        hizbNumber: true,
                        pageNumber: true
                    },
                    words: true,
                    wordFields: {
                        codeV2: true,
                        v2Page: true
                    }
                });

                if (verses && verses.length > 0) {
                    const validVerses = verses.filter(v => v.chapterId);
                    const processed = validVerses.map(v => {
                        let img = v.imageUrl;
                        if (img) {
                            img = img.replace(/\.r\d+\.cf\d+\.rackcdn\.com/, '.ssl.cf1.rackcdn.com');
                            img = img.startsWith('//') ? `https:${img}` : img;
                        }
                        return {
                            ...v,
                            id: v.id,
                            verse_key: v.verseKey,
                            numberInSurah: v.verseNumber,
                            text: v.textUthmani,
                            image_url: img,
                            image_width: v.imageWidth,
                            code_v2: v.codeV2,
                            juz: v.juzNumber,
                            words: (v.words || []).map(w => ({
                                ...w,
                                code_v2: w.codeV2,
                                line_number: w.lineNumber,
                                char_type: w.charTypeName,
                            })),
                            surah: {
                                number: v.chapterId,
                            }
                        };
                    });

                    this.cache.set(cacheKey, processed);
                    return processed;
                }
            } catch (error) {
                console.error(`[QuranAPI] Error fetching mushaf page ${pageNumber} via SDK:`, error);
            }
        }

        return null;
    }

    /**
     * Get Surah Verse Images (for ReadingPage)
     */
    async getSurahVerseImages(surahNumber) {
        const cacheKey = `surah-images-${surahNumber}`;
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

        // Try SDK first if available
        if (this.useSdk) {
            try {
                const verses = await this.client.verses.findByChapter(surahNumber, {
                    fields: {
                        imageUrl: true,
                        imageWidth: true
                    }
                });

                const processed = verses.map(v => ({
                    id: v.id,
                    verse_key: v.verseKey,
                    numberInSurah: v.verseNumber,
                    image_url: v.imageUrl?.replace(/\.r\d+\.cf\d+\.rackcdn\.com/, '.ssl.cf1.rackcdn.com').startsWith('//')
                        ? `https:${v.imageUrl.replace(/\.r\d+\.cf\d+\.rackcdn\.com/, '.ssl.cf1.rackcdn.com')}`
                        : v.imageUrl,
                    image_width: v.imageWidth
                }));

                this.cache.set(cacheKey, processed);
                return processed;
            } catch (error) {
                console.error(`[QuranAPI] Error fetching surah images ${surahNumber} via SDK:`, error);
            }
        }

        return null;
    }

    /**
     * Get Surah Audio Data
     */
    async getSurahAudioData(surahNumber, recitationId) {
        // Try SDK first if available
        if (this.useSdk) {
            try {
                const data = await this.client.audio.findChapterRecitationById(recitationId, surahNumber);
                return {
                    audio_url: data.audioUrl,
                    chapter_id: data.chapterId,
                    file_size: data.fileSize,
                    format: data.format
                };
            } catch (error) {
                console.error(`[QuranAPI] Error fetching audio for surah ${surahNumber} via SDK:`, error);
            }
        }

        return null;
    }

    /**
     * Search Quran
     */
    async search(query) {
        // Try SDK first if available
        if (this.useSdk) {
            try {
                const response = await this.client.search.search(query, {
                    mode: 'quick'
                });
                return response;
            } catch (error) {
                console.error('[QuranAPI] Search error via SDK:', error);
            }
        }

        return null;
    }
}

export const quranAPI = new QuranService();
