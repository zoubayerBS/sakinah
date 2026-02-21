import React, { useEffect, useState, useCallback } from 'react';
import { quranAPI } from '../services/quran-api.js';
import { Copy, Share2, BookOpen, Check } from 'lucide-react';
import { tapLight, tapMedium } from '../utils/haptics.js';

export const DailyAyah = () => {
    const fallbackAyah = {
        text: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
        surah: "الشرح",
        number: 5
    };

    const [ayah, setAyah] = useState(fallbackAyah);
    const [isLoading, setIsLoading] = useState(true);
    const [showTafsir, setShowTafsir] = useState(false);
    const [tafsirText, setTafsirText] = useState('');
    const [tafsirLoading, setTafsirLoading] = useState(false);
    const [copied, setCopied] = useState(false);

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

    // Fetch tafsir on demand
    const fetchTafsir = useCallback(async () => {
        if (tafsirText || !ayah.verseKey) return;
        setTafsirLoading(true);
        try {
            const [surahNum, verseNum] = ayah.verseKey.split(':');
            const res = await fetch(`https://api.quran.com/api/v4/tafsirs/16/by_ayah/${surahNum}:${verseNum}?language=ar`);
            const data = await res.json();
            const text = data?.tafsir?.text || '';
            // Strip HTML tags
            setTafsirText(text.replace(/<[^>]*>/g, ''));
        } catch {
            setTafsirText('لم نتمكن من تحميل التفسير');
        } finally {
            setTafsirLoading(false);
        }
    }, [ayah.verseKey, tafsirText]);

    const handleToggleTafsir = () => {
        tapLight();
        setShowTafsir(!showTafsir);
        if (!showTafsir) fetchTafsir();
    };

    const handleCopy = async () => {
        tapMedium();
        const text = `${ayah.text}\n\n— سورة ${ayah.surah}، آية ${ayah.number}`;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback
        }
    };

    const handleShare = async () => {
        tapLight();
        const text = `${ayah.text}\n\n— سورة ${ayah.surah}، آية ${ayah.number}`;
        if (navigator.share) {
            try {
                await navigator.share({ text, title: 'آية اليوم' });
            } catch {
                // cancelled
            }
        } else {
            handleCopy();
        }
    };

    return (
        <div className="p-6 bg-[var(--color-bg-secondary)]" dir="rtl">
            <div className="relative z-10 w-full">
                <div className="flex items-center gap-2 mb-6">
                    <span className="w-1.5 h-6 bg-[var(--color-accent)] rounded-full"></span>
                    <h4 className="font-ui text-sm font-bold text-[var(--color-text-secondary)]">
                        آية اليوم
                    </h4>
                </div>

                {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-8 bg-[var(--color-text-primary)]/10 rounded-full w-3/4 mr-auto"></div>
                        <div className="h-8 bg-[var(--color-text-primary)]/10 rounded-full w-1/2 mr-auto"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <p className="font-arabic font-bold text-3xl text-[var(--color-text-primary)] leading-relaxed text-right">
                            {ayah.text}
                        </p>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                                <span className="font-arabic font-bold text-lg">سورة {ayah.surah}</span>
                                <span className="w-1 h-1 rounded-full bg-[var(--color-text-tertiary)]"></span>
                                <span className="font-ui font-bold text-base">آية {ayah.number}</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleToggleTafsir}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${showTafsir ? 'bg-[var(--color-accent)] text-white' : 'bg-black/5 dark:bg-white/5 text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)]'}`}
                                    title="التفسير"
                                >
                                    <BookOpen size={16} />
                                </button>
                                <button
                                    onClick={handleCopy}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-black/5 dark:bg-white/5 text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-all"
                                    title="نسخ"
                                >
                                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-black/5 dark:bg-white/5 text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-all"
                                    title="مشاركة"
                                >
                                    <Share2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Tafsir Panel */}
                        {showTafsir && (
                            <div className="animate-fade-in bg-black/5 dark:bg-white/5 rounded-2xl p-5 border border-black/5 dark:border-white/5">
                                <p className="text-xs font-arabic font-bold text-[var(--color-accent)] mb-3">تفسير الميسر</p>
                                {tafsirLoading ? (
                                    <div className="space-y-2 animate-pulse">
                                        <div className="h-4 bg-[var(--color-text-primary)]/10 rounded-full w-full"></div>
                                        <div className="h-4 bg-[var(--color-text-primary)]/10 rounded-full w-3/4"></div>
                                    </div>
                                ) : (
                                    <p className="font-arabic text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                        {tafsirText}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
