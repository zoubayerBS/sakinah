import React from 'react';
import { ChevronRight, ChevronLeft, List } from 'lucide-react';

const MushafBottomNav = ({
    showControls,
    isDarkMode,
    handlePrev,
    handleNext,
    pageNumber,
    setPageNumber,
    mode,
    setShowNavPanel,
    setNavTab,
    toArabicIndicDigits
}) => {
    return (
        <nav
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[600] w-auto max-w-[94%] ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}
            style={{
                transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms cubic-bezier(0.22, 1, 0.36, 1)',
                willChange: 'transform, opacity',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="flex items-center gap-3 px-2 py-2 rounded-full shadow-2xl border border-white/5"
                style={{
                    backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                    boxShadow: isDarkMode ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.05)',
                }}
            >
                {/* Prev Page Button (RTL) */}
                <button
                    onClick={handlePrev}
                    disabled={pageNumber <= 1}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 active:scale-90 disabled:opacity-20"
                    style={{ color: mode.text }}
                >
                    <ChevronRight size={22} />
                </button>

                {/* Page Info & Slider Container */}
                <div className="flex flex-col items-center w-32 sm:w-48 gap-1">
                    <span className="text-[10px] font-bold opacity-60 font-arabic" style={{ color: mode.text }}>
                        صفحة {toArabicIndicDigits ? toArabicIndicDigits(pageNumber) : pageNumber}
                    </span>
                    <input
                        type="range"
                        min="1"
                        max="604"
                        value={pageNumber}
                        onChange={(e) => setPageNumber(parseInt(e.target.value))}
                        className="mushaf-slider w-full h-1 rounded-full appearance-none cursor-pointer bg-current opacity-20 hover:opacity-100 transition-opacity"
                        style={{ color: mode.accent }}
                    />
                </div>

                {/* Next Page Button (RTL) */}
                <button
                    onClick={handleNext}
                    disabled={pageNumber >= 604}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 active:scale-90 disabled:opacity-20"
                    style={{ color: mode.text }}
                >
                    <ChevronLeft size={22} />
                </button>

                {/* Divider */}
                <div className="w-px h-6 bg-current opacity-10 mx-1" style={{ color: mode.text }} />

                {/* Menu Button */}
                <button
                    onClick={() => { setShowNavPanel(true); setNavTab('surah'); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full transition-all active:scale-95 hover:bg-black/5"
                    style={{
                        backgroundColor: mode.accent,
                        color: '#fff',
                        boxShadow: `0 4px 12px ${mode.accent}40`
                    }}
                >
                    <List size={18} />
                    <span className="text-xs font-bold hidden sm:inline font-arabic">الفهرس</span>
                </button>
            </div>
        </nav>
    );
};

export default MushafBottomNav;
