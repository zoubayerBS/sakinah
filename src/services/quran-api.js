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

        // Initialize SDK Client with a Smart Auth Interceptor
        const customFetcher = async (url, options = {}) => {
            let currentUrl = url;
            const isTokenRequest = currentUrl.includes('/oauth2/token') || currentUrl.includes('oauth2.foundation');

            // 1. URL Patching for Fallback
            if (this.isPreliveFallback && isTokenRequest) {
                // Redirect token requests to prelive proxy if in fallback mode
                currentUrl = currentUrl.replace('/oauth2-proxy', '/prelive-oauth2-proxy');
                currentUrl = currentUrl.replace('oauth2.quran.foundation', 'prelive-oauth2.quran.foundation');
            }

            // 2. Prepare/Inject Request Headers
            options.headers = options.headers || {};

            if (isTokenRequest) {
                const creds = btoa(`${clientId}:${clientSecret}`);
                options.headers['Authorization'] = `Basic ${creds}`;

                // Force scope=content if it's a form-data request
                if (options.body instanceof URLSearchParams) {
                    options.body.set('scope', 'content');
                } else if (typeof options.body === 'string' && options.body.includes('grant_type')) {
                    const params = new URLSearchParams(options.body);
                    params.set('scope', 'content');
                    options.body = params.toString();
                }
                console.log(`[QuranAPI] Token Request (${this.isPreliveFallback ? 'PRELIVE' : 'PROD'}): ${currentUrl}`);
            } else if (this.accessToken) {
                options.headers['x-auth-token'] = this.accessToken;
                options.headers['x-client-id'] = clientId;
            }

            try {
                const response = await fetch(currentUrl, options);

                // 3. Handle Token Capture
                if (isTokenRequest && response.ok) {
                    const clonedResponse = response.clone();
                    const data = await clonedResponse.json();
                    if (data.access_token) {
                        this.accessToken = data.access_token;
                        console.log(`[QuranAPI] Captured ${this.isPreliveFallback ? 'PRELIVE' : 'PROD'} Token`);
                    }
                }

                // 4. SMART FALLBACK: If content fails with 403, and we haven't tried Prelive yet
                if (response.status === 403 && !isTokenRequest && !this.isPreliveFallback) {
                    console.warn('[QuranAPI] 403 Forbidden on Production. Attempting Smart Fallback to Prelive...');
                    this.isPreliveFallback = true;
                    this.accessToken = null; // Clear production token

                    // The SDK will naturally retry or we can just let this one fail and the next one will trigger re-auth
                    // To handle the immediate request, we'd need more complex logic. 
                    // For now, let's just mark it so the next SDK call uses Prelive.
                }

                return response;
            } catch (err) {
                console.error(`[QuranAPI] Fetch Error:`, err);
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

        // Backup bases for direct fetch if needed
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

        try {
            const chapters = await this.client.chapters.findAll();
            const surahs = chapters.map(c => this._mapChapterToSurah(c));

            this.cache.set('allSurahs', surahs);
            return surahs;
        } catch (error) {
            console.error('[QuranAPI] Error fetching all surahs via SDK:', {
                message: error.message,
                status: error.status,
                stack: error.stack,
                error
            });
            // Fallback to direct fetch if SDK fails
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
    }

    /**
     * Fetch a specific surah with its verses
     */
    async getSurah(surahNumber) {
        const cacheKey = `surah-${surahNumber}`;
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

        try {
            const verses = await this.client.verses.findByChapter(surahNumber);
            this.cache.set(cacheKey, verses);
            return verses;
        } catch (error) {
            console.error(`[QuranAPI] Error fetching surah ${surahNumber}:`, {
                message: error.message,
                status: error.status,
                error
            });
            return null;
        }
    }

    /**
     * Get Mushaf page data (verses with King Fahad Complex V2 glyphs and full text)
     */
    async getMushafPage(pageNumber) {
        const cacheKey = `mushaf-page-${pageNumber}`;
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

        try {
            // Fetch verses by page with all needed fields
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
                // Filter out invalid verses without chapterId
                const validVerses = verses.filter(v => v.chapterId);

                // Map to UI expected format (combination of QPC V2 and alquran.cloud formats for compatibility)
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
                        numberInSurah: v.verseNumber, // for ReadingPage/List compatibility
                        text: v.textUthmani, // for Paragraph mode
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
            return null;
        } catch (error) {
            console.error(`[QuranAPI] Error fetching mushaf page ${pageNumber} via SDK:`, {
                message: error.message,
                status: error.status,
                error
            });
            return null;
        }
    }

    /**
     * Get Surah Verse Images (for ReadingPage)
     */
    async getSurahVerseImages(surahNumber) {
        const cacheKey = `surah-images-${surahNumber}`;
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

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
            console.error(`[QuranAPI] Error fetching surah images ${surahNumber}:`, error);
            return null;
        }
    }

    /**
     * Get Surah Audio Data
     */
    async getSurahAudioData(surahNumber, recitationId) {
        try {
            const data = await this.client.audio.findChapterRecitationById(recitationId, surahNumber);
            return {
                audio_url: data.audioUrl,
                chapter_id: data.chapterId,
                file_size: data.fileSize,
                format: data.format
            };
        } catch (error) {
            console.error(`[QuranAPI] Error fetching audio for surah ${surahNumber}:`, error);
            return null;
        }
    }

    /**
     * Search Quran
     */
    async search(query) {
        try {
            const response = await this.client.search.search(query, {
                mode: 'quick'
            });
            return response;
        } catch (error) {
            console.error('[QuranAPI] Search error:', error);
            return null;
        }
    }
}

export const quranAPI = new QuranService();
