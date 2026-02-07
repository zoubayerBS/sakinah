import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { quranAPI } from '../services/quran-api.js';
import { SurahCard } from '../components/SurahCard.jsx';
import { ContinueReading } from '../components/ContinueReading.jsx';
import { DailyAyah } from '../components/DailyAyah.jsx';
import { getLastRead } from '../utils/storage-utils.js';

export const HomePage = ({ onSurahSelect }) => {
    const [surahs, setSurahs] = useState([]);
    const [filteredSurahs, setFilteredSurahs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);


    const [activeTab, setActiveTab] = useState('surah'); // 'surah' or 'juz'
    const [lastRead, setLastRead] = useState(null);

    // Fetch Last Read on Mount
    useEffect(() => {
        setLastRead(getLastRead());
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
        <div className="min-h-screen pattern-subtle pb-24">
            <div className="max-w-[1200px] mx-auto px-6 py-12">

                {/* Hero Section */}
                <div className="text-center mb-8 animate-fade-in relative">
                    <h2 className="font-arabic text-2xl text-[var(--color-highlight)] mb-4">
                        ﷽
                    </h2>
                    <h1 className="font-cairo-play font-bold text-5xl text-[#C9A227] mb-2 drop-shadow-sm">
                        سكينة
                    </h1>
                    <p className="font-arabic text-[var(--color-text-secondary)] text-base leading-relaxed">
                        شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ
                    </p>
                </div>

                {/* Engagement Section */}
                <div className="max-w-xl mx-auto mb-8 animate-slide-up">
                    {lastRead && (
                        <ContinueReading
                            lastRead={lastRead}
                            onClick={() => {
                                // Find the surah object to navigate
                                const surah = surahs.find(s => s.number === lastRead.surahNumber);
                                if (surah) onSurahSelect(surah);
                            }}
                        />
                    )}
                    <DailyAyah />
                </div>

                {/* Search */}
                <div className="max-w-2xl mx-auto mb-8 animate-slide-up delay-100">
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-md)] pl-12 pr-4 py-4 font-arabic text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] transition-colors text-right"
                            placeholder="ابحث عن سورة بالاسم أو الرقم..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            dir="rtl"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8 animate-slide-up delay-200">
                    <div className="flex bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-full p-1">
                        <button
                            onClick={() => setActiveTab('juz')}
                            className={`px-6 py-2 rounded-full font-arabic text-sm transition-all ${activeTab === 'juz' ? 'bg-[var(--color-accent)] text-white shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                        >
                            أجزاء
                        </button>
                        <button
                            onClick={() => setActiveTab('surah')}
                            className={`px-6 py-2 rounded-full font-arabic text-sm transition-all ${activeTab === 'surah' ? 'bg-[var(--color-accent)] text-white shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                        >
                            سور
                        </button>
                    </div>
                </div>

                {/* Content List */}
                <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                    {activeTab === 'surah' ? (
                        /* Surah List */
                        <div className="grid grid-cols-1 gap-4">
                            {filteredSurahs.map((surah, index) => (
                                <SurahCard
                                    key={surah.number}
                                    surah={surah}
                                    index={index}
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
                        /* Juz List (Simple Placeholder) */
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
