import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Clock, Book, Sparkles, Trophy, Award, Star, RefreshCw } from 'lucide-react';
import { quranAPI } from '../services/quran-api.js';
import { ContinueReading } from '../components/ContinueReading.jsx';
import { DailyAyah } from '../components/DailyAyah.jsx';
import { getLastRead } from '../utils/storage-utils.js';
import { useAudio } from '../context/AudioContext.jsx';
import { calculateWirdProgress, calculateKhitmaProgress, getKhitmaDailyTarget, getDailyAverage, getEstimatedEndDate, isKhitmaComplete } from '../utils/quran-utils.js';
import { surahPageMapping } from '../data/surah-pages.js';
import PrayerTimesSection from '../components/PrayerTimesSection.jsx';
import IntegratedSearch from '../components/IntegratedSearch.jsx';
import RamadanWidget from '../components/RamadanWidget.jsx';
import { tapLight } from '../utils/haptics.js';

export const HomePage = ({ onSurahSelect, onNavigate, khitma, onUpdateKhitma }) => {
    const [lastRead, setLastRead] = useState(null);
    const [surahs, setSurahs] = useState([]);
    const { activeSurah, isPlaying } = useAudio();

    // Pull-to-refresh state
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const touchStartY = useRef(0);
    const scrollContainerRef = useRef(null);
    const PULL_THRESHOLD = 80;

    // Fetch data
    const fetchData = async () => {
        try {
            const [readData, surahsData] = await Promise.all([
                getLastRead(),
                quranAPI.getAllSurahs()
            ]);
            setLastRead(readData);
            setSurahs(surahsData);
        } catch (error) {
            console.error('Error fetching home data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Pull-to-refresh handlers
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        tapLight();
        // Clear daily ayah cache to force re-fetch
        localStorage.removeItem('daily-ayah-cache');
        await fetchData();
        setTimeout(() => setIsRefreshing(false), 800);
    }, []);

    const handleTouchStart = useCallback((e) => {
        touchStartY.current = e.touches[0].clientY;
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (isRefreshing) return;
        const scrollTop = scrollContainerRef.current?.scrollTop || window.scrollY;
        if (scrollTop > 5) return; // Only trigger at top
        const diff = e.touches[0].clientY - touchStartY.current;
        if (diff > 0) {
            setPullDistance(Math.min(diff * 0.4, PULL_THRESHOLD * 1.5));
        }
    }, [isRefreshing]);

    const handleTouchEnd = useCallback(() => {
        if (pullDistance >= PULL_THRESHOLD) {
            handleRefresh();
        }
        setPullDistance(0);
    }, [pullDistance, handleRefresh]);

    return (

        <div
            ref={scrollContainerRef}
            className="min-h-screen pb-24 relative overflow-hidden mesh-bg"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull-to-Refresh Indicator */}
            {(pullDistance > 0 || isRefreshing) && (
                <div
                    className="flex items-center justify-center transition-all duration-300"
                    style={{ height: isRefreshing ? '60px' : `${pullDistance}px`, opacity: Math.min(1, pullDistance / PULL_THRESHOLD) }}
                >
                    <RefreshCw
                        size={22}
                        className={`text-[var(--color-accent)] ${isRefreshing ? 'animate-spin' : ''}`}
                        style={{ transform: `rotate(${pullDistance * 3}deg)` }}
                    />
                </div>
            )}

            <div className="relative max-w-2xl mx-auto px-6 py-8 flex flex-col items-center">

                {/* MINIMALIST DASHBOARD LAYOUT */}
                <div className="w-full flex flex-col gap-6 animate-fade-in-up">

                    <section className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl p-6 relative group shadow-sm">

                        <div className="flex items-center gap-4 md:gap-6 relative z-10">
                            <img
                                src="/logo2.png"
                                alt="سكينة"
                                className="h-16 md:h-24 w-auto drop-shadow-lg"
                            />
                            <div className="text-right">
                                <h1 className="font-arabic font-black text-2xl md:text-4xl text-[var(--color-text-primary)] leading-tight">سكينة</h1>
                                <p className="font-arabic text-sm md:text-lg text-[var(--color-text-secondary)] opacity-70">طمأنينة وخشوع</p>
                            </div>
                            <div className="mr-auto text-3xl md:text-5xl text-[var(--color-highlight)]/20 font-arabic select-none">﷽</div>
                        </div>

                        {/* Integrated Search Bar */}
                        <IntegratedSearch
                            onVerseSelect={(result) => {
                                const surahNum = result.chapter_id || parseInt(result.verse_key.split(':')[0]);
                                const page = result.page_number || surahPageMapping[surahNum]?.start || 1;
                                localStorage.setItem('mushaf-last-page', page.toString());
                                onNavigate('mushaf');
                            }}
                        />

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => onNavigate('mushaf')}
                                className="flex-1 py-3 rounded-xl bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] font-arabic font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all text-base"
                            >
                                المصحف
                            </button>
                            <button
                                onClick={() => onNavigate('khitma')}
                                className="flex-1 py-3 rounded-xl bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] font-arabic font-bold hover:bg-[var(--color-border)] transition-all text-base"
                            >
                                الختمة
                            </button>
                        </div>
                    </section>

                    {/* Ramadan Widget */}
                    <RamadanWidget />

                    {/* Status Group */}
                    <div className="flex flex-col gap-6">
                        {lastRead && (
                            <ContinueReading
                                lastRead={lastRead}
                                onClick={() => {
                                    const surah = surahs.find(s => s.number === lastRead.surahNumber);
                                    if (surah) onSurahSelect(surah);
                                }}
                            />
                        )}
                        <div
                            onClick={() => onNavigate('khitma')}
                            className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl p-6 flex flex-col justify-between hover:border-[var(--color-accent)] transition-colors cursor-pointer text-right shadow-sm"
                            dir="rtl"
                        >
                            <div className="flex justify-between items-start w-full">
                                <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-tertiary)] flex items-center justify-center">
                                    <Book size={24} className="text-[var(--color-text-primary)]" />
                                </div>
                                {khitma?.isStarted && (
                                    <div className="bg-[var(--color-accent)]/10 px-4 py-1.5 rounded-full border border-[var(--color-accent)]/20 animate-pulse-slow">
                                        <span className="text-xs font-arabic font-black text-[var(--color-accent)]">وردك اليومي</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 mt-6 relative z-10">
                                <h3 className="font-arabic font-black text-3xl text-[var(--color-text-primary)] tracking-tight">مخطط الختمة</h3>
                                <p className="font-arabic text-base text-[var(--color-text-secondary)] opacity-80">
                                    {khitma?.isStarted ? 'خطوات مباركة نحو الختام' : 'ابدأ رحلة الختم المباركة'}
                                </p>
                            </div>

                            {khitma?.isStarted && (
                                <div className="w-full space-y-6 mt-8 relative z-10">
                                    {/* Rich Stats Row */}
                                    <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-4 rounded-3xl border border-black/5 dark:border-white/5">
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-black text-[var(--color-accent)]">
                                                {Math.round(calculateWirdProgress(khitma, getKhitmaDailyTarget(khitma)))}%
                                            </span>
                                            <span className="text-[10px] opacity-40 uppercase font-bold">هدف اليوم</span>
                                        </div>
                                        <div className="w-px h-8 bg-black/5 dark:bg-white/10 mx-2"></div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-black text-[var(--color-highlight)]">
                                                {getDailyAverage(khitma) || '—'}
                                            </span>
                                            <span className="text-[10px] opacity-40 uppercase font-bold">معدل يومي</span>
                                        </div>
                                        <div className="w-px h-8 bg-black/5 dark:bg-white/10 mx-2"></div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-black text-[var(--color-text-primary)]">
                                                {Math.round(calculateKhitmaProgress(khitma))}%
                                            </span>
                                            <span className="text-[10px] opacity-40 uppercase font-bold">الختمة</span>
                                        </div>
                                    </div>

                                    {/* Daily Progress */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-[10px] font-arabic font-bold text-[var(--color-text-tertiary)] opacity-60">إنجازك اليوم</span>
                                            <span className="text-[10px] font-arabic font-bold text-[var(--color-accent)]">
                                                {khitma?.progressLog?.[new Date().toISOString().split('T')[0]] || 0} / {getKhitmaDailyTarget(khitma)} {khitma?.mode === 'pages' ? 'صفحة' : 'آية'}
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[var(--color-accent)] shadow-[0_0_10px_var(--color-accent)] transition-all duration-1000"
                                                style={{ width: `${calculateWirdProgress(khitma, getKhitmaDailyTarget(khitma))}%` }}
                                            ></div>
                                        </div>

                                        {/* CTA: Navigate to Mushaf for auto-tracking */}
                                        {khitma?.mode === 'pages' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onNavigate('mushaf');
                                                }}
                                                className="w-full py-3 rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 font-arabic font-bold text-xs hover:bg-[var(--color-accent)]/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Book size={14} />
                                                افتح المصحف للقراءة
                                            </button>
                                        )}
                                    </div>

                                    {isKhitmaComplete(khitma) && (
                                        <div className="text-center py-2 bg-[var(--color-accent)]/10 rounded-2xl border border-[var(--color-accent)]/20">
                                            <span className="font-arabic font-black text-sm text-[var(--color-accent)]">🎉 أتممت الختمة! مبارك</span>
                                        </div>
                                    )}

                                    {/* Mini Overall Progress Bar */}
                                    <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-highlight)] transition-all duration-1000 liquid-progress"
                                            style={{ width: `${calculateKhitmaProgress(khitma)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-sm">
                        <DailyAyah />
                    </div>

                    <PrayerTimesSection />
                </div>
            </div>

        </div>
    );
};
