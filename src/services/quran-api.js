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

        // Initialize SDK Client with proxied endpoints
        console.log('[QuranService] Initialization Info:', {
            clientId: clientId ? `${clientId.substring(0, 6)}...` : 'MISSING',
            clientSecretSnippet: clientSecret ? `Len:${clientSecret.length}, Suffix:${clientSecret.slice(-3)}` : 'MISSING',
            contentBaseUrl,
            authBaseUrl,
            isProduction: import.meta.env.PROD
        });

        this.client = new QuranClient({
            clientId,
            clientSecret,
            contentBaseUrl: contentBaseUrl || 'https://apis.quran.foundation',
            authBaseUrl: authBaseUrl || 'https://oauth2.quran.foundation',
        });

        // Run manual auth health check if credentials exist
        if (clientId && clientSecret) {
            this._testAuth(clientId, clientSecret, authBaseUrl).catch(err => {
                console.error('[QuranAPI] Manual Auth Check Error:', err);
            });
        }

        // Backup bases for direct fetch if needed
        this.publicBase = 'https://api.quran.com/api/v4';
        this.legacyBase = 'https://api.alquran.cloud/v1';
    }

    /**
     * Manual OAuth2 Token Health Check
     */
    async _testAuth(clientId, clientSecret, authBaseUrl) {
        const url = `${authBaseUrl || '/oauth2-proxy'}/oauth2/token`;
        console.log(`[QuranAPI] Testing OAuth2 endpoint: ${url}`);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: clientId,
                    client_secret: clientSecret,
                    scope: 'content'
                })
            });

            let data = await response.json();
            console.log('[QuranAPI] Manual Auth (Body Method) Status:', response.status);

            if (!response.ok) {
                console.warn('[QuranAPI] Manual Auth (Body Method) Failed:', data);

                // Try alternate: Basic Auth
                console.log('[QuranAPI] Retrying with Basic Auth method...');
                const credentials = btoa(`${clientId}:${clientSecret}`);
                const basicResponse = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        grant_type: 'client_credentials',
                        scope: 'content'
                    })
                });

                const basicData = await basicResponse.json();
                console.log('[QuranAPI] Manual Auth (Basic Method) Status:', basicResponse.status);
                if (basicResponse.ok) {
                    console.log('[QuranAPI] Manual Auth Successful via Basic Auth!');
                } else {
                    console.warn('[QuranAPI] Manual Auth (Basic Method) Failed:', basicData);
                }
            } else {
                console.log('[QuranAPI] Manual Auth Successful via Body Method. Token starts with:', data.access_token?.substring(0, 10));
            }
        } catch (error) {
            console.error('[QuranAPI] Manual Auth Fetch Failed:', error);
        }
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
