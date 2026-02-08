/**
 * Quran API Service
 * Handles data fetching from alquran.cloud with caching and optimization
 */

class QuranService {
    constructor() {
        this.baseUrl = 'https://api.alquran.cloud/v1';
        this.apiBase = import.meta.env.VITE_QURAN_API_BASE || 'https://apis.quran.foundation/content/api/v4';
        this.oauthEndpoint = import.meta.env.VITE_QURAN_OAUTH_ENDPOINT || 'https://oauth2.quran.foundation';
        this.cache = new Map();
        this.token = null;
        this.tokenExpiry = 0;
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
     * Fetch verse images for a specific surah
     * @param {number} surahNumber 
     */
    async getSurahVerseImages(surahNumber) {
        const cacheKey = `surah-images-${surahNumber}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Try authenticated API first
        try {
            // mushaf_id=1 corresponds to "Madani" which is the most widely supported
            const url = `${this.apiBase}/verses/by_chapter/${surahNumber}?mushaf_id=1&fields=image_url,image_width,verse_number`;
            const response = await this.authenticatedFetch(url);

            if (response && response.ok) {
                const data = await response.json();

                if (data.verses) {
                    // Process image URLs to ensure they're absolute and use SSL
                    const processedVerses = data.verses.map(verse => {
                        let imageUrl = verse.image_url;
                        if (imageUrl) {
                            // Fix rackcdn SSL certificate error
                            imageUrl = imageUrl.replace(/\.r\d+\.cf\d+\.rackcdn\.com/, '.ssl.cf1.rackcdn.com');
                            imageUrl = imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl;
                        }
                        return {
                            ...verse,
                            image_url: imageUrl,
                            numberInSurah: verse.verse_number
                        };
                    });

                    this.cache.set(cacheKey, processedVerses);
                    return processedVerses;
                }
            }
        } catch (error) {
            console.warn(`[QuranAPI] Authenticated API failed, falling back to public API:`, error);
        }

        // Fallback: Use alquran.cloud public API (no authentication needed)
        try {
            const url = `${this.baseUrl}/surah/${surahNumber}/quran-uthmani`;
            const response = await fetch(url, {
                headers: { 'Accept-Encoding': 'gzip' }
            });
            const data = await response.json();

            if (data.code === 200 && data.data.ayahs) {
                // Return verse data without images (text only fallback)
                const verses = data.data.ayahs.map(ayah => ({
                    verse_number: ayah.numberInSurah,
                    numberInSurah: ayah.numberInSurah,
                    text: ayah.text,
                    image_url: null,
                    hasImage: false
                }));

                this.cache.set(cacheKey, verses);
                return verses;
            }
        } catch (error) {
            console.error(`[QuranAPI] Fallback API also failed for surah ${surahNumber}:`, error);
        }

        return null;
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

    /**
     * Get an OAuth2 access token using client credentials
     */
    async getAccessToken() {
        if (this.token && this.tokenExpiry > Date.now()) {
            return this.token;
        }

        const clientId = import.meta.env.VITE_QURAN_CLIENT_ID;
        const clientSecret = import.meta.env.VITE_QURAN_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            console.error('[QuranAPI] CRITICAL: Missing Client ID or Secret for authentication.', {
                hasClientId: !!clientId,
                hasClientSecret: !!clientSecret,
                env: import.meta.env.MODE
            });
            return null;
        }

        try {
            // Encode client_id:client_secret for Basic Authentication
            const credentials = btoa(`${clientId}:${clientSecret}`);

            const response = await fetch(`${this.oauthEndpoint}/oauth2/token`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${credentials}`
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    scope: 'content'
                })
            });

            const data = await response.json();
            if (data.access_token) {
                this.token = data.access_token;
                // Tokens are usually valid for 1 hour (3600 seconds)
                this.tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000 - 60000; // 1 minute buffer
                return this.token;
            }
            throw new Error(data.error_description || 'Authentication failed');
        } catch (error) {
            console.error('[QuranAPI] OAuth2 Token Error:', error);
            return null;
        }
    }

    /**
     * Wrapper for fetch that includes authentication headers
     */
    async authenticatedFetch(url, options = {}) {
        const token = await this.getAccessToken();
        if (!token) {
            throw new Error('No authentication token available');
        }

        const clientId = import.meta.env.VITE_QURAN_CLIENT_ID;

        // Try using only the specific Quran.Foundation headers to avoid WAF conflicts
        const authHeaders = {
            'Accept': 'application/json',
            'x-auth-token': token,
            'x-client-id': clientId,
            ...options.headers
        };

        // Debug: Log header composition (masking token)
        console.log('[QuranAPI] Requesting:', url, {
            clientId,
            tokenPrefix: token.substring(0, 10) + '...',
            hasAuthHeader: !!authHeaders['Authorization'],
            hasXTokenHeader: !!authHeaders['x-auth-token']
        });

        const response = await fetch(url, { ...options, headers: authHeaders });

        if (response.status === 403) {
            try {
                const errorData = await response.clone().json();
                console.error('[QuranAPI] 403 Forbidden details:', JSON.stringify({
                    url,
                    status: response.status,
                    error: errorData
                }, null, 2));
            } catch (e) {
                const text = await response.clone().text();
                console.error('[QuranAPI] 403 Forbidden (text):', text);
            }
        }

        return response;
    }

    /**
     * Get Mushaf page data (verses with image URLs)
     * @param {number} pageNumber 
     */
    async getAuthenticatedMushafPage(pageNumber) {
        const cacheKey = `mushaf-page-${pageNumber}`;
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

        try {
            // Found working endpoint and parameters for high-quality authenticated images
            // mushaf_id=1 corresponds to "Madani"
            const url = `${this.apiBase}/verses/by_page/${pageNumber}?mushaf_id=1&fields=image_url,image_width`;
            const response = await this.authenticatedFetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[QuranAPI] API Error (${response.status}):`, errorText);
                return null;
            }

            const data = await response.json();

            if (data.verses) {
                // Ensure image URLs are absolute with https protocol
                const processedVerses = data.verses.map(verse => {
                    let imageUrl = verse.image_url;
                    if (imageUrl) {
                        // Fix rackcdn SSL certificate error by using the .ssl. subdomain
                        imageUrl = imageUrl.replace(/\.r\d+\.cf\d+\.rackcdn\.com/, '.ssl.cf1.rackcdn.com');
                        imageUrl = imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl;
                    }
                    return { ...verse, image_url: imageUrl };
                });

                this.cache.set(cacheKey, processedVerses);
                return processedVerses;
            }
            return null;
        } catch (error) {
            console.error(`[QuranAPI] Error fetching authenticated mushaf page ${pageNumber}:`, error);
            return null;
        }
    }

    /**
     * Get the URL for a Mushaf page image
     * @param {number} pageNumber - 1 to 604
     */
    getPageImageUrl(pageNumber) {
        const paddedPage = pageNumber.toString().padStart(3, '0');
        // Standard high-quality Madani Mushaf images
        return `https://android.quran.com/data/page_images/page${paddedPage}.png`;
    }
}

export const quranAPI = new QuranService();
