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
                    if (parsed?.date === today && parsed?.ayah?.text) {
                        if (!isCancelled) {
                            setAyah(parsed.ayah);
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
                    const normalized = {
                        text: data.text,
                        surah: data.surah || fallbackAyah.surah,
                        number: data.number || fallbackAyah.number
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
        <div className="text-center mb-10 p-6 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]">
            <h4 className="font-arabic text-xs text-[var(--color-text-tertiary)] mb-3">
                آية اليوم
            </h4>
            {isLoading ? (
                <p className="font-arabic text-base text-[var(--color-text-tertiary)]">...</p>
            ) : (
                <>
                    <p className="font-arabic text-2xl text-[var(--color-text-primary)] leading-relaxed mb-4">
                        {ayah.text}
                    </p>
                    <p className="font-arabic text-sm text-[var(--color-text-secondary)]">
                        سورة {ayah.surah} • آية {ayah.number}
                    </p>
                </>
            )}
        </div>
    );
};
