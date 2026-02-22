import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as db from '../services/db.js';
import { saveLastRead, getLastRead, saveKhitmaState, getKhitmaState } from './storage-utils.js';

// Mock the kvService
vi.mock('../services/db.js', () => {
    let mockStore = {};
    return {
        kvService: {
            set: vi.fn(async (key, val) => { mockStore[key] = val; }),
            get: vi.fn(async (key) => mockStore[key]),
            _resetMockStore: () => { mockStore = {}; } // helper for tests
        }
    };
});

// Mock localStorage as well
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
        clear: vi.fn(() => { store = {}; })
    };
})();
vi.stubGlobal('localStorage', localStorageMock);

describe('Storage Utils', () => {
    beforeEach(() => {
        db.kvService._resetMockStore();
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    describe('saveLastRead & getLastRead', () => {
        it('should save data to both Dexie and localStorage, and retrieve it correctly', async () => {
            const data = { surahNumber: 2, surahName: 'Al-Baqarah', verseNumber: 5 };

            await saveLastRead(data);

            // Should be saved in DB
            expect(db.kvService.set).toHaveBeenCalledWith('quran_last_read', {
                surahNumber: 2,
                surahName: 'Al-Baqarah',
                verseNumber: 5,
                timestamp: expect.any(Number)
            });

            // Should be saved in localStorage fallback
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'quran_last_read',
                expect.any(String)
            );

            // Force the mock to return data for get
            db.kvService.get.mockResolvedValueOnce({ surahNumber: 2 });
            const result = await getLastRead();
            expect(result).toEqual({ surahNumber: 2 });
        });
    });

    describe('saveKhitmaState & getKhitmaState', () => {
        it('should correctly store complex Khitma objects', async () => {
            const khitma = { isStarted: true, progress: 10, mode: 'pages' };
            await saveKhitmaState(khitma);

            expect(db.kvService.set).toHaveBeenCalledWith('khitma_state', khitma);

            db.kvService.get.mockResolvedValueOnce(khitma);
            const loaded = await getKhitmaState();
            expect(loaded.isStarted).toBe(true);
            expect(loaded.mode).toBe('pages');
        });
    });
});
