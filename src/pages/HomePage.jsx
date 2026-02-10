import React, { useState, useEffect } from 'react';
import { Search, Clock, Book } from 'lucide-react';
import { quranAPI } from '../services/quran-api.js';
import { SurahCard } from '../components/SurahCard.jsx';
import { ContinueReading } from '../components/ContinueReading.jsx';
import { DailyAyah } from '../components/DailyAyah.jsx';
import { getLastRead } from '../utils/storage-utils.js';
import { useAudio } from '../context/AudioContext.jsx';

export const HomePage = ({ onSurahSelect, onNavigate }) => {
    const [surahs, setSurahs] = useState([]);
    const [filteredSurahs, setFilteredSurahs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);


    const [activeTab, setActiveTab] = useState('surah'); // 'surah' or 'juz'
    const [lastRead, setLastRead] = useState(null);
    const [khitma, setKhitma] = useState(null);
    const { activeSurah, isPlaying } = useAudio();

    // Fetch Last Read and Khitma on Mount
    useEffect(() => {
        setLastRead(getLastRead());
        const savedKhitma = localStorage.getItem('khitma_state');
        if (savedKhitma) {
            setKhitma(JSON.parse(savedKhitma));
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const data = await quranAPI.getAllSurahs();
            setSurahs(data);
            setFilteredSurahs(data);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) {
            setFilteredSurahs(surahs);
        } else {
            const filtered = surahs.filter(surah =>
                surah.transliteration.toLowerCase().includes(query) ||
                surah.translation.toLowerCase().includes(query) ||
                surah.name.includes(searchQuery) ||
                surah.number.toString() === query
            );
            setFilteredSurahs(filtered);
        }
    }, [searchQuery, surahs]);

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
                    <div className="relative">
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
                                className="px-6 py-3 rounded-full bg-[var(--color-accent)] text-white font-arabic shadow-[var(--shadow-md)] hover:opacity-90 transition-all"
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

                        <div className="mt-4 flex flex-wrap gap-2 font-ui text-[10px] tracking-[0.3em] uppercase text-[var(--color-text-tertiary)]">
                            <span className="px-3 py-1 rounded-full bg-[var(--color-bg-secondary)]/70 border border-[var(--color-border)]">604 صفحة</span>
                            <span className="px-3 py-1 rounded-full bg-[var(--color-bg-secondary)]/70 border border-[var(--color-border)]">30 جزء</span>
                            <span className="px-3 py-1 rounded-full bg-[var(--color-bg-secondary)]/70 border border-[var(--color-border)]">114 سورة</span>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-6 rounded-[32px] bg-[radial-gradient(circle_at_top,rgba(201,162,39,0.2),transparent_70%)]" />
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

                            {/* Khitma Planner Button */}
                            <button
                                onClick={() => onNavigate('khitma')}
                                className="w-full bg-[var(--color-bg-secondary)]/90 border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 flex flex-col gap-4 hover:border-[var(--color-accent)] transition-all group shadow-[var(--shadow-sm)] text-right relative overflow-hidden"
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
                                            <p className="font-arabic text-xs text-[var(--color-text-tertiary)]">
                                                {khitma?.isStarted ? 'تابع تقدمك في الختمة' : 'خطط لختمتك القادمة بالورقات أو بالآيات'}
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
                                            <span>تقدمك: {Math.round((khitma.progress / (khitma.days * 5)) * 100)}%</span>
                                            <span>المتبقي: {Math.max(0, khitma.days - Math.floor(khitma.progress / 5))} يوم</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[var(--color-accent)] transition-all duration-500 shadow-[0_0_8px_rgba(201,162,39,0.2)]"
                                                style={{ width: `${Math.round((khitma.progress / (khitma.days * 5)) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Search + Tabs */}
                <section className="mt-12">
                    <div className="max-w-3xl mx-auto">
                        <div className="relative">
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
                                <Search size={20} />
                            </div>
                            <input
                                type="text"
                                className="w-full bg-[var(--color-bg-secondary)]/80 border border-[var(--color-border)] rounded-full pr-12 pl-5 py-4 font-arabic text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] transition-colors text-right backdrop-blur"
                                placeholder="ابحث عن سورة بالاسم أو الرقم..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                dir="rtl"
                            />
                        </div>
                    </div>

                    <div className="flex justify-center mt-6">
                        <div className="flex gap-3 bg-[var(--color-bg-secondary)]/80 border border-[var(--color-border)] rounded-full p-2 shadow-[var(--shadow-sm)]">
                            <button
                                onClick={() => setActiveTab('juz')}
                                className={`px-6 py-2 rounded-full font-arabic text-sm transition-all border ${activeTab === 'juz'
                                    ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-[var(--shadow-md)]'
                                    : 'text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
                                    }`}
                            >
                                أجزاء
                            </button>
                            <button
                                onClick={() => setActiveTab('surah')}
                                className={`px-6 py-2 rounded-full font-arabic text-sm transition-all border ${activeTab === 'surah'
                                    ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-[var(--shadow-md)]'
                                    : 'text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
                                    }`}
                            >
                                سور
                            </button>
                        </div>
                    </div>
                </section>

                {/* Content List */}
                <section className="mt-8">
                    <div className="flex items-center justify-between mb-4" dir="rtl">
                        <h3 className="font-arabic text-lg text-[var(--color-text-primary)]">
                            {activeTab === 'surah' ? 'السور' : 'الأجزاء'}
                        </h3>
                        <span className="text-xs text-[var(--color-text-tertiary)]">
                            {activeTab === 'surah' ? `${filteredSurahs.length} سورة` : '30 جزء'}
                        </span>
                    </div>
                    <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                        {activeTab === 'surah' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredSurahs.map((surah, index) => (
                                    <SurahCard
                                        key={surah.number}
                                        surah={surah}
                                        index={index}
                                        isAudioActive={activeSurah?.number === surah.number}
                                        isAudioPlaying={isPlaying && activeSurah?.number === surah.number}
                                        onClick={() => onSurahSelect(surah)}
                                    />
                                ))}
                                {!isLoading && filteredSurahs.length === 0 && (
                                    <div className="text-center py-12">
                                        <p className="font-arabic text-[var(--color-text-secondary)] text-lg">
                                            لا توجد نتائج بحث
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" dir="rtl">
                                {[...Array(30)].map((_, i) => (
                                    <div key={i} className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 hover:border-[var(--color-accent)] transition-colors cursor-pointer text-center group">
                                        <h3 className="font-arabic text-xl text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)]">
                                            الجزء {i + 1}
                                        </h3>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Loading State */}
                {isLoading && (
                    <div className="grid grid-cols-1 gap-4 mt-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-full h-24 rounded-[var(--radius-lg)] bg-[var(--color-bg-secondary)] animate-pulse"></div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
