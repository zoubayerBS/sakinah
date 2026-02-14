import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { QuranClient } from '@quranjs/api';

dotenv.config();

const app = express();
const router = express.Router();

// Allow CORS from frontend
app.use(cors());
app.use(express.json());

// Initialize Quran Client
const clientId = process.env.QURAN_CLIENT_ID || process.env.VITE_QURAN_CLIENT_ID;
const clientSecret = process.env.QURAN_CLIENT_SECRET || process.env.VITE_QURAN_CLIENT_SECRET;

if (!clientId || !clientSecret) {
    console.warn('⚠️  WARNING: QURAN_CLIENT_ID or QURAN_CLIENT_SECRET is missing.');
}

// Helper to get client (re-initialized if needed or just singleton)
const getClient = () => {
    return new QuranClient({
        clientId,
        clientSecret,
        contentBaseUrl: 'https://apis.quran.foundation',
        authBaseUrl: 'https://oauth2.quran.foundation'
    });
};

const client = getClient();

const MP3QURAN_API_BASE = 'https://mp3quran.net/api/v3';
const RECITER_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
let recitersCache = { data: null, ts: 0, byId: new Map() };

const normalizeServerUrl = (server) => {
    if (!server) return '';
    return server.endsWith('/') ? server : `${server}/`;
};

const parseSurahList = (list) => {
    if (!list) return [];
    return String(list)
        .split(',')
        .map((v) => parseInt(v.trim(), 10))
        .filter((v) => Number.isFinite(v));
};

const hasArabic = (value, pattern) => {
    if (!value) return false;
    return pattern.test(String(value));
};

const includesText = (value, needles) => {
    if (!value) return false;
    const text = String(value).toLowerCase();
    return needles.some((needle) => text.includes(needle));
};

const RECITER_SERVER_HINTS = [
    {
        match: [/maher/i, /muaiqly/i, /muaiqil/i, /المعيقلي/, /ماهر/],
        includes: ['maher']
    },
];

const getServerHintsForReciter = (name) => {
    if (!name) return [];
    const value = String(name);
    const hit = RECITER_SERVER_HINTS.find((entry) => entry.match.some((rx) => rx.test(value)));
    return hit ? hit.includes : [];
};

const scoreMoshaf = (moshaf, chapterId, reciterName) => {
    if (!moshaf?.server) return -999;
    const name = moshaf.name || '';
    const rewaya = moshaf.rewaya || '';
    const surahTotal = Number(moshaf.surah_total || 0);
    const surahList = parseSurahList(moshaf.surah_list);
    const server = String(moshaf.server || '').toLowerCase();

    let score = 0;
    const serverHints = getServerHintsForReciter(reciterName);
    if (serverHints.length > 0 && serverHints.some((hint) => server.includes(hint))) {
        score += 6;
    }
    if (includesText(name, ['hafs', "hafs a'n assem", "hafs an asim"]) || includesText(rewaya, ['hafs']) || hasArabic(name, /حفص/) || hasArabic(rewaya, /حفص/)) {
        score += 5;
    }
    if (includesText(name, ['murattal', 'muratal', 'murrattal']) || hasArabic(name, /مرتل|مرتّل/)) {
        score += 3;
    }
    if (includesText(name, ['mujawwad']) || hasArabic(name, /مجود/)) {
        score -= 1;
    }
    if (surahTotal >= 114) score += 2;

    if (chapterId && surahList.length > 0) {
        score += surahList.includes(Number(chapterId)) ? 4 : -2;
    }

    return score;
};

const pickBestMoshaf = (moshafList, chapterId, reciterName, reciterId) => {
    if (!Array.isArray(moshafList) || moshafList.length === 0) return null;
    const directMatch = reciterId
        ? moshafList.find((m) => String(m.id) === String(reciterId) && m.server)
        : null;
    if (directMatch) return directMatch;

    const scored = moshafList
        .map((m) => ({ m, score: scoreMoshaf(m, chapterId, reciterName) }))
        .sort((a, b) => b.score - a.score);
    return scored[0]?.m || null;
};

const fetchMp3QuranReciters = async () => {
    const response = await fetch(`${MP3QURAN_API_BASE}/reciters?language=ar`);
    if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`MP3Quran reciters error: ${response.status} ${errorText.slice(0, 200)}`);
    }
    const data = await response.json();
    const reciters = Array.isArray(data?.reciters) ? data.reciters : [];

    const mapped = reciters.map((r) => {
        const moshafRaw = Array.isArray(r.moshaf) ? r.moshaf : [];
        const moshaf = moshafRaw.map((m) => ({
            id: m.id ? String(m.id) : null,
            name: m.name || '',
            server: normalizeServerUrl(m.server || m.Server || ''),
            surah_list: m.surah_list || '',
            surah_total: m.surah_total || null,
            rewaya: m.rewaya || null,
        }));

        const defaultMoshaf = pickBestMoshaf(moshaf, null, r.name, r.id) || moshaf.find((m) => m.server) || moshaf[0] || null;

        return {
            identifier: String(r.id),
            name: r.name || '',
            englishName: r.name || '',
            source: 'mp3quran',
            moshaf,
            defaultMoshafId: defaultMoshaf?.id || null,
            server: defaultMoshaf?.server || null,
        };
    });

    const byId = new Map(mapped.map((reciter) => [reciter.identifier, reciter]));

    return { mapped, byId };
};

// --- Endpoints ---

// 1. Get All Chapters (Surahs)
router.get('/chapters', async (req, res) => {
    try {
        const chapters = await client.chapters.findAll();
        res.json(chapters);
    } catch (error) {
        console.error('Error fetching chapters:', error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Get Specific Chapter (Surah) Verses
router.get('/chapter/:id/verses', async (req, res) => {
    try {
        const { id } = req.params;
        const verses = await client.verses.findByChapter(Number(id));
        res.json(verses);
    } catch (error) {
        console.error(`Error fetching verses for chapter ${req.params.id}:`, error);
        res.status(500).json({ error: error.message });
    }
});

// 3. Get Mushaf Page
router.get('/page/:page', async (req, res) => {
    try {
        const { page } = req.params;
        const verses = await client.verses.findByPage(Number(page), {
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
        res.json(verses);
    } catch (error) {
        console.error(`Error fetching page ${req.params.page}:`, error);
        res.status(500).json({ error: error.message });
    }
});

// 4. Get Chapter Images (for Reading Page)
router.get('/chapter/:id/images', async (req, res) => {
    try {
        const { id } = req.params;
        const verses = await client.verses.findByChapter(Number(id), {
            fields: {
                imageUrl: true,
                imageWidth: true
            }
        });
        res.json(verses);
    } catch (error) {
        console.error(`Error fetching images for chapter ${req.params.id}:`, error);
        res.status(500).json({ error: error.message });
    }
});

const getRecitersWithFallback = async () => {
    try {
        const { mapped, byId } = await fetchMp3QuranReciters();
        return { mapped, byId };
    } catch (apiError) {
        console.error('MP3Quran API failed, using fallback reciters:', apiError.message);

        // Fallback: Hardcoded popular reciters with direct Quran.com CDN links
        const fallbackReciters = [
            {
                identifier: '7',
                name: 'مشاري بن راشد العفاسي',
                englishName: 'Mishari Rashid al-`Afasy',
                source: 'fallback',
                moshaf: [{
                    id: '1',
                    name: 'المصحف المرتل',
                    server: 'https://server8.mp3quran.net/afs/',
                    surah_list: '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114',
                    surah_total: 114,
                    rewaya: 'حفص عن عاصم'
                }],
                defaultMoshafId: '1',
                server: 'https://server8.mp3quran.net/afs/'
            },
            {
                identifier: '1',
                name: 'عبد الباسط عبد الصمد',
                englishName: 'Abdul Basit Abdul Samad',
                source: 'fallback',
                moshaf: [{
                    id: '1',
                    name: 'المصحف المرتل',
                    server: 'https://server7.mp3quran.net/basit/',
                    surah_list: '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114',
                    surah_total: 114,
                    rewaya: 'حفص عن عاصم'
                }],
                defaultMoshafId: '1',
                server: 'https://server7.mp3quran.net/basit/'
            },
            {
                identifier: '5',
                name: 'محمد صديق المنشاوي',
                englishName: 'Mohamed Siddiq al-Minshawi',
                source: 'fallback',
                moshaf: [{
                    id: '1',
                    name: 'المصحف المرتل',
                    server: 'https://server10.mp3quran.net/minsh/',
                    surah_list: '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114',
                    surah_total: 114,
                    rewaya: 'حفص عن عاصم'
                }],
                defaultMoshafId: '1',
                server: 'https://server10.mp3quran.net/minsh/'
            }
        ];

        const fallbackById = new Map();
        fallbackReciters.forEach(r => fallbackById.set(r.identifier, r));

        return { mapped: fallbackReciters, byId: fallbackById };
    }
};

// 5. Get Audio
router.get('/audio/:recitationId/:chapterId', async (req, res) => {
    try {
        const { recitationId, chapterId } = req.params;
        const { moshafId } = req.query;
        const reciterId = String(recitationId);

        if (!recitersCache.data || Date.now() - recitersCache.ts >= RECITER_CACHE_TTL) {
            const { mapped, byId } = await getRecitersWithFallback();
            recitersCache = { data: mapped, ts: Date.now(), byId };
        }

        const reciter = recitersCache.byId.get(reciterId);
        if (!reciter) {
            throw new Error('Reciter server not found');
        }

        const moshafList = reciter.moshaf || [];
        const requestedMoshaf = moshafId
            ? moshafList.find((m) => String(m.id) === String(moshafId))
            : null;
        const selectedMoshaf = (requestedMoshaf && requestedMoshaf.server)
            ? requestedMoshaf
            : pickBestMoshaf(moshafList, Number(chapterId), reciter.name, reciterId);
        const server = selectedMoshaf?.server || reciter.server;
        if (!server) throw new Error('Reciter server not found');

        const padded = String(chapterId).padStart(3, '0');
        const audioUrl = `${server}${padded}.mp3`;

        res.json({
            audioUrl,
            chapterId: Number(chapterId) || null,
            fileSize: null,
            format: 'mp3'
        });
    } catch (error) {
        console.error(`Error fetching audio:`, error);
        res.status(500).json({ error: error.message });
    }
});

// 6. Get Reciters (Recitations)
router.get('/reciters', async (req, res) => {
    try {
        if (recitersCache.data && Date.now() - recitersCache.ts < RECITER_CACHE_TTL) {
            return res.json(recitersCache.data);
        }

        const { mapped, byId } = await getRecitersWithFallback();
        recitersCache = { data: mapped, ts: Date.now(), byId };
        return res.json(mapped);
    } catch (error) {
        console.error('Error fetching reciters:', error);
        res.status(500).json({ error: error.message });
    }
});

// 7. Random Verse (Ayah of the Day)
router.get('/verse/random', async (req, res) => {
    try {
        const verse = await client.verses.findRandom({
            fields: {
                textUthmani: true,
                textUthmaniSimple: true,
            },
        });

        const rawVerseKey = verse?.verseKey || verse?.verse_key || '';
        const keyParts = rawVerseKey.includes(':') ? rawVerseKey.split(':') : [];
        const keySurah = keyParts[0] ? parseInt(keyParts[0], 10) : null;
        const keyAyah = keyParts[1] ? parseInt(keyParts[1], 10) : null;

        const chapterId = keySurah || (verse?.chapterId ? Number(verse.chapterId) : null);
        const chapter = chapterId ? await client.chapters.findById(String(chapterId)) : null;

        const numberInSurah = Number.isFinite(keyAyah)
            ? keyAyah
            : (verse?.verseNumberInChapter || verse?.verseNumber || null);

        res.json({
            text: verse?.textUthmani || verse?.textUthmaniSimple || '',
            surah: chapter?.nameArabic || '',
            number: Number.isFinite(numberInSurah) ? numberInSurah : null,
            surahNumber: chapter?.id || keySurah || null,
            verseKey: rawVerseKey || null,
        });
    } catch (error) {
        console.error('Error fetching random verse:', error);
        res.status(500).json({ error: error.message });
    }
});

// 8. Search
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ error: 'Query parameter "q" is required' });

        const response = await client.search.search(String(q), {
            mode: 'quick'
        });
        res.json(response);
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).json({ error: error.message });
    }
});

// Cache for custom tafsirs
let tahrir_wa_tanwir_cache = null;

// 9. Get Tafsir
router.get('/tafsir/:tafsirId/:verseKey', async (req, res) => {
    try {
        const { tafsirId, verseKey } = req.params;

        // Handle custom Tahrir wa Tanwir (ID 999)
        if (tafsirId === '999') {
            // Parse verseKey (e.g., "1:1" or "2:255")
            const [surah, ayah] = verseKey.split(':').map(Number);

            if (!surah || !ayah) {
                throw new Error('Invalid verse key format');
            }

            // Fetch from GitHub if not cached
            if (!tahrir_wa_tanwir_cache) {
                console.log('Fetching Tahrir wa Tanwir from GitHub...');
                const response = await fetch('https://raw.githubusercontent.com/SAFI174/tafsir-json/main/json/ar.tanweer.json');
                if (!response.ok) throw new Error('Failed to fetch Tahrir wa Tanwir');
                tahrir_wa_tanwir_cache = await response.json();
            }

            // Access nested array: tafsir[surah-1][ayah-1]
            const tafsirText = tahrir_wa_tanwir_cache?.tafsir?.[surah - 1]?.[ayah - 1];

            if (!tafsirText) {
                throw new Error('Tafsir not found for this verse');
            }

            // Return in Quran.com API compatible format
            return res.json({
                text: tafsirText,
                resource_name: 'التحرير والتنوير',
                resource_id: 999
            });
        }

        // Default: Using Quran.com V4 API for other Tafsirs
        const response = await fetch(`https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_ayah/${verseKey}`);

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            throw new Error(`Tafsir API error: ${response.status} ${errorText.slice(0, 100)}`);
        }

        const data = await response.json();
        // Return just the relevant inner object if it exists (Quran.com V4 wraps in 'tafsir')
        res.json(data.tafsir || data);
    } catch (error) {
        console.error(`Error fetching tafsir ${req.params.tafsirId} for ${req.params.verseKey}:`, error);
        res.status(500).json({ error: error.message });
    }
});

// 10. Get Available Tafsirs
router.get('/tafsirs', async (req, res) => {
    try {
        const response = await fetch('https://api.quran.com/api/v4/resources/tafsirs');
        if (!response.ok) throw new Error('Failed to fetch tafsirs');
        const data = await response.json();

        // Manual mapping of Arabic tafsir names (API doesn't provide them without language filter)
        const arabicNames = {
            16: 'التفسير الميسر',
            14: 'تفسير ابن كثير',
            15: 'تفسير الطبري',
            90: 'تفسير القرطبي',
            91: 'تفسير السعدي',
            93: 'التفسير الوسيط',
            94: 'تفسير البغوي',
            92: 'تفسير تنوير المقباس'
        };

        // Transform tafsir names to use Arabic when available
        const transformedTafsirs = (data.tafsirs || []).map(t => {
            // Use Arabic name if available, otherwise keep original
            const displayName = arabicNames[t.id] || t.name;

            return {
                id: t.id,
                name: displayName,
                author_name: t.author_name,
                language_name: t.language_name,
                slug: t.slug,
                translated_name: t.translated_name
            };
        });

        // Add custom Tahrir wa Tanwir at the beginning
        transformedTafsirs.unshift({
            id: 999,
            name: 'التحرير والتنوير',
            author_name: 'ابن عاشور',
            language_name: 'arabic',
            slug: 'ar-tahrir-wa-tanwir',
            translated_name: { name: 'التحرير والتنوير', language_name: 'arabic' }
        });

        res.json(transformedTafsirs);
    } catch (error) {
        console.error('Error fetching tafsirs resource:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mount router at /api
app.use('/api', router);

export default app;
