import React, { useState, useMemo } from 'react';
import { X, Search, Music, ChevronLeft, Headphones } from 'lucide-react';

const SurahPlaylist = ({ isOpen, onClose, surahs, currentSurah, onSurahSelect, isDarkMode, mode }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSurahs = useMemo(() => {
        if (!searchQuery.trim()) return surahs;
        const query = searchQuery.toLowerCase();
        return surahs.filter(s =>
            s.name.includes(query) ||
            s.transliteration.toLowerCase().includes(query) ||
            s.number.toString() === query
        );
    }, [surahs, searchQuery]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[11000] flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div
                className={`relative w-full max-w-[600px] h-[85vh] rounded-t-[2.5rem] flex flex-col overflow-hidden shadow-2xl animate-slide-up ${isDarkMode ? 'bg-[#1A1A1A]' : 'bg-[#FDFCFA]'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Drag Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-12 h-1.5 rounded-full bg-current opacity-10" />
                </div>

                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="font-arabic font-bold text-xl text-[var(--color-text-primary)]">قائمة السور</h2>
                        <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-tertiary)] font-bold">Surah Playlist</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="px-6 pb-4">
                    <div className="relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" size={18} />
                        <input
                            type="text"
                            placeholder="ابحث عن سورة..."
                            className="w-full bg-black/5 border border-transparent focus:border-[var(--color-accent)]/30 rounded-full pr-12 pl-4 py-3 font-arabic text-sm transition-all focus:outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            dir="rtl"
                        />
                    </div>
                </div>

                {/* Surah List */}
                <div className="flex-1 overflow-y-auto px-6 pb-12 custom-scrollbar space-y-2">
                    {filteredSurahs.map((surah, idx) => {
                        const isActive = currentSurah?.number === surah.number;
                        return (
                            <div
                                key={surah.number}
                                onClick={() => onSurahSelect(surah)}
                                className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border animate-fade-in-up ${isActive
                                        ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30'
                                        : 'hover:bg-black/5 border-transparent'
                                    }`}
                                style={{ animationDelay: `${idx * 0.02}s` }}
                                dir="rtl"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isActive ? 'bg-[var(--color-accent)] text-white' : 'bg-black/5 text-[var(--color-text-tertiary)]'
                                        }`}>
                                        {isActive ? <Music size={16} className="animate-pulse" /> : surah.number}
                                    </div>
                                    <div className="text-right">
                                        <h3 className={`font-arabic font-bold text-lg ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'}`}>
                                            {surah.name}
                                        </h3>
                                        <p className="text-[10px] text-[var(--color-text-secondary)] opacity-60">
                                            {surah.verses} آية • {surah.revelation === 'Meccan' ? 'مكية' : 'مدنية'}
                                        </p>
                                    </div>
                                </div>

                                {isActive && (
                                    <div className="flex items-center gap-1">
                                        <div className="w-1 h-3 bg-[var(--color-accent)] rounded-full animate-pulse-slow"></div>
                                        <div className="w-1 h-5 bg-[var(--color-accent)] rounded-full animate-pulse-slow ml-0.5" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-1 h-3 bg-[var(--color-accent)] rounded-full animate-pulse-slow ml-0.5" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulse-slow {
                    0%, 100% { transform: scaleY(1); opacity: 0.5; }
                    50% { transform: scaleY(1.5); opacity: 1; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 1.2s ease-in-out infinite;
                }
            `}} />
        </div>
    );
};

export default SurahPlaylist;
