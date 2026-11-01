import React from 'react';
import { Home, Bookmark, BookmarkCheck, CheckCircle2, ChevronRight, ChevronLeft, Brain, List } from 'lucide-react';

const MushafHeader = ({
    showControls,
    onBack,
    mode,
    isDarkMode,
    pageInfo,
    formatSurahTitle,
    khitma,
    onFinishPortion,
    toggleBookmark,
    isCurrentPageBookmarked,
    readingMode,
    setReadingMode,
    READING_MODES,
    // Page navigation & tools (moved from the old bottom bar)
    pageNumber,
    setPageNumber,
    handlePrev,
    handleNext,
    isHifzMode,
    setIsHifzMode,
    setShowNavPanel,
    setNavTab,
    toArabicIndicDigits
}) => {
    const currentWird = khitma?.isStarted && khitma?.schedule ? khitma.schedule[khitma.currentDayIndex] : null;
    const pageLabel = `صفحة ${toArabicIndicDigits ? toArabicIndicDigits(pageNumber) : pageNumber}`;

    return (
        <header
            className={`fixed left-1/2 -translate-x-1/2 z-[600] w-[96%] sm:w-auto sm:max-w-[94%] ${showControls ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0 pointer-events-none'}`}
            style={{
                top: 'max(1.5rem, env(safe-area-inset-top))',
                transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms cubic-bezier(0.22, 1, 0.36, 1)',
                willChange: 'transform, opacity',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="rounded-[1.75rem] overflow-hidden shadow-2xl border border-[var(--color-border)] transition-all duration-300 backdrop-blur-md opacity-90"
                style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    boxShadow: 'var(--shadow-lg)',
                }}
            >
                {/* ═══ Row 1: Home · Title · Tools ═══ */}
                <div className="flex items-center gap-1 px-2 py-1.5">
                    {/* Home / Back */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onBack) onBack();
                        }}
                        className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-all hover:bg-black/5 active:scale-90"
                        style={{ color: mode.text }}
                        title="الرئيسية"
                    >
                        <Home size={18} />
                    </button>

                    {/* Title Info */}
                    <div className="flex flex-col items-center flex-1 min-w-0 px-1">
                        <h1 className="font-arabic font-bold text-sm leading-tight truncate max-w-full" style={{ color: mode.text }}>
                            {pageInfo ? formatSurahTitle(pageInfo.surah) : 'المصحف'}
                        </h1>

                        {khitma?.isStarted ? (
                            <div className="flex flex-col items-center w-full mt-1 px-1">
                                <div className="flex items-center gap-2 w-full">
                                    {currentWird?.isCompleted ? (
                                        <div className="w-full text-center text-[10px] font-arabic text-[var(--color-accent)] font-bold">
                                            تم إنجاز ورد اليوم
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex-1 text-center text-[10px] font-arabic opacity-70" style={{ color: mode.text }}>
                                                الورد: ص {currentWird?.startPage} - {currentWird?.endPage}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onFinishPortion) onFinishPortion();
                                                }}
                                                className="p-1 rounded-full text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 active:scale-95 transition-all"
                                                title="إتمام الورد يدوياً"
                                            >
                                                <CheckCircle2 size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            pageInfo && (
                                <span className="text-[9px] font-bold opacity-50 truncate max-w-full" style={{ color: mode.text }}>
                                    الجزء {pageInfo.juz} • {pageInfo.surahEnglish}
                                </span>
                            )
                        )}
                    </div>

                    {/* Bookmark */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark();
                        }}
                        className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-all active:scale-90 ${isCurrentPageBookmarked ? '' : 'hover:bg-black/5'}`}
                        style={{ color: isCurrentPageBookmarked ? mode.accent : mode.text, opacity: isCurrentPageBookmarked ? 1 : 0.6 }}
                        title="علامة مرجعية"
                    >
                        {isCurrentPageBookmarked ? <BookmarkCheck size={17} fill="currentColor" /> : <Bookmark size={17} />}
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const modes = Object.keys(READING_MODES);
                            const idx = modes.indexOf(readingMode);
                            setReadingMode(modes[(idx + 1) % modes.length]);
                        }}
                        className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-all hover:bg-black/5 active:scale-90 opacity-60 hover:opacity-100"
                        style={{ color: mode.text }}
                        title="مظهر القراءة"
                    >
                        {mode.icon && <mode.icon size={17} />}
                    </button>

                    {/* Hifz Mode Toggle */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsHifzMode(prev => !prev);
                        }}
                        className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-all active:scale-90 ${isHifzMode ? 'hifz-toggle-active' : 'hover:bg-black/5 opacity-60 hover:opacity-100'}`}
                        style={{
                            backgroundColor: isHifzMode ? 'var(--color-accent)' : 'transparent',
                            color: isHifzMode ? '#fff' : mode.text,
                        }}
                        title="وضع الحفظ"
                    >
                        <Brain size={17} />
                    </button>

                    {/* Index / Navigation Panel */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowNavPanel(true);
                            setNavTab('surah');
                        }}
                        className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-all active:scale-95 hover:bg-black/5"
                        style={{
                            backgroundColor: mode.accent,
                            color: '#fff',
                            boxShadow: `0 4px 12px ${mode.accent}40`
                        }}
                        title="الفهرس"
                    >
                        <List size={17} />
                    </button>
                </div>

                {/* ═══ Row 2: Page navigation + slider ═══ */}
                <div className="flex items-center gap-2 px-3 pt-1 pb-2 border-t border-[var(--color-border)]">
                    {/* Prev Page (RTL) */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePrev();
                        }}
                        disabled={pageNumber <= 1}
                        className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-all hover:bg-black/5 active:scale-90 disabled:opacity-20"
                        style={{ color: mode.text }}
                        title="الصفحة السابقة"
                    >
                        <ChevronRight size={20} />
                    </button>

                    {/* Page slider with the page number centered on top of it */}
                    <div className="relative flex-1 min-w-0 flex items-center">
                        <input
                            type="range"
                            min="1"
                            max="604"
                            value={pageNumber}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setPageNumber(parseInt(e.target.value))}
                            className="mushaf-slider w-full h-1 rounded-full appearance-none cursor-pointer bg-current opacity-20 hover:opacity-100 transition-opacity"
                            style={{ color: mode.accent }}
                            title="انتقل إلى صفحة"
                        />
                        {/* Page number, centered in the middle of the row */}
                        <span
                            className="absolute left-1/2 -translate-x-1/2 px-2 text-[9px] font-bold font-arabic leading-none whitespace-nowrap pointer-events-none"
                            style={{
                                color: mode.text,
                                opacity: 0.75,
                                backgroundColor: 'var(--color-bg-secondary)',
                            }}
                        >
                            {pageLabel}
                        </span>
                    </div>

                    {/* Next Page (RTL) */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNext();
                        }}
                        disabled={pageNumber >= 604}
                        className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-all hover:bg-black/5 active:scale-90 disabled:opacity-20"
                        style={{ color: mode.text }}
                        title="الصفحة التالية"
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default MushafHeader;
