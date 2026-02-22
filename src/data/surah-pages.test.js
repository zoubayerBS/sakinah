import { describe, it, expect } from 'vitest';
import { surahPageMapping } from './surah-pages.js';

describe('Quran Metadata & Mapping Data Integrity', () => {
    it('should contain mapped data for all 114 Surahs', () => {
        const surahKeys = Object.keys(surahPageMapping);
        expect(surahKeys.length).toBe(114);

        // Verify key integrity from 1 to 114
        for (let i = 1; i <= 114; i++) {
            expect(surahPageMapping[i]).toBeDefined();
        }
    });

    it('should have valid starting pages for all Surahs', () => {
        Object.values(surahPageMapping).forEach((surah) => {
            expect(surah.start).toBeGreaterThanOrEqual(1);
            expect(surah.start).toBeLessThanOrEqual(604);
            expect(typeof surah.start).toBe('number');
        });
    });

    it('should verify critical markers (Al-Fatihah, Al-Baqarah, An-Nas)', () => {
        expect(surahPageMapping[1].start).toBe(1); // Al Fatihah
        expect(surahPageMapping[2].start).toBe(2); // Al Baqarah
        expect(surahPageMapping[114].start).toBe(604); // An-Nas
    });

    it('should ensure page sequences logically flow forward', () => {
        // e.g., Surah 2 cannot start before Surah 1
        for (let i = 1; i < 114; i++) {
            const currentSurah = surahPageMapping[i];
            const nextSurah = surahPageMapping[i + 1];
            expect(currentSurah.start).toBeLessThanOrEqual(nextSurah.start);
        }
    });
});
