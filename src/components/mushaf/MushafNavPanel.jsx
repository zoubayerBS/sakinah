import React from 'react';
import { X, BookOpen, Layers, Hash, BookMarked, Search, Check } from 'lucide-react';

const MushafNavPanel = ({
    showNavPanel,
    setShowNavPanel,
    isDarkMode,
    mode,
    navTab,
    setNavTab,
    bookmarkedPages,
    searchQuery,
    setSearchQuery,
    filteredSurahs,
    surahPageMapping,
    pageInfo,
    pageNumber,
    navigateTo,
    JUZ_PAGES,
    currentJuz,
    setBookmarkedPages
}) => {
    if (!showNavPanel) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-end justify-center"
            onClick={() => setShowNavPanel(false)}
            style={{ touchAction: 'pan-y', overscrollBehaviorY: 'contain' }}
        >
            <div
                className={`relative flex flex-col w-full max-w-[500px] h-[85vh] rounded-t-[2.5rem] overflow-hidden shadow-none animate-slide-up ${isDarkMode ? 'bg-[#121212] text-white' : 'bg-[#FDFCFA] text-[#2C2C2C]'}`}
                style={isDarkMode ? {} : { backgroundColor: mode.bg }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Panel Header */}
                <div
                    className={`flex items-center justify-between px-6 py-5 border-b sticky top-0 z-10 ${isDarkMode ? 'bg-[#121212] border-white/5' : 'bg-[#FDFCFA] border-black/5'}`}
                    style={isDarkMode ? {} : { backgroundColor: mode.bg }}
                >
                    <h2 className={`font-arabic font-bold text-lg ${isDarkMode ? 'text-white' : 'text-[var(--color-text-primary)]'}`}>
                        فهرس المصحف
                    </h2>
                    <button
                        onClick={() => setShowNavPanel(false)}
                        className={`p-2 rounded-full transition-all active:scale-90 ${isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-black/5 text-[var(--color-text-tertiary)]'}`}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tab Buttons - Elegant Pills */}
                <div className="flex px-4 gap-1.5 pb-3">
                    {[
                        { id: 'surah', label: 'السور', icon: BookOpen },
                        { id: 'juz', label: 'الأجزاء', icon: Layers },
                        { id: 'page', label: 'صفحة', icon: Hash },
                        ...(bookmarkedPages.length > 0 ? [{ id: 'bookmarks', label: 'العلامات', icon: BookMarked }] : []),
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setNavTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold font-arabic transition-all active:scale-95 ${navTab === tab.id
                                ? 'shadow-md'
                                : 'opacity-50 hover:opacity-100'
                                }`}
                            style={{
                                backgroundColor: navTab === tab.id ? mode.accent : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                                color: navTab === tab.id ? '#fff' : (isDarkMode ? '#fff' : 'var(--color-text-primary)'),
                                boxShadow: navTab === tab.id ? `0 4px 12px ${mode.accent}40` : 'none',
                            }}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search Bar - Elegant Input */}
                {navTab === 'surah' && (
                    <div className="px-6 pb-3">
                        <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-all ${isDarkMode ? 'bg-[#1A1A1A] border-white/8 focus-within:border-white/15' : 'bg-white border-black/6 focus-within:border-black/10'}`}>
                            <Search size={18} className={`${isDarkMode ? 'text-gray-500' : 'text-[var(--color-text-tertiary)]'}`} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث عن سورة..."
                                className={`flex-1 bg-transparent text-sm font-arabic focus:outline-none ${isDarkMode ? 'placeholder:text-gray-600 text-white' : 'placeholder:opacity-30'}`}
                                autoFocus
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className={`p-1 rounded-lg transition-all ${isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-black/5 text-gray-500'}`}>
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Panel Content */}
                <div className={`flex-1 overflow-y-auto nav-panel-scroll px-1 pb-10 ${isDarkMode ? '' : ''}`}
                    style={isDarkMode ? {} : { backgroundColor: mode.bg }}>

                    {/* ── SURAH TAB ── */}
                    {navTab === 'surah' && (
                        <div className="p-2 space-y-1 px-3">
                            {filteredSurahs.map(({ name, number }) => {
                                const pages = surahPageMapping[number];
                                const isCurrentSurah = pageInfo && pageInfo.surahNumber === number;
                                return (
                                    <button
                                        key={number}
                                        onClick={() => navigateTo(pages.start, pages.start > pageNumber ? 'left' : 'right')}
                                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all active:scale-[0.98] ${isCurrentSurah
                                            ? 'bg-[#A67C52] text-white shadow-md'
                                            : isDarkMode
                                                ? 'hover:bg-[#1A1A1A] border border-transparent'
                                                : 'hover:bg-[#F5F5F5] border border-transparent'
                                            }`}
                                        style={isCurrentSurah ? { boxShadow: '0 2px 8px rgba(166, 124, 82, 0.3)' } : {}}
                                    >
                                        {/* Number Badge */}
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${isCurrentSurah
                                            ? 'bg-white/20 text-white'
                                            : isDarkMode ? 'bg-[#252525] text-gray-300' : 'bg-[#E8E8E8] text-gray-600'
                                            }`}>
                                            {number}
                                        </div>

                                        {/* Surah Name */}
                                        <div className="flex-1 text-right">
                                            <span className={`font-arabic font-bold text-sm block ${isCurrentSurah ? 'text-white' : isDarkMode ? 'text-white' : 'text-[var(--color-text-primary)]'}`}>
                                                {name}
                                            </span>
                                        </div>

                                        {/* Page Range */}
                                        <div className={`text-center px-2 py-1 rounded-lg ${isCurrentSurah
                                            ? 'bg-white/10'
                                            : isDarkMode ? 'bg-[#252525]' : 'bg-[#F0F0F0]'
                                            }`}>
                                            <span className={`text-[10px] font-bold tabular-nums block ${isCurrentSurah
                                                ? 'text-white'
                                                : isDarkMode ? 'text-gray-400' : 'text-[var(--color-text-tertiary)]'
                                                }`}>
                                                {pages.start}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* ── JUZ TAB ── */}
                    {navTab === 'juz' && (
                        <div className="p-4 grid grid-cols-5 gap-1.5 px-4">
                            {JUZ_PAGES.map(({ juz, page }) => {
                                const isCurrentJuzItem = currentJuz === juz;
                                return (
                                    <button
                                        key={juz}
                                        onClick={() => navigateTo(page, page > pageNumber ? 'left' : 'right')}
                                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all active:scale-90 ${isCurrentJuzItem
                                            ? 'bg-[#A67C52] text-white shadow-md'
                                            : isDarkMode
                                                ? 'bg-[#1A1A1A] text-gray-300 hover:bg-[#252525]'
                                                : 'bg-[#F5F5F5] text-gray-700 hover:bg-[#EAEAEA]'
                                            }`}
                                        style={isCurrentJuzItem ? { boxShadow: '0 2px 8px rgba(166, 124, 82, 0.3)' } : {}}
                                    >
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isCurrentJuzItem ? 'bg-white/20' : isDarkMode ? 'bg-[#252525]' : 'bg-[#E8E8E8]'}`}>
                                            <span className="font-arabic font-bold text-xs">{juz}</span>
                                        </div>
                                        <span className={`text-[9px] font-bold ${isCurrentJuzItem ? 'text-white/70' : isDarkMode ? 'text-gray-500' : 'text-[var(--color-text-tertiary)]'}`}>
                                            {page}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* ── PAGE TAB ── */}
                    {navTab === 'page' && (
                        <div className="p-5 space-y-5 px-5">
                            {/* Current Page Display */}
                            <div className="text-center space-y-2 py-3">
                                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${isDarkMode ? 'bg-[#1A1A1A]' : 'bg-[#F5F5F5]'}`}>
                                    <span className={`text-4xl font-bold tabular-nums ${isDarkMode ? 'text-white' : 'text-[var(--color-text-primary)]'}`}>
                                        {pageNumber}
                                    </span>
                                </div>
                                <p className={`text-xs font-arabic ${isDarkMode ? 'text-gray-400' : 'text-[var(--color-text-tertiary)]'} mt-1`}>
                                    من 604 صفحة
                                </p>
                            </div>

                            {/* Page Input */}
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const input = e.target.elements.pageInput.value;
                                const p = parseInt(input);
                                if (p >= 1 && p <= 604) {
                                    navigateTo(p, p > pageNumber ? 'left' : 'right');
                                }
                            }} className="flex gap-2">
                                <input
                                    name="pageInput"
                                    type="number"
                                    placeholder="أدخل رقم الصفحة"
                                    min="1"
                                    max="604"
                                    className={`flex-1 text-center rounded-xl px-4 py-2.5 text-base font-bold border focus:outline-none transition-all font-arabic ${isDarkMode
                                        ? 'bg-[#1A1A1A] border-white/10 text-white placeholder-gray-500 focus:border-[var(--color-accent)]'
                                        : 'bg-white border-black/8 text-[var(--color-text-primary)] placeholder:opacity-30 focus:border-[var(--color-accent)]'
                                        }`}
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl text-white font-arabic font-bold active:scale-95 transition-all shadow-md"
                                    style={{ backgroundColor: mode.accent, boxShadow: `0 2px 8px ${mode.accent}50` }}
                                >
                                    انتقل
                                </button>
                            </form>

                            {/* Quick Page Jumps */}
                            <div className="grid grid-cols-4 gap-1.5">
                                {[1, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 604].map(p => (
                                    <button
                                        key={p}
                                        onClick={() => navigateTo(p, p > pageNumber ? 'left' : 'right')}
                                        className={`py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${p === pageNumber
                                            ? 'text-white shadow-md'
                                            : isDarkMode
                                                ? 'bg-[#1A1A1A] text-gray-300 hover:bg-[#252525]'
                                                : 'bg-[#F5F5F5] text-gray-700 hover:bg-[#EAEAEA]'
                                            }`}
                                        style={p === pageNumber ? { backgroundColor: mode.accent, boxShadow: `0 2px 8px ${mode.accent}50` } : {}}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── BOOKMARKS TAB ── */}
                    {navTab === 'bookmarks' && (
                        <div className="p-3 space-y-2 px-4">
                            {bookmarkedPages.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${isDarkMode ? 'bg-[#1A1A1A]' : 'bg-[#F5F5F5]'}`}>
                                        <BookMarked size={36} className={`${isDarkMode ? 'text-gray-600' : 'text-[var(--color-text-tertiary)]'}`} />
                                    </div>
                                    <p className={`font-arabic text-sm ${isDarkMode ? 'text-gray-400' : 'text-[var(--color-text-tertiary)]'}`}>
                                        لا توجد علامات مرجعية
                                    </p>
                                    <p className={`text-xs font-arabic mt-1 ${isDarkMode ? 'text-gray-600' : 'text-[var(--color-text-tertiary)]'} opacity-60`}>
                                        اضغط على الإشارة لحفظ الصفحة
                                    </p>
                                </div>
                            ) : (
                                bookmarkedPages.map(p => (
                                    <div key={p} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${p === pageNumber
                                        ? 'bg-[#A67C52] text-white shadow-lg'
                                        : isDarkMode ? 'hover:bg-[#1A1A1A]' : 'hover:bg-[#F5F5F5]'
                                        }`}
                                        style={p === pageNumber ? { boxShadow: '0 4px 16px rgba(166, 124, 82, 0.3)' } : {}}>

                                        <button
                                            onClick={() => navigateTo(p, p > pageNumber ? 'left' : 'right')}
                                            className="flex-1 flex items-center gap-3"
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p === pageNumber ? 'bg-white/20' : isDarkMode ? 'bg-[#252525]' : 'bg-[#E8E8E8]'}`}>
                                                <Check size={18} className={p === pageNumber ? 'text-white' : 'text-[#A67C52]'} />
                                            </div>
                                            <div className="text-right">
                                                <span className={`font-arabic font-bold text-sm block ${p === pageNumber ? 'text-white' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    صفحة {p}
                                                </span>
                                                {surahPageMapping && (
                                                    <span className={`text-[10px] ${p === pageNumber ? 'text-white/60' : isDarkMode ? 'text-gray-500' : 'text-[var(--color-text-tertiary)]'}`}>
                                                        سورة {Object.entries(surahPageMapping).find(entry => entry[1].start <= p && entry[1].end >= p)?.[1]?.name || ""}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setBookmarkedPages(prev => prev.filter(bp => bp !== p))}
                                            className={`p-2 rounded-lg transition-all active:scale-90 ${p === pageNumber ? 'hover:bg-white/20 text-white/70' : isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-red-100 text-red-500'}`}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MushafNavPanel;
