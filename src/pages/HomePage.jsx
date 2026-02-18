import React, { useState, useEffect } from 'react';
import { Search, Clock, Book } from 'lucide-react';
import { quranAPI } from '../services/quran-api.js';
import { ContinueReading } from '../components/ContinueReading.jsx';
import { DailyAyah } from '../components/DailyAyah.jsx';
import { getLastRead, getKhitmaState, saveKhitmaState } from '../utils/storage-utils.js';
import { useAudio } from '../context/AudioContext.jsx';
import { calculateWirdProgress } from '../utils/quran-utils.js';
import { surahPageMapping } from '../data/surah-pages.js';
import PrayerTimesSection from '../components/PrayerTimesSection.jsx';
import IntegratedSearch from '../components/IntegratedSearch.jsx';
import { CheckCircle2, Award, Sparkles, Star } from 'lucide-react';

export const HomePage = ({ onSurahSelect, onNavigate }) => {
    const [lastRead, setLastRead] = useState(null);
    const [khitma, setKhitma] = useState(null);
    const [surahs, setSurahs] = useState([]);
    const { activeSurah, isPlaying } = useAudio();

    // Fetch data
    const fetchData = async () => {
        const lr = await getLastRead();
        const ks = await getKhitmaState();
        const data = await quranAPI.getAllSurahs();
        setLastRead(lr);
        setKhitma(ks);
        setSurahs(data);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFinishPortion = async (e) => {
        if (e) e.stopPropagation();
        if (!khitma || !khitma.isStarted) return;

        const todayKey = new Date().toISOString().split('T')[0];
        const newProgress = khitma.progress + 1;
        const newProgressLog = {
            ...(khitma.progressLog || {}),
            [todayKey]: ((khitma.progressLog || {})[todayKey] || 0) + 1
        };

        const newState = {
            ...khitma,
            progress: newProgress,
            progressLog: newProgressLog
        };

        setKhitma(newState);
        await saveKhitmaState(newState);

        // Refresh data to ensure consistency (though local state update is enough for UI)
        // fetchData(); 
    };

    const todayKey = new Date().toISOString().split('T')[0];
    const todayPortions = khitma?.progressLog?.[todayKey] || 0;
    const remainingToday = Math.max(0, 5 - todayPortions);

    return (
        <div className="min-h-screen pb-24 relative overflow-hidden mesh-bg">
            {/* Immersive Floating Elements */}
            <div className="absolute top-[10%] left-[-5%] w-[40rem] h-[40rem] bg-[var(--color-highlight)]/5 rounded-full blur-[120px] animate-pulse-slow"></div>
            <div className="absolute bottom-[10%] right-[-5%] w-[35rem] h-[35rem] bg-[var(--color-accent)]/5 rounded-full blur-[100px] animate-pulse-slow font-delay-2000"></div>

            <div className="relative max-w-[1200px] mx-auto px-6 py-12 flex flex-col items-center">

                {/* COMPACT DASHBOARD LAYOUT */}
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">

                    {/* LEFT SIDE: Hero & Search (Col 7) */}
                    <div className="lg:col-span-7 space-y-6">
                        <section className="glass-premium rounded-[2.5rem] p-6 md:p-8 relative overflow-visible group">
                            {/* Decorative Blobs - Clipped to card shape */}
                            <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-highlight)]/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            </div>

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
                                    className="flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] font-arabic font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-sm md:text-base"
                                >
                                    المصحف
                                </button>
                                <button
                                    onClick={() => onNavigate('khitma')}
                                    className="flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-text-primary)] font-arabic font-black border border-[var(--color-accent)]/20 hover:bg-[var(--color-accent)]/20 transition-all text-sm md:text-base"
                                >
                                    الختمة
                                </button>
                            </div>
                        </section>

                        {/* Status Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                className="glass-premium rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-[var(--color-accent)]/50 transition-all duration-500 group relative overflow-hidden text-right cursor-pointer h-full"
                                dir="rtl"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[var(--color-highlight)]/10 blur-3xl group-hover:bg-[var(--color-highlight)]/20 transition-colors"></div>

                                <div className="flex justify-between items-start relative z-10 w-full">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-highlight)] text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                                        <Book size={28} />
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
                                        {/* Simplified Completion Row */}
                                        <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-4 rounded-3xl border border-black/5 dark:border-white/5">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-arabic font-bold text-[var(--color-text-tertiary)] opacity-60">التقدم الكلي</p>
                                                <span className="text-[var(--color-accent)] font-black text-lg">
                                                    {Math.round(calculateWirdProgress(khitma))}%
                                                </span>
                                            </div>
                                            <div className="w-px h-8 bg-black/10 dark:bg-white/10"></div>
                                            <div className="space-y-1 text-left">
                                                <p className="text-[10px] font-arabic font-bold text-[var(--color-text-tertiary)] opacity-60">متبقي</p>
                                                <span className="text-[var(--color-text-primary)] font-black text-lg">
                                                    {Math.max(0, khitma.days - Math.floor(khitma.progress / 5))} <span className="text-xs">يوم</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Interactive Mission Circles */}
                                        <div className="space-y-4">
                                            <div className="flex justify-center gap-3">
                                                {[1, 2, 3, 4, 5].map(idx => (
                                                    <div
                                                        key={idx}
                                                        onClick={(e) => {
                                                            if (idx === todayPortions + 1) handleFinishPortion(e);
                                                            else e.stopPropagation();
                                                        }}
                                                        className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500 relative
                                                            ${idx <= todayPortions
                                                                ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white shadow-lg'
                                                                : idx === todayPortions + 1
                                                                    ? 'bg-[var(--color-accent)]/5 border-dashed border-[var(--color-accent)]/40 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 animate-pulse'
                                                                    : 'bg-black/5 dark:bg-white/5 border-transparent text-black/10 dark:text-white/10'}
                                                        `}
                                                    >
                                                        {idx <= todayPortions ? <CheckCircle2 size={20} /> : <span className="font-ui font-black text-xs">{idx}</span>}
                                                        {idx === todayPortions + 1 && (
                                                            <div className="absolute -top-1 -right-1">
                                                                <Sparkles size={12} className="text-[var(--color-highlight)] animate-pulse" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-center font-arabic text-[10px] font-bold text-[var(--color-text-tertiary)] opacity-40">
                                                {remainingToday > 0 ? `باقي ${remainingToday} أوراد اليوم` : 'أتممت مهمتك لليوم ✨'}
                                            </p>
                                        </div>

                                        {/* Mini Progress Bar */}
                                        <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-highlight)] transition-all duration-1000 liquid-progress"
                                                style={{ width: `${calculateWirdProgress(khitma)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="glass-premium rounded-[2.5rem] overflow-hidden">
                            <DailyAyah />
                        </div>
                    </div>

                    {/* RIGHT SIDE: Prayer Times (Col 5) */}
                    <div className="lg:col-span-5">
                        <PrayerTimesSection />
                    </div>
                </div>
            </div>

        </div>
    );
};
