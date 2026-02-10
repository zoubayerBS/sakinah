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

        const defaultMoshaf = moshaf.find((m) => m.server) || moshaf[0] || null;

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

// 5. Get Audio
router.get('/audio/:recitationId/:chapterId', async (req, res) => {
    try {
        const { recitationId, chapterId } = req.params;
        const reciterId = String(recitationId);

        if (!recitersCache.data || Date.now() - recitersCache.ts >= RECITER_CACHE_TTL) {
            const { mapped, byId } = await fetchMp3QuranReciters();
            recitersCache = { data: mapped, ts: Date.now(), byId };
        }

        const reciter = recitersCache.byId.get(reciterId);
        if (!reciter?.server) {
            throw new Error('Reciter server not found');
        }

        const padded = String(chapterId).padStart(3, '0');
        const audioUrl = `${reciter.server}${padded}.mp3`;

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

        const { mapped, byId } = await fetchMp3QuranReciters();

        recitersCache = { data: mapped, ts: Date.now(), byId };
        res.json(mapped);
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

// Mount router at /api
app.use('/api', router);

export default app;
