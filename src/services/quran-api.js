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
                audio_url: data.audioUrl || data.audio_url || null,
                chapter_id: data.chapterId || data.chapter_id || null,
                file_size: data.fileSize || data.file_size || null,
                format: data.format || null
            };
        } catch (error) {
            console.error(`[QuranAPI] Error fetching audio for surah ${surahNumber} via Proxy:`, error);
        }
        return null;
    }

    /**
     * Get a random verse (for Ayah of the Day)
     */
    async getRandomVerse() {
        try {
            const response = await fetch('/api/verse/random');
            if (!response.ok) throw new Error('Proxy error');
            return await response.json();
        } catch (error) {
            console.error('[QuranAPI] Error fetching random verse via Proxy:', error);
        }
        return null;
    }

    /**
     * Get Reciters (Recitations)
     */
    async getReciters() {
        if (this.cache.has('reciters')) return this.cache.get('reciters');

        try {
            const response = await fetch('/api/reciters');
            if (!response.ok) throw new Error('Proxy error');

            const reciters = await response.json();
            const mapped = reciters
                .map(r => {
                    const identifier = String(r.identifier ?? r.id ?? '');
                    if (!identifier) return null;
                    const englishRaw = r.englishName || r.name || r.reciter_name || '';
                    const nameCandidate = r.arabicName || r.arabic_name || r.name || r.reciter_name || r.englishName || '';
                    const arabicAlias =
                        getArabicReciterName(nameCandidate) ||
                        getArabicReciterName(englishRaw) ||
                        getArabicReciterName(identifier);
                    const arabicName = arabicAlias || (ARABIC_CHAR_REGEX.test(nameCandidate) ? nameCandidate : '');
                    return {
                        identifier,
                        name: arabicName || resolveReciterName({ reciterName: englishRaw, translatedName: { name: englishRaw }, id: identifier }),
                        englishName: englishRaw || resolveReciterEnglishName({ translatedName: { name: englishRaw }, id: identifier }),
                        source: r.source || (r.id ? 'qf' : 'cdn'),
                        bitrate: r.bitrate || null,
                        moshaf: Array.isArray(r.moshaf) ? r.moshaf : [],
                        server: r.server || null,
                        defaultMoshafId: r.defaultMoshafId || null,
                    };
                })
                .filter(Boolean);

            this.cache.set('reciters', mapped);
            return mapped;
        } catch (error) {
            console.error('[QuranAPI] Error fetching reciters via Proxy:', error);
        }
        return [];
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

const ARABIC_CHAR_REGEX = /[\u0600-\u06FF]/;

const RECITER_ARABIC_ALIASES = new Map([
    ['mishary rashid alafasy', '\u0645\u0634\u0627\u0631\u064a \u0631\u0627\u0634\u062f \u0627\u0644\u0639\u0641\u0627\u0633\u064a'],
    ['mishary rashid al afasy', '\u0645\u0634\u0627\u0631\u064a \u0631\u0627\u0634\u062f \u0627\u0644\u0639\u0641\u0627\u0633\u064a'],
    ['mishary alafasy', '\u0645\u0634\u0627\u0631\u064a \u0631\u0627\u0634\u062f \u0627\u0644\u0639\u0641\u0627\u0633\u064a'],
    ['abdur rahman al sudais', '\u0639\u0628\u062f \u0627\u0644\u0631\u062d\u0645\u0646 \u0627\u0644\u0633\u062f\u064a\u0633'],
    ['abdurrahman al sudais', '\u0639\u0628\u062f \u0627\u0644\u0631\u062d\u0645\u0646 \u0627\u0644\u0633\u062f\u064a\u0633'],
    ['abdul rahman al sudais', '\u0639\u0628\u062f \u0627\u0644\u0631\u062d\u0645\u0646 \u0627\u0644\u0633\u062f\u064a\u0633'],
    ['saud al shuraim', '\u0633\u0639\u0648\u062f \u0627\u0644\u0634\u0631\u064a\u0645'],
    ['saud ash shuraim', '\u0633\u0639\u0648\u062f \u0627\u0644\u0634\u0631\u064a\u0645'],
    ['maher al muaiqly', '\u0645\u0627\u0647\u0631 \u0627\u0644\u0645\u0639\u064a\u0642\u0644\u064a'],
    ['maher almuaiqly', '\u0645\u0627\u0647\u0631 \u0627\u0644\u0645\u0639\u064a\u0642\u0644\u064a'],
    ['ahmed al ajamy', '\u0623\u062d\u0645\u062f \u0627\u0644\u0639\u062c\u0645\u064a'],
    ['ahmed al ajmi', '\u0623\u062d\u0645\u062f \u0627\u0644\u0639\u062c\u0645\u064a'],
    ['husary', '\u0627\u0644\u062d\u0635\u0631\u064a'],
    ['al husary', '\u0627\u0644\u062d\u0635\u0631\u064a'],
    ['mahmoud khalil al husary', '\u0645\u062d\u0645\u0648\u062f \u062e\u0644\u064a\u0644 \u0627\u0644\u062d\u0635\u0631\u064a'],
    ['hudhaify', '\u0627\u0644\u062d\u0630\u064a\u0641\u064a'],
    ['abdul basit abdus samad', '\u0639\u0628\u062f \u0627\u0644\u0628\u0627\u0633\u0637 \u0639\u0628\u062f \u0627\u0644\u0635\u0645\u062f'],
    ['abdul basit abdussamad', '\u0639\u0628\u062f \u0627\u0644\u0628\u0627\u0633\u0637 \u0639\u0628\u062f \u0627\u0644\u0635\u0645\u062f'],
    ['abdulbaset abdus samad', '\u0639\u0628\u062f \u0627\u0644\u0628\u0627\u0633\u0637 \u0639\u0628\u062f \u0627\u0644\u0635\u0645\u062f'],
    ['minshawi', '\u0627\u0644\u0645\u0646\u0634\u0627\u0648\u064a'],
    ['muhammad siddiq al minshawi', '\u0645\u062d\u0645\u062f \u0635\u062f\u064a\u0642 \u0627\u0644\u0645\u0646\u0634\u0627\u0648\u064a'],
    ['abu bakr al shatri', '\u0623\u0628\u0648 \u0628\u0643\u0631 \u0627\u0644\u0634\u0627\u0637\u0631\u064a'],
    ['saad al ghamdi', '\u0633\u0639\u062f \u0627\u0644\u063a\u0627\u0645\u062f\u064a'],
    ['nasser al qatami', '\u0646\u0627\u0635\u0631 \u0627\u0644\u0642\u0637\u0627\u0645\u064a'],
    ['ali jaber', '\u0639\u0644\u064a \u062c\u0627\u0628\u0631'],
    ['muhammad ayyub', '\u0645\u062d\u0645\u062f \u0623\u064a\u0648\u0628'],
    ['salah bukhatir', '\u0635\u0644\u0627\u062d \u0628\u0648\u062e\u0627\u0637\u0631']
]);

const normalizeReciterKey = (name) =>
    String(name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();

const getArabicReciterName = (name) => {
    if (!name) return '';
    if (ARABIC_CHAR_REGEX.test(name)) return name;
    const normalized = normalizeReciterKey(name);
    return RECITER_ARABIC_ALIASES.get(normalized) || '';
};

const resolveReciterEnglishName = (reciter) =>
    reciter?.translatedName?.name || reciter?.reciterName || `Reciter ${reciter?.id}`;

const resolveReciterName = (reciter) => {
    const rawName = reciter?.reciterName || reciter?.translatedName?.name || '';
    const arabicName = getArabicReciterName(rawName);
    if (arabicName) return arabicName;

    const translated = reciter?.translatedName?.name || '';
    if (ARABIC_CHAR_REGEX.test(translated)) return translated;

    return rawName || `Reciter ${reciter?.id}`;
};
