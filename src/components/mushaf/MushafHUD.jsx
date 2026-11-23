import React from 'react';
import { Home, Bookmark, BookmarkCheck, CheckCircle2, Brain, List, ChevronRight, ChevronLeft, Minus, Plus } from 'lucide-react';

/**
 * MushafHUD — immersive floating controls (replaces the old 2-row navbar).
 *
 * - Top pill:    home, surah/juz info, bookmark, theme, hifz, index
 * - Bottom bar:  prev/next page, page slider (page number centered), font A-/A+
 * - Hairline:    always-visible 2px reading progress at the very bottom edge
 *
 * Both pills float OVER the Quran text and auto-hide (opacity + scale),
 * giving a 100% chrome-free screen at rest. Taps on the HUD never toggle
 * the page HUD — they only restart the auto-hide timer (onActivity).
 */

const FONT_MIN = 0.75;
const FONT_MAX = 1.8;

const MushafHUD = ({
    showControls,
    onActivity,
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
    pageNumber,
    setPageNumber,
    handlePrev,
    handleNext,
    isHifzMode,
    setIsHifzMode,
    setShowNavPanel,
    setNavTab,
    toArabicIndicDigits,
    fontScale,
    setFontScale,
    progressPercent
}) => {
    const currentWird = khitma?.isStarted && khitma?.schedule ? khitma.schedule[khitma.currentDayIndex] : null;
    const pageLabel = `صفحة ${toArabicIndicDigits ? toArabicIndicDigits(pageNumber) : pageNumber}`;

    // Swallow taps (never bubble to the page container) + keep the HUD alive
    const hudInteraction = (e) => {
        e.stopPropagation();
        if (onActivity) onActivity();
    };

    const changeFontScale = (delta) => {
        setFontScale(prev => {
            const next = Math.round((prev + delta) * 10) / 10;
            return Math.min(FONT_MAX, Math.max(FONT_MIN, next));
        });
    };

    const glassStyle = {
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-lg)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        color: mode.text,
    };

    const iconBtn = 'w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-all active:scale-90 hover:bg-black/5';
    const showCls = showControls
        ? 'opacity-100 scale-100 pointer-events-auto'
        : 'opacity-0 scale-95 pointer-events-none';

    return (
        <div className="fixed inset-0 z-[600] pointer-events-none">
            {/* ════════════════════════════════════════════════════════ */}
            {/* ALWAYS-VISIBLE HAIRLINE PROGRESS (2px, bottom edge)      */}
            {/* ════════════════════════════════════════════════════════ */}
            <div
                className="absolute bottom-0 left-0 right-0 h-[2px]"
                style={{ backgroundColor: mode.text, opacity: 0.1 }}
            >
                <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${progressPercent}%`, backgroundColor: mode.accent }}
                />
            </div>

            {/* ════════════════════════════════════════════════════════ */}
            {/* TOP PILL — actions                                       */}
            {/* ════════════════════════════════════════════════════════ */}
            <header
                onClick={hudInteraction}
                className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-1.5 py-1 rounded-full transition-all duration-500 ${showCls} ${showControls ? 'translate-y-0' : '-translate-y-6'}`}
                style={{
                    top: 'max(0.75rem, calc(env(safe-area-inset-top) + 0.35rem))',
                    ...glassStyle,
                }}
            >
                {/* Home / Back */}
                <button
                    onClick={() => onBack && onBack()}
                    className={iconBtn}
                    style={{ color: mode.text }}
                    title="الرئيسية"
                >
                    <Home size={17} />
                </button>

                {/* Title info (surah + juz, or khitma wird) */}
                <div className="flex flex-col items-center justify-center min-w-0 px-1.5 max-w-[42vw]">
                    <h1 className="font-arabic font-bold text-[13px] leading-tight truncate max-w-full" style={{ color: mode.text }}>
                        {pageInfo ? formatSurahTitle(pageInfo.surah) : 'المصحف'}
                    </h1>
                    {khitma?.isStarted && currentWird ? (
                        currentWird.isCompleted ? (
                            <span className="text-[9px] font-arabic font-bold text-[var(--color-accent)] leading-tight whitespace-nowrap">
                                تم إنجاز ورد اليوم
                            </span>
                        ) : (
                            <div className="flex items-center gap-1">
                                <span className="text-[9px] font-arabic opacity-70 leading-tight whitespace-nowrap" style={{ color: mode.text }}>
                                    ورد: ص {currentWird.startPage}-{currentWird.endPage}
                                </span>
                                <button
                                    onClick={onFinishPortion}
                                    className="p-0 text-[var(--color-accent)] hover:scale-110 active:scale-95 transition-all"
                                    title="إتمام الورد"
                                >
                                    <CheckCircle2 size={12} />
                                </button>
                            </div>
                        )
                    ) : (
                        pageInfo && (
                            <span className="text-[9px] font-bold opacity-50 leading-tight whitespace-nowrap" style={{ color: mode.text }}>
                                الجزء {pageInfo.juz} • ص {pageInfo.firstVerse}-{pageInfo.lastVerse}
                            </span>
                        )
                    )}
                </div>

                {/* Bookmark */}
                <button
                    onClick={toggleBookmark}
                    className={iconBtn}
                    style={{ color: isCurrentPageBookmarked ? mode.accent : mode.text, opacity: isCurrentPageBookmarked ? 1 : 0.6 }}
                    title="علامة مرجعية"
                >
                    {isCurrentPageBookmarked ? <BookmarkCheck size={16} fill="currentColor" /> : <Bookmark size={16} />}
                </button>

                {/* Reading theme cycle */}
                <button
                    onClick={() => {
                        const modes = Object.keys(READING_MODES);
                        const idx = modes.indexOf(readingMode);
                        setReadingMode(modes[(idx + 1) % modes.length]);
                    }}
                    className={iconBtn}
                    style={{ color: mode.text, opacity: 0.65 }}
                    title="مظهر القراءة"
                >
                    {mode.icon && <mode.icon size={16} />}
                </button>

                {/* Hifz mode */}
                <button
                    onClick={() => setIsHifzMode(prev => !prev)}
                    className={`${iconBtn} ${isHifzMode ? 'hifz-toggle-active' : ''}`}
                    style={{
                        backgroundColor: isHifzMode ? 'var(--color-accent)' : 'transparent',
                        color: isHifzMode ? '#fff' : mode.text,
                        opacity: isHifzMode ? 1 : 0.65,
                    }}
                    title="وضع الحفظ"
                >
                    <Brain size={16} />
                </button>

                {/* Index */}
                <button
                    onClick={() => { setShowNavPanel(true); setNavTab('surah'); }}
                    className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-all active:scale-95 hover:brightness-110"
                    style={{
                        backgroundColor: mode.accent,
                        color: '#fff',
                        boxShadow: `0 4px 12px ${mode.accent}40`
                    }}
                    title="الفهرس"
                >
                    <List size={16} />
                </button>
            </header>

            {/* ════════════════════════════════════════════════════════ */}
            {/* BOTTOM CAPSULE — page navigation + font size             */}
            {/* ════════════════════════════════════════════════════════ */}
            <nav
                onClick={hudInteraction}
                className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1.5 rounded-full transition-all duration-500 ${showCls} ${showControls ? 'translate-y-0' : 'translate-y-6'}`}
                style={{
                    bottom: 'max(0.75rem, calc(env(safe-area-inset-bottom) + 0.5rem))',
                    ...glassStyle,
                }}
            >
                {/* Prev page (RTL) */}
                <button
                    onClick={handlePrev}
                    disabled={pageNumber <= 1}
                    className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-all hover:bg-black/5 active:scale-90 disabled:opacity-20"
                    style={{ color: mode.text }}
                    title="الصفحة السابقة"
                >
                    <ChevronRight size={20} />
                </button>

                {/* Slider with the page number centered on top */}
                <div className="relative flex items-center w-[140px] sm:w-52 shrink-0">
                    <input
                        type="range"
                        min="1"
                        max="604"
                        value={pageNumber}
                        onChange={(e) => setPageNumber(parseInt(e.target.value))}
                        className="mushaf-slider w-full h-1 rounded-full appearance-none cursor-pointer bg-current opacity-25 hover:opacity-100 transition-opacity"
                        style={{ color: mode.accent }}
                        title="انتقل إلى صفحة"
                    />
                    <span
                        className="absolute left-1/2 -translate-x-1/2 px-1.5 text-[9px] font-bold font-arabic leading-none whitespace-nowrap pointer-events-none rounded-full"
                        style={{
                            color: mode.text,
                            opacity: 0.8,
                            backgroundColor: 'var(--color-bg-secondary)',
                        }}
                    >
                        {pageLabel}
                    </span>
                </div>

                {/* Next page (RTL) */}
                <button
                    onClick={handleNext}
                    disabled={pageNumber >= 604}
                    className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-all hover:bg-black/5 active:scale-90 disabled:opacity-20"
                    style={{ color: mode.text }}
                    title="الصفحة التالية"
                >
                    <ChevronLeft size={20} />
                </button>

                {/* Divider */}
                <div className="w-px h-5 mx-0.5" style={{ backgroundColor: mode.text, opacity: 0.12 }} />

                {/* Font size */}
                <button
                    onClick={() => changeFontScale(-0.1)}
                    disabled={fontScale <= FONT_MIN}
                    className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center transition-all hover:bg-black/5 active:scale-90 disabled:opacity-25"
                    style={{ color: mode.text }}
                    title="تصغير الخط"
                >
                    <Minus size={14} />
                </button>
                <button
                    onClick={() => changeFontScale(0.1)}
                    disabled={fontScale >= FONT_MAX}
                    className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center transition-all hover:bg-black/5 active:scale-90 disabled:opacity-25"
                    style={{ color: mode.text }}
                    title="تكبير الخط"
                >
                    <Plus size={14} />
                </button>
            </nav>
        </div>
    );
};

export default MushafHUD;
