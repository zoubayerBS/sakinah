import Dexie from 'dexie';

export const db = new Dexie('SkinaDB');

// Define Database Schema
db.version(2).stores({
    mushaf_pages: 'pageNumber, timestamp',
    tafsirs: '[verseKey+tafsirId], timestamp',
    verse_info: 'verseKey, timestamp', // New table
    kv_store: 'key' // For Khitma state, preferences, etc.
});

// Proof that Dexie is working
db.on('ready', () => {
    console.log("%c 🟢 SkinaDB (Dexie) is Ready ", "background: #2e7d32; color: white; padding: 2px 5px; border-radius: 4px; font-weight: bold;");
});

// Helper functions for KV Store (localStorage replacement)
export const kvService = {
    async set(key, value) {
        return await db.kv_store.put({ key, value });
    },

    async get(key) {
        const item = await db.kv_store.get(key);
        return item ? item.value : null;
    },

    async delete(key) {
        return await db.kv_store.delete(key);
    }
};

// Mushaf Caching Service
export const mushafCache = {
    async getPage(pageNumber) {
        return await db.mushaf_pages.get(pageNumber);
    },

    async setPage(pageNumber, data) {
        return await db.mushaf_pages.put({
            pageNumber,
            data,
            timestamp: Date.now()
        });
    }
};

// Tafsir Caching Service
export const tafsirCache = {
    async getTafsir(verseKey, tafsirId) {
        return await db.tafsirs.get([verseKey, tafsirId]);
    },

    async setTafsir(verseKey, tafsirId, text) {
        return await db.tafsirs.put({
            verseKey,
            tafsirId,
            text,
            timestamp: Date.now()
        });
    }
};

// Verse Info Caching Service
export const verseCache = {
    async getVerse(verseKey) {
        return await db.verse_info.get(verseKey);
    },

    async setVerse(verseKey, data) {
        return await db.verse_info.put({
            verseKey,
            data,
            timestamp: Date.now()
        });
    }
};
