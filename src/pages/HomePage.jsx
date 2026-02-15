import React, { useState, useEffect } from 'react';
import { Search, Clock, Book } from 'lucide-react';
import { quranAPI } from '../services/quran-api.js';
import { ContinueReading } from '../components/ContinueReading.jsx';
import { DailyAyah } from '../components/DailyAyah.jsx';
import { getLastRead, getKhitmaState } from '../utils/storage-utils.js';
import { useAudio } from '../context/AudioContext.jsx';
import { calculateWirdProgress } from '../utils/quran-utils.js';
import GlobalSearch from '../components/GlobalSearch.jsx';
import { surahPageMapping } from '../data/surah-pages.js';

export const HomePage = ({ onSurahSelect, onNavigate }) => {
    const [lastRead, setLastRead] = useState(null);
    const [khitma, setKhitma] = useState(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [surahs, setSurahs] = useState([]);
    const { activeSurah, isPlaying } = useAudio();

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            const lr = await getLastRead();
            const ks = await getKhitmaState();
            const data = await quranAPI.getAllSurahs();
            setLastRead(lr);
            setKhitma(ks);
            setSurahs(data);
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen pattern-subtle pb-24 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 -right-28 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(201,162,39,0.25),transparent_70%)] blur-2xl" />
                <div className="absolute top-1/3 -left-28 w-[360px] h-[360px] rounded-full bg-[radial-gradient(circle_at_center,rgba(92,107,74,0.2),transparent_70%)] blur-2xl" />
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--color-bg-secondary)]/60 to-transparent" />
            </div>

            <div className="relative max-w-[1200px] mx-auto px-6 py-10">
                {/* Portal Hero */}
                <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
                    <div className="relative animate-fade-in-up">
                        <div className="absolute -top-12 -right-6 text-[120px] md:text-[150px] text-[var(--color-highlight)]/15 font-arabic pointer-events-none">
                            ﷽
                        </div>
                        <img
                            src="/logo2.png"
                            alt="سكينة"
                            className="h-28 md:h-36 w-auto mb-4"
                            loading="eager"
                        />
                        <h1 className="font-reem-kufi-fun text-3xl md:text-5xl text-[var(--color-text-primary)] leading-tight">
                            بوابة المصحف
                        </h1>
                        <p className="font-arabic text-[var(--color-text-secondary)] text-base md:text-lg leading-relaxed mt-3">
                            شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ
                        </p>

                        <div className="flex flex-wrap gap-3 mt-6" dir="rtl">
                            <button
                                onClick={() => onNavigate('mushaf')}
                                className="px-6 py-3 rounded-full bg-[var(--color-accent)] text-white font-arabic shadow-[var(--shadow-md)] hover:scale-105 transition-all"
                            >
                                اذهب للمصحف
                            </button>
                            <button
                                onClick={() => onNavigate('khitma')}
                                className="px-6 py-3 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/80 font-arabic text-[var(--color-text-primary)] hover:border-[var(--color-accent)] transition-all"
                            >
                                خطّة الختمة
                            </button>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 font-ui text-[10px] tracking-[0.3em] uppercase text-[var(--color-text-tertiary)] opacity-60">
                            <span className="px-3 py-1 rounded-full bg-[var(--color-bg-secondary)]/70 border border-[var(--color-border)]">604 صفحة</span>
                            <span className="px-3 py-1 rounded-full bg-[var(--color-bg-secondary)]/70 border border-[var(--color-border)]">30 جزء</span>
                            <span className="px-3 py-1 rounded-full bg-[var(--color-bg-secondary)]/70 border border-[var(--color-border)]">114 سورة</span>
                        </div>
                    </div>

                    <div className="relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="absolute -inset-6 rounded-[32px] bg-[radial-gradient(circle_at_top,rgba(201,162,39,0.1),transparent_70%)]" />
                        <div className="relative space-y-4">
                            {lastRead && (
                                <ContinueReading
                                    lastRead={lastRead}
                                    onClick={() => {
                                        const surah = surahs.find(s => s.number === lastRead.surahNumber);
                                        if (surah) onSurahSelect(surah);
                                    }}
                                />
                            )}
                            <DailyAyah />

                            <button
                                onClick={() => onNavigate('khitma')}
                                className="w-full bg-[var(--color-bg-secondary)]/90 border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 flex flex-col gap-4 hover:border-[var(--color-accent)] transition-all group shadow-[var(--shadow-sm)] text-right relative overflow-hidden backdrop-blur"
                                dir="rtl"
                            >
                                <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full bg-[var(--color-highlight)]/10 blur-2xl"></div>
                                <div className="w-full flex items-center justify-between relative">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)] group-hover:scale-110 transition-transform">
                                            <Book size={24} />
                                        </div>
                                        <div className="text-right">
                                            <h3 className="font-arabic font-bold text-[var(--color-text-primary)]">مخطط الختمة</h3>
                                            <p className="font-arabic text-xs text-[var(--color-text-tertiary)] opacity-70">
                                                {khitma?.isStarted ? 'تابع تقدمك في الختمة' : 'خطط لختمتك القادمة'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[var(--color-text-tertiary)] group-hover:bg-[var(--color-accent)] group-hover:text-white transition-colors">
                                        <Clock size={16} />
                                    </div>
                                </div>

                                {khitma?.isStarted && (
                                    <div className="w-full space-y-2 relative">
                                        <div className="flex justify-between items-center text-[0.65rem] font-arabic text-[var(--color-text-tertiary)]">
                                            <span>تقدمك: {Math.round(calculateWirdProgress(khitma))}%</span>
                                            <span>المتبقي: {Math.max(0, khitma.days - Math.floor(khitma.progress / 5))} يوم</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[var(--color-accent)] transition-all duration-500 shadow-[0_0_8px_rgba(201,162,39,0.2)]"
                                                style={{ width: `${calculateWirdProgress(khitma)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Navigation/Discovery Section */}
                <section className="mt-20 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <div className="max-w-3xl mx-auto space-y-12 text-center">
                        <div className="inline-block px-4 py-1.5 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 rounded-full">
                            <span className="text-[10px] font-black text-[var(--color-accent)] tracking-[0.3em] uppercase">Discovery</span>
                        </div>

                        <div
                            className="relative group cursor-pointer max-w-xl mx-auto"
                            onClick={() => setIsSearchOpen(true)}
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-accent)] to-[#92400e] rounded-3xl blur opacity-15 group-hover:opacity-30 transition duration-1000"></div>
                            <div className="relative bg-[var(--color-bg-secondary)]/90 border border-[var(--color-border)] rounded-2xl p-8 hover:border-[var(--color-accent)] transition-all backdrop-blur-md shadow-xl flex items-center gap-8" dir="rtl">
                                <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)] group-hover:scale-110 transition-transform shadow-inner">
                                    <Search size={32} />
                                </div>
                                <div className="text-right flex-1">
                                    <h3 className="font-arabic font-bold text-2xl text-[var(--color-text-primary)] mb-1">استماع و بحث</h3>
                                    <p className="font-arabic text-sm text-[var(--color-text-tertiary)] opacity-70">
                                        ابحث عن سورة، آية، أو موضوع عبر المصحف
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 max-w-xl mx-auto" dir="rtl">
                            <button
                                onClick={() => onNavigate('mushaf')}
                                className="bg-[var(--color-bg-secondary)]/80 border border-[var(--color-border)] rounded-2xl p-8 flex flex-col items-center gap-4 hover:border-[var(--color-accent)] hover:-translate-y-1 transition-all group backdrop-blur shadow-lg"
                            >
                                <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-inner">
                                    <Book size={24} />
                                </div>
                                <span className="font-arabic font-bold text-lg text-[var(--color-text-primary)]">المصحف كامل</span>
                            </button>
                            <button
                                onClick={() => {
                                    if (surahs.length > 0) {
                                        const last = lastRead?.surahNumber ? surahs.find(s => s.number === lastRead.surahNumber) : surahs[0];
                                        onSurahSelect(last || surahs[0]);
                                    }
                                }}
                                className="bg-[var(--color-bg-secondary)]/80 border border-[var(--color-border)] rounded-2xl p-8 flex flex-col items-center gap-4 hover:border-[var(--color-accent)] hover:-translate-y-1 transition-all group backdrop-blur shadow-lg"
                            >
                                <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-inner">
                                    <Clock size={24} />
                                </div>
                                <span className="font-arabic font-bold text-lg text-[var(--color-text-primary)]">آخر استماع</span>
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            <GlobalSearch
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onVerseSelect={(result) => {
                    const surahNum = result.chapter_id || parseInt(result.verse_key.split(':')[0]);
                    const page = result.page_number || surahPageMapping[surahNum]?.start || 1;
                    localStorage.setItem('mushaf-last-page', page.toString());
                    onNavigate('mushaf');
                    setIsSearchOpen(false);
                }}
            />
        </div>
    );
};
