import { describe, it, expect } from 'vitest';
import { toArabicIndicDigits, formatSurahTitle, calculateKhitmaProgress } from './quran-utils.js';

describe('Quran Utils', () => {
    describe('toArabicIndicDigits', () => {
        it('should return empty string for null or undefined', () => {
            expect(toArabicIndicDigits(null)).toBe('');
            expect(toArabicIndicDigits(undefined)).toBe('');
        });

        it('should convert standard digits to Arabic-Indic digits', () => {
            expect(toArabicIndicDigits(123)).toBe('١٢٣');
            expect(toArabicIndicDigits('456')).toBe('٤٥٦');
        });

        it('should not alter non-numeric characters', () => {
            expect(toArabicIndicDigits('Page 12')).toBe('Page ١٢');
        });
    });

    describe('formatSurahTitle', () => {
        it('should format normal surah names', () => {
            expect(formatSurahTitle('الفاتحة')).toBe('سورة الفاتحة');
        });

        it('should leave strings that already start with سورة alone', () => {
            expect(formatSurahTitle('سورة البقرة')).toBe('سورة البقرة');
        });

        it('should ignore ligature formats used in King Fahd font mapping', () => {
            expect(formatSurahTitle('surah001')).toBe('surah001');
        });
    });

    describe('calculateKhitmaProgress', () => {
        it('should return 0 when khitma is not started', () => {
            expect(calculateKhitmaProgress({ isStarted: false })).toBe(0);
        });

        it('should calculate correct percentage for pages mode', () => {
            expect(calculateKhitmaProgress({ isStarted: true, mode: 'pages', progress: 302 })).toBeCloseTo(50);
        });
    });
});
