import React, { useState, useEffect } from 'react';
import { Search, Clock, Book, Sparkles, Trophy, Award, Star } from 'lucide-react';
import { quranAPI } from '../services/quran-api.js';
import { ContinueReading } from '../components/ContinueReading.jsx';
import { DailyAyah } from '../components/DailyAyah.jsx';
import { getLastRead } from '../utils/storage-utils.js';
import { useAudio } from '../context/AudioContext.jsx';
import { calculateWirdProgress, calculateKhitmaProgress, getKhitmaDailyTarget, getDailyAverage, getEstimatedEndDate, isKhitmaComplete } from '../utils/quran-utils.js';
import { surahPageMapping } from '../data/surah-pages.js';
import PrayerTimesSection from '../components/PrayerTimesSection.jsx';
import IntegratedSearch from '../components/IntegratedSearch.jsx';

export const HomePage = ({ onSurahSelect, onNavigate, khitma, onUpdateKhitma }) => {
    const [lastRead, setLastRead] = useState(null);
    const [surahs, setSurahs] = useState([]);
    const { activeSurah, isPlaying } = useAudio();

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
