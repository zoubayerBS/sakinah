import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Clock, Book, Sparkles, Trophy, Award, Star, RefreshCw } from 'lucide-react';
import { quranAPI } from '../services/quran-api.js';
import { ContinueReading } from '../components/ContinueReading.jsx';
import { DailyAyah } from '../components/DailyAyah.jsx';
import { getLastRead } from '../utils/storage-utils.js';
import { useAudio } from '../context/AudioContext.jsx';
import { surahPageMapping } from '../data/surah-pages.js';
import PrayerTimesSection from '../components/PrayerTimesSection.jsx';

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

    // Derived Khitma State
    const currentWird = khitma?.isStarted && khitma?.schedule ? khitma.schedule[khitma.currentDayIndex] : null;
    const isComplete = khitma?.isStarted && khitma?.schedule?.every(d => d.isCompleted);
    const scheduleLength = khitma?.schedule?.length || 1;
    const progressPercentage = khitma?.isStarted && khitma?.schedule
        ? Math.round((khitma.schedule.filter(d => d.isCompleted).length / scheduleLength) * 100)
        : 0;
    const daysRemaining = Math.max(0, (khitma?.days || 0) - (khitma?.currentDayIndex || 0));

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
                                <div className="w-full space-y-6 mt-8 relative z-10 border-t border-black/5 dark:border-white/5 pt-6">
                                    {/* Rich Stats Row */}
                                    <div className="flex justify-between items-center px-2">
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-black text-[var(--color-accent)]">
                                                {currentWird?.isCompleted ? 'مكتمل' : 'قيد الإنجاز'}
                                            </span>
                                            <span className="text-[10px] opacity-40 uppercase font-bold mt-1">حالة الورد</span>
                                        </div>
                                        <div className="w-px h-8 bg-black/5 dark:bg-white/10 mx-2"></div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-black text-[var(--color-highlight)]">
                                                {daysRemaining}
                                            </span>
                                            <span className="text-[10px] opacity-40 uppercase font-bold mt-1">الأيام المتبقية</span>
                                        </div>
                                        <div className="w-px h-8 bg-black/5 dark:bg-white/10 mx-2"></div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-black text-[var(--color-text-primary)]">
                                                {progressPercentage || 0}%
                                            </span>
                                            <span className="text-[10px] opacity-40 uppercase font-bold mt-1">إنجاز الختمة</span>
                                        </div>
                                    </div>

                                    {/* Daily Progress */}
                                    <div className="space-y-3">
                                        {currentWird && (
                                            <div className="flex justify-between items-center px-1">
                                                <span className="text-[10px] font-arabic font-bold text-[var(--color-text-tertiary)] opacity-60">نطاق قراءة اليوم</span>
                                                <span className="text-[10px] font-arabic font-bold text-[var(--color-text-primary)]">
                                                    صفحة {currentWird.startPage} إلى {currentWird.endPage}
                                                </span>
                                            </div>
                                        )}

                                        {/* CTA: Navigate to Mushaf for auto-tracking */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onNavigate('khitma');
                                            }}
                                            className="w-full py-3 rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 font-arabic font-bold text-xs hover:bg-[var(--color-accent)]/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Book size={14} />
                                            متابعة الختمة
                                        </button>
                                    </div>

                                    {isComplete && (
                                        <div className="text-center py-2 bg-[var(--color-accent)]/10 rounded-2xl border border-[var(--color-accent)]/20">
                                            <span className="font-arabic font-black text-sm text-[var(--color-accent)]">🎉 أتممت الختمة! مبارك</span>
                                        </div>
                                    )}

                                    {/* Mini Overall Progress Bar */}
                                    <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-highlight)] transition-all duration-1000 liquid-progress"
                                            style={{ width: `${progressPercentage}%` }}
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
