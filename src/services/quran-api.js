/**
 * Quran API Service
 * 
 * Refactored to use a Backend Proxy (Solution 1) to avoid CORS/Auth issues.
 * The frontend now calls /api/* endpoints, which are proxied to a local 
 * Node/Express server (or Vercel function) that handles the actual SDK calls.
 */
class QuranService {
    constructor() {
        this.cache = new Map();
        
        // Public API endpoints for fallback (if needed, though we rely on our proxy now)
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
            // Call our backend proxy
            const response = await fetch('/api/chapters');
            if (!response.ok) throw new Error('Proxy error');
            
            const chapters = await response.json();
            const surahs = chapters.map(c => this._mapChapterToSurah(c));
            this.cache.set('allSurahs', surahs);
            return surahs;
        } catch (error) {
            console.error('[QuranAPI] Error fetching all surahs via Proxy:', error);
            
            // Fallback to legacy API if proxy fails
            return this._fallbackGetAllSurahs();
        }
    }

    async _fallbackGetAllSurahs() {
        try {
            const response = await fetch(`${this.legacyBase}/surah`);
            const data = await response.json();
            if (data.code === 200) {
                return data.data.map(surah => ({
                    number: surah.number,
                    name: surah.name.replace(/[\u064B-\u0652\u06D6-\u06ED]/g, ''),
                    transliteration: surah.englishName,
                    translation: surah.englishNameTranslation,
                    verses: surah.numberOfAyahs,
                    revelation: surah.revelationType
                }));
            }
        } catch (e) {
            console.error('[QuranAPI] Fallback failed:', e);
        }
        return [];
    }

    /**
     * Fetch a specific surah with its verses
     */
    async getSurah(surahNumber) {
        const cacheKey = `surah-${surahNumber}`;
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

        try {
            const response = await fetch(`/api/chapter/${surahNumber}/verses`);
            if (!response.ok) throw new Error('Proxy error');
            
            const verses = await response.json();
            this.cache.set(cacheKey, verses);
            return verses;
        } catch (error) {
            console.error(`[QuranAPI] Error fetching surah ${surahNumber} via Proxy:`, error);
        }
        return null;
    }

    /**
     * Get Mushaf page data (verses with King Fahad Complex V2 glyphs and full text)
     */
    async getMushafPage(pageNumber) {
        const cacheKey = `mushaf-page-${pageNumber}`;
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

        try {
            const response = await fetch(`/api/page/${pageNumber}`);
            if (!response.ok) throw new Error('Proxy error');
            
            const verses = await response.json();

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
            console.error(`[QuranAPI] Error fetching mushaf page ${pageNumber} via Proxy:`, error);
        }

        return null;
    }

    /**
     * Get Surah Verse Images (for ReadingPage)
     */
    async getSurahVerseImages(surahNumber) {
        const cacheKey = `surah-images-${surahNumber}`;
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

        try {
            const response = await fetch(`/api/chapter/${surahNumber}/images`);
            if (!response.ok) throw new Error('Proxy error');
            
            const verses = await response.json();

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
            console.error(`[QuranAPI] Error fetching surah images ${surahNumber} via Proxy:`, error);
        }

        return null;
    }

    /**
     * Get Surah Audio Data
     */
    async getSurahAudioData(surahNumber, recitationId) {
        try {
            const response = await fetch(`/api/audio/${recitationId}/${surahNumber}`);
            if (!response.ok) throw new Error('Proxy error');
            
            const data = await response.json();
            return {
                audio_url: data.audioUrl,
                chapter_id: data.chapterId,
                file_size: data.fileSize,
                format: data.format
            };
        } catch (error) {
            console.error(`[QuranAPI] Error fetching audio for surah ${surahNumber} via Proxy:`, error);
        }
        return null;
    }

    /**
     * Search Quran
     */
    async search(query) {
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Proxy error');
            return await response.json();
        } catch (error) {
            console.error('[QuranAPI] Search error via Proxy:', error);
        }
        return null;
    }
}

export const quranAPI = new QuranService();