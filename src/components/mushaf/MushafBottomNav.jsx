import React from 'react';
import { ChevronRight, ChevronLeft, List, Brain } from 'lucide-react';

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
    toArabicIndicDigits,
    isHifzMode,
    setIsHifzMode
}) => {
    return (
        <nav
            className={`fixed left-1/2 -translate-x-1/2 z-[600] w-[96%] sm:w-auto sm:max-w-[94%] ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}
            style={{
                bottom: 'max(1.5rem, env(safe-area-inset-bottom))',
                transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms cubic-bezier(0.22, 1, 0.36, 1)',
                willChange: 'transform, opacity',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="flex items-center justify-between sm:justify-center gap-1 sm:gap-3 px-2 py-2 rounded-full shadow-2xl border border-[var(--color-border)] transition-all duration-300 backdrop-blur-md"
                style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    boxShadow: 'var(--shadow-lg)',
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
                <div className="flex flex-col items-center flex-1 max-w-[120px] sm:max-w-none sm:w-48 gap-1">
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

                {/* Hifz Toggle Button */}
                <button
                    onClick={() => setIsHifzMode(prev => !prev)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${isHifzMode ? 'hifz-toggle-active' : 'hover:bg-black/5'}`}
                    style={{
                        backgroundColor: isHifzMode ? 'var(--color-accent)' : 'transparent',
                        color: isHifzMode ? '#fff' : mode.text,
                    }}
                    title="وضع الحفظ"
                >
                    <Brain size={18} />
                </button>

                {/* Menu Button */}
                <button
                    onClick={() => { setShowNavPanel(true); setNavTab('surah'); }}
                    className="flex items-center justify-center gap-2 w-10 sm:w-auto sm:px-4 h-10 sm:h-auto py-2 rounded-full transition-all active:scale-95 hover:bg-black/5"
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
