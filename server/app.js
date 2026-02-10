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
        const data = await client.audio.findChapterRecitationById(Number(recitationId), Number(chapterId));
        res.json(data);
    } catch (error) {
        console.error(`Error fetching audio:`, error);
        res.status(500).json({ error: error.message });
    }
});

// 6. Search
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
