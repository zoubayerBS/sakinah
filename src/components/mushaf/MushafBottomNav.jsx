import React from 'react';
import { ChevronRight, ChevronLeft, ChevronUp, ChevronDown, List, Brain } from 'lucide-react';

const MushafBottomNav = ({
    showControls,
    setShowControls,
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
    const pageLabel = `صفحة ${toArabicIndicDigits ? toArabicIndicDigits(pageNumber) : pageNumber}`;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[600] w-full pointer-events-none">
            {/* ═══════════════════════════════════════════════════════ */}
            {/* COLLAPSED STATE: small floating handle (default on rest) */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div
                className={`absolute bottom-0 left-0 right-0 flex justify-center transition-all duration-300 ${showControls ? 'opacity-0 translate-y-6 pointer-events-none' : 'opacity-100 translate-y-0 pointer-events-auto'}`}
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.5rem)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => setShowControls(true)}
                    className="flex items-center gap-2 h-9 px-4 rounded-full shadow-lg border border-[var(--color-border)] backdrop-blur-md active:scale-95 transition-all"
                    style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        color: mode.text,
                        boxShadow: 'var(--shadow-lg)',
                    }}
                    title="إظهار أدوات القراءة"
                >
                    <ChevronUp size={16} style={{ color: mode.accent }} />
                    <span className="text-[11px] font-bold font-arabic leading-none">{pageLabel}</span>
                </button>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* EXPANDED STATE: full control bar                         */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div
                className={`w-full transition-all duration-300 ${showControls ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'}`}
                style={{
                    paddingTop: '0.25rem',
                    paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.25rem)',
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderTop: '1px solid var(--color-border)',
                    boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="flex items-center justify-between sm:justify-center gap-1 sm:gap-3 px-3 sm:px-4 w-full max-w-4xl mx-auto"
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
                    <div className="flex flex-col items-center flex-1 min-w-0 max-w-[240px] sm:max-w-none sm:w-48 gap-0.5">
                        <span className="text-[9px] font-bold opacity-60 font-arabic leading-none" style={{ color: mode.text }}>
                            {pageLabel}
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

                    {/* Collapse Button */}
                    <button
                        onClick={() => setShowControls(false)}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/5 active:scale-90"
                        style={{ color: mode.text, opacity: 0.6 }}
                        title="إخفاء الأدوات"
                    >
                        <ChevronDown size={20} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default MushafBottomNav;
