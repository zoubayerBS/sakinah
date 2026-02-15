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
            className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowNavPanel(false)}
            style={{ touchAction: 'pan-y', overscrollBehaviorY: 'contain' }}
        >
            <div
                className="relative flex flex-col w-full max-w-[500px] h-[85vh] rounded-t-[2.5rem] overflow-hidden shadow-2xl animate-slide-up bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Panel Header */}
                <div
                    className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)] sticky top-0 z-10 bg-[var(--color-bg-primary)]"
                >
                    <h2 className="font-arabic font-bold text-lg text-[var(--color-text-primary)]">
                        فهرس المصحف
                    </h2>
                    <button
                        onClick={() => setShowNavPanel(false)}
                        className="p-2 rounded-full transition-all active:scale-90 hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]"
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
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-bold font-arabic transition-all active:scale-95 border ${navTab === tab.id
                                ? 'bg-[var(--color-accent)] text-white border-transparent shadow-lg'
                                : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border)] opacity-60 hover:opacity-100'
                                }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search Bar - Elegant Input */}
                {navTab === 'surah' && (
                    <div className="px-6 pb-3">
                        <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] focus-within:border-[var(--color-accent)] transition-all">
                            <Search size={18} className="text-[var(--color-text-tertiary)]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث عن سورة..."
                                className="flex-1 bg-transparent text-sm font-arabic focus:outline-none placeholder:opacity-30"
                                autoFocus
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="p-1 rounded-lg transition-all hover:bg-black/5 text-gray-500">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Panel Content */}
                <div className="flex-1 overflow-y-auto nav-panel-scroll px-1 pb-10 bg-[var(--color-bg-primary)]">

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
                                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all active:scale-[0.98] border ${isCurrentSurah
                                            ? 'bg-[var(--color-accent)] text-white border-transparent shadow-md'
                                            : 'hover:bg-[var(--color-bg-tertiary)] border-transparent'
                                            }`}
                                    >
                                        {/* Number Badge */}
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${isCurrentSurah
                                            ? 'bg-white/20 text-white'
                                            : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]'
                                            }`}>
                                            {number}
                                        </div>

                                        {/* Surah Name */}
                                        <div className="flex-1 text-right">
                                            <span className={`font-arabic font-bold text-sm block ${isCurrentSurah ? 'text-white' : 'text-[var(--color-text-primary)]'}`}>
                                                {name}
                                            </span>
                                        </div>

                                        {/* Page Range */}
                                        <div className={`text-center px-2 py-1 rounded-lg ${isCurrentSurah
                                            ? 'bg-white/10'
                                            : 'bg-[var(--color-bg-tertiary)]'
                                            }`}>
                                            <span className={`text-[10px] font-bold tabular-nums block ${isCurrentSurah
                                                ? 'text-white'
                                                : 'text-[var(--color-text-tertiary)]'
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
                                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all active:scale-90 border ${isCurrentJuzItem
                                            ? 'bg-[var(--color-accent)] text-white border-transparent shadow-md'
                                            : 'bg-[var(--color-bg-tertiary)] border-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'
                                            }`}
                                    >
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isCurrentJuzItem ? 'bg-white/20' : 'bg-[var(--color-bg-secondary)]'}`}>
                                            <span className="font-arabic font-bold text-xs">{juz}</span>
                                        </div>
                                        <span className={`text-[9px] font-bold ${isCurrentJuzItem ? 'text-white/70' : 'text-[var(--color-text-tertiary)]'}`}>
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
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-bg-tertiary)]">
                                    <span className="text-4xl font-bold tabular-nums text-[var(--color-text-primary)]">
                                        {pageNumber}
                                    </span>
                                </div>
                                <p className="text-xs font-arabic text-[var(--color-text-tertiary)] mt-1">
                                    من 604 صفحة (P. {pageNumber}/604)
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
                                    placeholder="رقم الصفحة..."
                                    min="1"
                                    max="604"
                                    className="flex-1 text-center rounded-xl px-4 py-2.5 text-base font-bold bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:opacity-30 focus:border-[var(--color-accent)] focus:outline-none transition-all font-arabic"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl text-white font-arabic font-bold active:scale-95 transition-all shadow-md bg-[var(--color-accent)]"
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
                                            ? 'bg-[var(--color-accent)] text-white shadow-md'
                                            : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
                                            }`}
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
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 bg-[var(--color-bg-tertiary)]">
                                        <BookMarked size={36} className="text-[var(--color-text-tertiary)]" />
                                    </div>
                                    <p className="font-arabic text-sm text-[var(--color-text-tertiary)]">
                                        لا توجد علامات مرجعية
                                    </p>
                                </div>
                            ) : (
                                bookmarkedPages.map(p => (
                                    <div key={p} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all border ${p === pageNumber
                                        ? 'bg-[var(--color-accent)] text-white border-transparent shadow-lg'
                                        : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]'
                                        }`}>

                                        <button
                                            onClick={() => navigateTo(p, p > pageNumber ? 'left' : 'right')}
                                            className="flex-1 flex items-center gap-3"
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p === pageNumber ? 'bg-white/20' : 'bg-[var(--color-bg-secondary)]'}`}>
                                                <Check size={18} className={p === pageNumber ? 'text-white' : 'text-[var(--color-accent)]'} />
                                            </div>
                                            <div className="text-right">
                                                <span className={`font-arabic font-bold text-sm block ${p === pageNumber ? 'text-white' : 'text-[var(--color-text-primary)]'}`}>
                                                    صفحة {p}
                                                </span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setBookmarkedPages(prev => prev.filter(bp => bp !== p))}
                                            className={`p-2 rounded-lg transition-all active:scale-90 ${p === pageNumber ? 'hover:bg-white/20 text-white/70' : 'hover:bg-red-100 text-red-500'}`}
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
