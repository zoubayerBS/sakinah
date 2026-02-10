import React, { useEffect, useState } from 'react';
import { quranAPI } from '../services/quran-api.js';

export const DailyAyah = () => {
    const fallbackAyah = {
        text: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
        surah: "الشرح",
        number: 5
    };

    const [ayah, setAyah] = useState(fallbackAyah);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isCancelled = false;
        const storageKey = 'daily-ayah-cache';
        const now = new Date();
        const today = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0'),
        ].join('-');

        const loadAyah = async () => {
            try {
                const cached = localStorage.getItem(storageKey);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    const cachedAyah = parsed?.ayah;
                    const hasVerseKey = Boolean(cachedAyah?.verseKey);
                    if (parsed?.date === today && cachedAyah?.text && hasVerseKey) {
                        if (!isCancelled) {
                            setAyah(cachedAyah);
                            setIsLoading(false);
                        }
                        return;
                    }
                }
            } catch {
                // ignore cache errors
            }

            try {
                const data = await quranAPI.getRandomVerse();
                if (!isCancelled && data?.text) {
                    const verseKey = data.verseKey || data.verse_key || '';
                    const parsedAyahNumber = verseKey.includes(':')
                        ? parseInt(verseKey.split(':')[1], 10)
                        : null;
                    const normalized = {
                        text: data.text,
                        surah: data.surah || fallbackAyah.surah,
                        number: Number.isFinite(parsedAyahNumber) ? parsedAyahNumber : (data.number || fallbackAyah.number),
                        surahNumber: data.surahNumber || null,
                        verseKey: verseKey || null
                    };
                    setAyah(normalized);
                    localStorage.setItem(storageKey, JSON.stringify({ date: today, ayah: normalized }));
                }
            } catch {
                if (!isCancelled) setAyah(fallbackAyah);
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        };

        loadAyah();
        return () => { isCancelled = true; };
    }, []);

    return (
        <div className="relative overflow-hidden p-6 bg-[var(--color-bg-secondary)]/85 border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]" dir="rtl">
            <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-[var(--color-accent)]/10 blur-2xl" />
            <h4 className="font-ui text-[10px] tracking-[0.35em] uppercase text-[var(--color-text-tertiary)] mb-3 text-right">
                آية اليوم
            </h4>
            {isLoading ? (
                <p className="font-arabic text-base text-[var(--color-text-tertiary)] text-right">...</p>
            ) : (
                <>
                    <p className="font-arabic text-2xl text-[var(--color-text-primary)] leading-relaxed mb-4 text-right">
                        {ayah.text}
                    </p>
                    <p className="font-arabic text-sm text-[var(--color-text-secondary)] text-right">
                        سورة {ayah.surah} • آية {ayah.number}
                    </p>
                    {ayah.verseKey && (
                        <p className="font-ui text-[10px] text-[var(--color-text-tertiary)] text-right mt-1">
                            {ayah.verseKey}
                        </p>
                    )}
                </>
            )}
        </div>
    );
};
