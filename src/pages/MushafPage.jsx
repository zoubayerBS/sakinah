import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BookOpen, ChevronRight, ChevronLeft, Search, Loader2, Bookmark, BookmarkCheck, Maximize2, Minimize2, Sun, Moon, Coffee, Layers, X, BookMarked, Hash, List, Type } from 'lucide-react';
import { quranAPI } from '../services/quran-api.js';
import { FrameCorner } from '../components/MushafDecorations';
import { surahPageMapping } from '../data/surah-pages.js';

// Juz data for quick navigation
const JUZ_PAGES = [
    { juz: 1, page: 1 }, { juz: 2, page: 22 }, { juz: 3, page: 42 },
    { juz: 4, page: 62 }, { juz: 5, page: 82 }, { juz: 6, page: 102 },
    { juz: 7, page: 121 }, { juz: 8, page: 142 }, { juz: 9, page: 162 },
    { juz: 10, page: 182 }, { juz: 11, page: 201 }, { juz: 12, page: 222 },
    { juz: 13, page: 242 }, { juz: 14, page: 262 }, { juz: 15, page: 282 },
    { juz: 16, page: 302 }, { juz: 17, page: 322 }, { juz: 18, page: 342 },
    { juz: 19, page: 362 }, { juz: 20, page: 382 }, { juz: 21, page: 402 },
    { juz: 22, page: 422 }, { juz: 23, page: 442 }, { juz: 24, page: 462 },
    { juz: 25, page: 482 }, { juz: 26, page: 502 }, { juz: 27, page: 522 },
    { juz: 28, page: 542 }, { juz: 29, page: 562 }, { juz: 30, page: 582 },
];

// Surah names for navigation
const SURAH_NAMES = [
    'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال',
    'التوبة', 'يونس', 'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر', 'النحل',
    'الإسراء', 'الكهف', 'مريم', 'طه', 'الأنبياء', 'الحج', 'المؤمنون', 'النور',
    'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم', 'لقمان', 'السجدة',
    'الأحزاب', 'سبأ', 'فاطر', 'يس', 'الصافات', 'ص', 'الزمر', 'غافر',
    'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية', 'الأحقاف', 'محمد', 'الفتح',
    'الحجرات', 'ق', 'الذاريات', 'الطور', 'النجم', 'القمر', 'الرحمن', 'الواقعة',
    'الحديد', 'المجادلة', 'الحشر', 'الممتحنة', 'الصف', 'الجمعة', 'المنافقون', 'التغابن',
    'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج', 'نوح', 'الجن',
    'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس',
    'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى', 'الغاشية',
    'الفجر', 'البلد', 'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق',
    'القدر', 'البينة', 'الزلزلة', 'العاديات', 'القارعة', 'التكاثر', 'العصر', 'الهمزة',
    'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر', 'المسد', 'الإخلاص',
    'الفلق', 'الناس'
];

const READING_MODES = {
    light: { bg: '#FDFCFA', label: 'فاتح', icon: Sun },
    sepia: { bg: '#F4ECD8', label: 'ورقي', icon: Coffee },
    dark: { bg: '#1A1A2E', label: 'داكن', icon: Moon },
};

const MushafPage = () => {
    // Core state
    const [pageNumber, setPageNumber] = useState(() => {
        const saved = localStorage.getItem('mushaf-last-page');
        return saved ? parseInt(saved) : 1;
    });
    const [isLoading, setIsLoading] = useState(true);
    const [pageInfo, setPageInfo] = useState(null);
    const [verses, setVerses] = useState([]);

    // UI state
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [readingMode, setReadingMode] = useState(() => localStorage.getItem('mushaf-reading-mode') || 'light');
    const [bookmarkedPages, setBookmarkedPages] = useState(() => {
        try { return JSON.parse(localStorage.getItem('mushaf-bookmarks') || '[]'); }
        catch { return []; }
    });
    const [slideDirection, setSlideDirection] = useState(null);
    const [viewMode, setViewMode] = useState('image'); // 'image' or 'text'
    const [textAyahs, setTextAyahs] = useState([]);

    // Navigation panel state
    const [showNavPanel, setShowNavPanel] = useState(false);
    const [navTab, setNavTab] = useState('surah'); // 'surah', 'juz', 'page', 'bookmarks'
    const [searchQuery, setSearchQuery] = useState('');

    // Refs
    const containerRef = useRef(null);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const touchDeltaX = useRef(0);
    const isSwiping = useRef(false);
    const controlsTimeout = useRef(null);
    const pageContentRef = useRef(null);

    // Preloaded pages cache
    const [preloadedPages, setPreloadedPages] = useState({});

    // Save last read page
    useEffect(() => {
        localStorage.setItem('mushaf-last-page', pageNumber.toString());
    }, [pageNumber]);

    // Save reading mode
    useEffect(() => {
        localStorage.setItem('mushaf-reading-mode', readingMode);
    }, [readingMode]);

    // Save bookmarks
    useEffect(() => {
        localStorage.setItem('mushaf-bookmarks', JSON.stringify(bookmarkedPages));
    }, [bookmarkedPages]);

    // Fetch page data
    useEffect(() => {
        let isCancelled = false;
        const fetchMushafPage = async () => {
            setIsLoading(true);
            try {
                const data = await quranAPI.getAuthenticatedMushafPage(pageNumber);
                if (!isCancelled && data) {
                    setVerses(data);
                    const infoResponse = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/quran-uthmani`);
                    const infoData = await infoResponse.json();

                    if (!isCancelled && infoData.code === 200) {
                        const ayahsData = infoData.data.ayahs;
                        const firstAyah = ayahsData[0];
                        const lastAyah = ayahsData[ayahsData.length - 1];
                        const surahsOnPage = [...new Set(ayahsData.map(a => a.surah.name))];
                        setPageInfo({
                            surah: firstAyah.surah.name,
                            surahEnglish: firstAyah.surah.englishName,
                            surahNumber: firstAyah.surah.number,
                            juz: firstAyah.juz,
                            hizbQuarter: firstAyah.hizbQuarter,
                            number: pageNumber,
                            surahsOnPage,
                            firstVerse: firstAyah.numberInSurah,
                            lastVerse: lastAyah.numberInSurah,
                            lastSurah: lastAyah.surah.name,
                        });
                        // Save text ayahs for text mode
                        setTextAyahs(ayahsData);
                    }
                }
            } catch (err) {
                console.error('Error fetching mushaf page:', err);
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        };

        fetchMushafPage();
        return () => { isCancelled = true; };
    }, [pageNumber]);

    // Preload adjacent pages
    useEffect(() => {
        const preload = async (pn) => {
            if (pn >= 1 && pn <= 604 && !preloadedPages[pn]) {
                const data = await quranAPI.getAuthenticatedMushafPage(pn);
                if (data) {
                    setPreloadedPages(prev => ({ ...prev, [pn]: data }));
                }
            }
        };
        preload(pageNumber + 1);
        preload(pageNumber - 1);
    }, [pageNumber]);

    // Auto-hide controls in fullscreen
    const resetControlsTimer = useCallback(() => {
        setShowControls(true);
        if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
        controlsTimeout.current = setTimeout(() => {
            if (isFullscreen) setShowControls(false);
        }, 4000);
    }, [isFullscreen]);

    // Touch handlers for swipe navigation
    const handleTouchStart = useCallback((e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        touchDeltaX.current = 0;
        isSwiping.current = false;
    }, []);

    const handleTouchMove = useCallback((e) => {
        const deltaX = e.touches[0].clientX - touchStartX.current;
        const deltaY = e.touches[0].clientY - touchStartY.current;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
            isSwiping.current = true;
            touchDeltaX.current = deltaX;
            if (pageContentRef.current) {
                const clampedDelta = Math.max(-100, Math.min(100, deltaX * 0.3));
                pageContentRef.current.style.transform = `translateX(${clampedDelta}px)`;
                pageContentRef.current.style.transition = 'none';
            }
        }
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (pageContentRef.current) {
            pageContentRef.current.style.transform = '';
            pageContentRef.current.style.transition = 'transform 0.3s ease-out';
        }

        if (isSwiping.current) {
            const threshold = 60;
            if (touchDeltaX.current < -threshold && pageNumber < 604) {
                navigateTo(pageNumber + 1, 'left');
            } else if (touchDeltaX.current > threshold && pageNumber > 1) {
                navigateTo(pageNumber - 1, 'right');
            }
        } else {
            resetControlsTimer();
        }
        isSwiping.current = false;
    }, [pageNumber, resetControlsTimer]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (showNavPanel) return; // Don't navigate when panel is open
            if (e.key === 'ArrowLeft' && pageNumber < 604) {
                navigateTo(pageNumber + 1, 'left');
            } else if (e.key === 'ArrowRight' && pageNumber > 1) {
                navigateTo(pageNumber - 1, 'right');
            } else if (e.key === 'Escape') {
                if (showNavPanel) setShowNavPanel(false);
                else if (isFullscreen) setIsFullscreen(false);
            } else if (e.key === 'f' || e.key === 'F') {
                setIsFullscreen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pageNumber, isFullscreen, showNavPanel]);

    const navigateTo = useCallback((page, direction) => {
        if (page >= 1 && page <= 604) {
            setSlideDirection(direction);
            setPageNumber(page);
            setShowNavPanel(false);
            setTimeout(() => setSlideDirection(null), 400);
        }
    }, []);

    const handleNext = () => navigateTo(pageNumber + 1, 'left');
    const handlePrev = () => navigateTo(pageNumber - 1, 'right');

    const toggleBookmark = () => {
        setBookmarkedPages(prev =>
            prev.includes(pageNumber)
                ? prev.filter(p => p !== pageNumber)
                : [...prev, pageNumber].sort((a, b) => a - b)
        );
    };

    const isCurrentPageBookmarked = bookmarkedPages.includes(pageNumber);
    const getReadingModeBg = () => READING_MODES[readingMode]?.bg || '#FDFCFA';
    const isDarkReading = readingMode === 'dark';
    const progressPercent = ((pageNumber / 604) * 100).toFixed(1);

    // Filter surahs by search
    const filteredSurahs = SURAH_NAMES.map((name, idx) => ({ name, number: idx + 1 }))
        .filter(s => searchQuery === '' || s.name.includes(searchQuery) || s.number.toString().includes(searchQuery));

    // Find current juz
    const currentJuz = JUZ_PAGES.reduce((acc, j) => pageNumber >= j.page ? j.juz : acc, 1);

    return (
        <div
            ref={containerRef}
            className={`min-h-screen pb-24 animate-fade-in transition-all duration-500 ${isFullscreen ? 'fixed inset-0 z-[9999] pb-0' : ''}`}
            style={{ backgroundColor: getReadingModeBg() }}
            dir="rtl"
        >
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TOP HEADER BAR */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <header
                className={`sticky top-0 z-50 w-full backdrop-blur-xl transition-all duration-500 ${showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
                style={{
                    backgroundColor: isDarkReading ? 'rgba(26,26,46,0.97)' : 'rgba(253,252,250,0.97)',
                    borderBottom: `1px solid ${isDarkReading ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                }}
            >
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px]">
                    <div
                        className="h-full bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-highlight)] to-[var(--color-accent)] transition-all duration-700 ease-out rounded-full"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                <div className="max-w-[1200px] mx-auto px-4 py-2.5">
                    <div className="flex items-center justify-between gap-3">
                        {/* Left: Surah & Juz Info */}
                        <div className="flex flex-col min-w-0 flex-1">
                            <h1 className={`font-arabic font-bold text-base truncate ${isDarkReading ? 'text-white' : 'text-[var(--color-text-primary)]'}`}>
                                {pageInfo ? pageInfo.surah : 'المصحف الشريف'}
                            </h1>
                            {pageInfo && (
                                <div className="flex items-center gap-1.5">
                                    <span className={`text-[10px] font-bold ${isDarkReading ? 'text-gray-400' : 'text-[var(--color-text-tertiary)]'}`}>
                                        الجزء {pageInfo.juz}
                                    </span>
                                    <span className={`text-[8px] ${isDarkReading ? 'text-gray-600' : 'text-[var(--color-border)]'}`}>•</span>
                                    <span className={`text-[10px] font-bold ${isDarkReading ? 'text-gray-400' : 'text-[var(--color-text-tertiary)]'}`}>
                                        ص {pageNumber}
                                    </span>
                                    <span className={`text-[8px] ${isDarkReading ? 'text-gray-600' : 'text-[var(--color-border)]'}`}>•</span>
                                    <span className="text-[10px] font-bold text-[var(--color-accent)]">
                                        {progressPercent}%
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Right: Quick Actions */}
                        <div className="flex items-center gap-0.5">
                            {/* Bookmark */}
                            <button
                                onClick={toggleBookmark}
                                className={`p-2 rounded-lg transition-all active:scale-90 ${isCurrentPageBookmarked
                                    ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10'
                                    : isDarkReading ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] hover:bg-black/5'
                                    }`}
                            >
                                {isCurrentPageBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                            </button>

                            {/* Reading Mode */}
                            <button
                                onClick={() => {
                                    const modes = Object.keys(READING_MODES);
                                    const idx = modes.indexOf(readingMode);
                                    setReadingMode(modes[(idx + 1) % modes.length]);
                                }}
                                className={`p-2 rounded-lg transition-all active:scale-90 ${isDarkReading ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] hover:bg-black/5'}`}
                            >
                                {React.createElement(READING_MODES[readingMode].icon, { size: 18 })}
                            </button>

                            {/* Fullscreen */}
                            <button
                                onClick={() => setIsFullscreen(prev => !prev)}
                                className={`p-2 rounded-lg transition-all active:scale-90 ${isDarkReading ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] hover:bg-black/5'}`}
                            >
                                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                            </button>

                            {/* View Mode Toggle */}
                            <button
                                onClick={() => setViewMode(prev => prev === 'image' ? 'text' : 'image')}
                                className={`p-2 rounded-lg transition-all active:scale-90 ${viewMode === 'text'
                                    ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10'
                                    : isDarkReading ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] hover:bg-black/5'
                                    }`}
                                title={viewMode === 'image' ? 'الوضع النصي' : 'عرض الصور'}
                            >
                                {viewMode === 'image' ? <Type size={18} /> : <BookOpen size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* MAIN MUSHAF CONTENT */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div
                className={`max-w-[900px] mx-auto ${isFullscreen ? 'p-0 h-full flex items-center justify-center' : 'p-3 md:p-6'}`}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    ref={pageContentRef}
                    className={`relative w-full overflow-hidden transition-all duration-500 ${isFullscreen ? 'h-full rounded-none shadow-none' : 'rounded-lg shadow-2xl'}`}
                    style={{
                        backgroundColor: getReadingModeBg(),
                        minHeight: isFullscreen ? '100%' : '70vh',
                    }}
                >
                    {/* Decorative Frame */}
                    {!isFullscreen && (
                        <>
                            <div className="absolute inset-3 md:inset-4 border-2 opacity-40 pointer-events-none z-20 rounded-sm"
                                style={{ borderColor: isDarkReading ? 'rgba(201,162,39,0.3)' : 'rgba(0,0,0,0.1)' }} />
                            <div className="absolute inset-5 md:inset-6 border opacity-20 pointer-events-none z-20 rounded-sm"
                                style={{ borderColor: isDarkReading ? 'rgba(201,162,39,0.2)' : 'var(--color-accent)' }} />
                            <FrameCorner className={`absolute top-3 left-3 w-10 h-10 md:w-16 md:h-16 z-20 ${isDarkReading ? 'text-[#C9A227]/40' : 'text-[var(--color-accent)]'}`} />
                            <FrameCorner className={`absolute top-3 right-3 w-10 h-10 md:w-16 md:h-16 z-20 transform scale-x-[-1] ${isDarkReading ? 'text-[#C9A227]/40' : 'text-[var(--color-accent)]'}`} />
                            <FrameCorner className={`absolute bottom-3 left-3 w-10 h-10 md:w-16 md:h-16 z-20 transform scale-y-[-1] ${isDarkReading ? 'text-[#C9A227]/40' : 'text-[var(--color-accent)]'}`} />
                            <FrameCorner className={`absolute bottom-3 right-3 w-10 h-10 md:w-16 md:h-16 z-20 transform rotate-180 ${isDarkReading ? 'text-[#C9A227]/40' : 'text-[var(--color-accent)]'}`} />
                        </>
                    )}

                    {/* Page Content */}
                    <div className={`relative z-10 w-full ${isFullscreen ? 'p-2 md:p-4' : 'p-6 md:p-12'}`}>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-32 space-y-6">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full border-4 border-[var(--color-accent)]/20 border-t-[var(--color-accent)] animate-spin" />
                                    <BookOpen className="absolute inset-0 m-auto w-6 h-6 text-[var(--color-accent)]" />
                                </div>
                                <p className={`font-arabic text-sm ${isDarkReading ? 'text-gray-400' : 'text-[var(--color-text-tertiary)]'}`}>
                                    جاري تحميل الصفحة...
                                </p>
                            </div>
                        ) : (
                            <>
                                {viewMode === 'text' ? (
                                    // TEXT MODE: Continuous paragraph flow
                                    <div
                                        className={`transition-all duration-400 ${slideDirection === 'left' ? 'animate-slide-in-left' : slideDirection === 'right' ? 'animate-slide-in-right' : 'animate-fade-in'}`}
                                    >
                                        {/* Basmala */}
                                        {pageInfo && pageInfo.firstVerse === 1 && pageInfo.surahNumber !== 1 && pageInfo.surahNumber !== 9 && (
                                            <div className={`text-center mb-8 text-3xl md:text-4xl font-arabic ${isDarkReading ? 'text-[#C9A227]/60' : 'text-[var(--color-highlight)]/60'}`} dir="rtl">
                                                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                                            </div>
                                        )}

                                        {/* Continuous Text Paragraph */}
                                        <div
                                            className={`font-arabic text-3xl md:text-5xl leading-[3.5rem] md:leading-[5rem] text-justify rtl ${isDarkReading ? 'text-white' : 'text-[var(--color-text-primary)]'}`}
                                            dir="rtl"
                                        >
                                            {textAyahs.map((ayah, idx) => (
                                                <React.Fragment key={ayah.number}>
                                                    <span className="inline hover:text-[var(--color-accent)] transition-colors duration-300 cursor-pointer">
                                                        {/* Handle Basmala */}
                                                        {(pageInfo && pageInfo.firstVerse === 1 && pageInfo.surahNumber !== 1 && pageInfo.surahNumber !== 9 && idx === 0)
                                                            ? ayah.text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ', '').trim()
                                                            : ayah.text}
                                                    </span>
                                                    <span className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 mx-3 translate-y-1 select-none relative shrink-0">
                                                        <span className={`absolute font-ui text-xs md:text-sm font-bold ${isDarkReading ? 'text-[#C9A227]' : 'text-[var(--color-highlight)]'}`}>
                                                            {ayah.numberInSurah}
                                                        </span>
                                                        <svg viewBox="0 0 100 100" className={`w-full h-full ${isDarkReading ? 'text-gray-600' : 'text-[var(--color-border)]'} opacity-40`}>
                                                            <path d="M50 5 L95 50 L50 95 L5 50 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                                                            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
                                                        </svg>
                                                    </span>
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    // IMAGE MODE: Verse images
                                    <div
                                        className={`transition-all duration-400 leading-[0] text-[0] ${slideDirection === 'left' ? 'animate-slide-in-left' : slideDirection === 'right' ? 'animate-slide-in-right' : 'animate-fade-in'}`}
                                    >
                                        {verses.map((verse, idx) => {
                                            const imageUrl = verse.image_url || (verse.image && verse.image.url);
                                            if (!imageUrl) return null;
                                            return (
                                                <img
                                                    key={verse.id || idx}
                                                    src={imageUrl}
                                                    alt={`Verse ${verse.verse_key}`}
                                                    className={`w-full h-auto object-contain block m-0 p-0 border-0 transition-all duration-500 ${isDarkReading ? 'invert brightness-90 hue-rotate-180' : ''} ${readingMode === 'sepia' ? 'contrast-[1.05]' : ''}`}
                                                    style={{ display: 'block', margin: 0, padding: 0, lineHeight: 0 }}
                                                    loading="eager"
                                                    draggable={false}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Page Number Watermark */}
                    <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 z-30 font-ui text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm ${isDarkReading ? 'text-gray-500 bg-white/5' : 'text-[var(--color-text-tertiary)] bg-black/5'}`}>
                        {pageNumber}
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* BOTTOM NAVIGATION BAR - Always Visible, Prominent */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div
                className={`${isFullscreen ? 'fixed bottom-0 left-0 right-0' : 'fixed bottom-16 left-0 right-0'} z-[500] transition-all duration-500 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
            >
                <div className="max-w-[900px] mx-auto px-3">
                    <div
                        className="rounded-2xl backdrop-blur-2xl border shadow-2xl overflow-hidden"
                        style={{
                            backgroundColor: isDarkReading ? 'rgba(20,20,40,0.95)' : 'rgba(255,255,255,0.95)',
                            borderColor: isDarkReading ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                            boxShadow: isDarkReading ? '0 -4px 30px rgba(0,0,0,0.5)' : '0 -4px 30px rgba(0,0,0,0.1)',
                        }}
                    >
                        {/* Page Slider */}
                        <div className="px-4 pt-3 pb-1">
                            <div className="flex items-center gap-3" dir="ltr">
                                <span className={`text-[10px] font-bold w-6 text-center tabular-nums ${isDarkReading ? 'text-gray-500' : 'text-[var(--color-text-tertiary)]'}`}>1</span>
                                <div className="flex-1 relative">
                                    <input
                                        type="range"
                                        min="1"
                                        max="604"
                                        value={pageNumber}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setPageNumber(val);
                                        }}
                                        onMouseUp={() => setSlideDirection(null)}
                                        onTouchEnd={() => setSlideDirection(null)}
                                        className="w-full h-2 rounded-full appearance-none cursor-pointer mushaf-slider"
                                        style={{
                                            background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${progressPercent}%, ${isDarkReading ? '#2a2a4a' : '#e8e8e8'} ${progressPercent}%, ${isDarkReading ? '#2a2a4a' : '#e8e8e8'} 100%)`,
                                        }}
                                    />
                                </div>
                                <span className={`text-[10px] font-bold w-8 text-center tabular-nums ${isDarkReading ? 'text-gray-500' : 'text-[var(--color-text-tertiary)]'}`}>604</span>
                            </div>
                        </div>

                        {/* Main Navigation Row */}
                        <div className="flex items-center justify-between px-2 py-2 gap-1">
                            {/* Previous Page Button */}
                            <button
                                onClick={handlePrev}
                                disabled={pageNumber <= 1}
                                className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all active:scale-90 disabled:opacity-20 ${isDarkReading
                                    ? 'bg-white/5 text-white hover:bg-white/10'
                                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent)] hover:text-white'
                                    }`}
                            >
                                <ChevronRight size={22} />
                            </button>

                            {/* Center Navigation Buttons */}
                            <div className="flex items-center gap-1 flex-1 justify-center">
                                {/* Surah Navigator */}
                                <button
                                    onClick={() => { setShowNavPanel(true); setNavTab('surah'); }}
                                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${isDarkReading
                                        ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                                        : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent)]/10'
                                        }`}
                                >
                                    <BookOpen size={15} />
                                    <span className="font-arabic">السور</span>
                                </button>

                                {/* Juz Navigator */}
                                <button
                                    onClick={() => { setShowNavPanel(true); setNavTab('juz'); }}
                                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${isDarkReading
                                        ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                                        : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent)]/10'
                                        }`}
                                >
                                    <Layers size={15} />
                                    <span className="font-arabic">الأجزاء</span>
                                </button>

                                {/* Page Jump */}
                                <button
                                    onClick={() => { setShowNavPanel(true); setNavTab('page'); }}
                                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${isDarkReading
                                        ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                                        : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent)]/10'
                                        }`}
                                >
                                    <Hash size={15} />
                                    <span className="font-arabic">صفحة</span>
                                </button>

                                {/* Bookmarks */}
                                {bookmarkedPages.length > 0 && (
                                    <button
                                        onClick={() => { setShowNavPanel(true); setNavTab('bookmarks'); }}
                                        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${isDarkReading
                                            ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'
                                            : 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                                            }`}
                                    >
                                        <BookMarked size={15} />
                                        <span className="font-arabic">{bookmarkedPages.length}</span>
                                    </button>
                                )}
                            </div>

                            {/* Next Page Button */}
                            <button
                                onClick={handleNext}
                                disabled={pageNumber >= 604}
                                className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all active:scale-90 disabled:opacity-20 ${isDarkReading
                                    ? 'bg-white/5 text-white hover:bg-white/10'
                                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent)] hover:text-white'
                                    }`}
                            >
                                <ChevronLeft size={22} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* NAVIGATION PANEL (Full-screen slide-up) */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {showNavPanel && (
                <div className="fixed inset-0 z-[9999] flex items-end justify-center" onClick={() => setShowNavPanel(false)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div
                        className="relative w-full max-w-lg rounded-t-3xl overflow-hidden animate-slide-up"
                        style={{
                            backgroundColor: isDarkReading ? '#1A1A2E' : '#FDFCFA',
                            maxHeight: '80vh',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Panel Header with Tabs */}
                        <div className="sticky top-0 z-10 border-b"
                            style={{ borderColor: isDarkReading ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>

                            {/* Close + Title */}
                            <div className="flex items-center justify-between px-5 pt-4 pb-2">
                                <h2 className={`font-arabic font-bold text-lg ${isDarkReading ? 'text-white' : 'text-[var(--color-text-primary)]'}`}>
                                    التنقل
                                </h2>
                                <button
                                    onClick={() => setShowNavPanel(false)}
                                    className={`p-2 rounded-full transition-all active:scale-90 ${isDarkReading ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-black/5 text-[var(--color-text-tertiary)]'}`}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Tab Buttons */}
                            <div className="flex px-4 gap-1 pb-2">
                                {[
                                    { id: 'surah', label: 'السور', icon: BookOpen },
                                    { id: 'juz', label: 'الأجزاء', icon: Layers },
                                    { id: 'page', label: 'صفحة', icon: Hash },
                                    ...(bookmarkedPages.length > 0 ? [{ id: 'bookmarks', label: 'العلامات', icon: BookMarked }] : []),
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setNavTab(tab.id)}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold font-arabic transition-all ${navTab === tab.id
                                            ? 'bg-[var(--color-accent)] text-white shadow-md'
                                            : isDarkReading
                                                ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent)]/10'
                                            }`}
                                    >
                                        <tab.icon size={14} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Search Bar (for Surah tab) */}
                            {navTab === 'surah' && (
                                <div className="px-4 pb-3">
                                    <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 border ${isDarkReading ? 'bg-white/5 border-white/10' : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border)]'}`}>
                                        <Search size={16} className={isDarkReading ? 'text-gray-500' : 'text-[var(--color-text-tertiary)]'} />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="ابحث عن سورة..."
                                            className={`flex-1 bg-transparent text-sm font-arabic focus:outline-none ${isDarkReading ? 'text-white placeholder-gray-500' : 'text-[var(--color-text-primary)]'}`}
                                            autoFocus
                                        />
                                        {searchQuery && (
                                            <button onClick={() => setSearchQuery('')} className="text-[var(--color-text-tertiary)]">
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Panel Content */}
                        <div className="overflow-y-auto" style={{ maxHeight: '55vh' }}>

                            {/* ── SURAH TAB ── */}
                            {navTab === 'surah' && (
                                <div className="p-3 space-y-1">
                                    {filteredSurahs.map(({ name, number }) => {
                                        const pages = surahPageMapping[number];
                                        const isCurrentSurah = pageInfo && pageInfo.surahNumber === number;
                                        return (
                                            <button
                                                key={number}
                                                onClick={() => navigateTo(pages.start, pages.start > pageNumber ? 'left' : 'right')}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-[0.98] ${isCurrentSurah
                                                    ? 'bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30'
                                                    : isDarkReading
                                                        ? 'hover:bg-white/5'
                                                        : 'hover:bg-[var(--color-bg-secondary)]'
                                                    }`}
                                            >
                                                {/* Number Badge */}
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${isCurrentSurah
                                                    ? 'bg-[var(--color-accent)] text-white'
                                                    : isDarkReading ? 'bg-white/10 text-gray-300' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]'
                                                    }`}>
                                                    {number}
                                                </div>

                                                {/* Surah Name */}
                                                <div className="flex-1 text-right">
                                                    <span className={`font-arabic font-bold text-sm ${isCurrentSurah ? 'text-[var(--color-accent)]' : isDarkReading ? 'text-white' : 'text-[var(--color-text-primary)]'}`}>
                                                        {name}
                                                    </span>
                                                </div>

                                                {/* Page Range */}
                                                <span className={`text-[10px] font-bold tabular-nums ${isDarkReading ? 'text-gray-500' : 'text-[var(--color-text-tertiary)]'}`}>
                                                    ص {pages.start}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* ── JUZ TAB ── */}
                            {navTab === 'juz' && (
                                <div className="p-4 grid grid-cols-5 gap-2">
                                    {JUZ_PAGES.map(({ juz, page }) => {
                                        const isCurrentJuzItem = currentJuz === juz;
                                        return (
                                            <button
                                                key={juz}
                                                onClick={() => navigateTo(page, page > pageNumber ? 'left' : 'right')}
                                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all active:scale-90 ${isCurrentJuzItem
                                                    ? 'bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent)]/25'
                                                    : isDarkReading
                                                        ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                                                        : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent)]/10 hover:border-[var(--color-accent)]/20'
                                                    } border border-transparent`}
                                            >
                                                <span className="font-arabic font-bold text-base">{juz}</span>
                                                <span className={`text-[9px] font-bold ${isCurrentJuzItem ? 'text-white/70' : isDarkReading ? 'text-gray-500' : 'text-[var(--color-text-tertiary)]'}`}>
                                                    ص {page}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* ── PAGE TAB ── */}
                            {navTab === 'page' && (
                                <div className="p-5 space-y-6">
                                    {/* Current Page Display */}
                                    <div className="text-center space-y-2">
                                        <span className={`text-6xl font-bold tabular-nums ${isDarkReading ? 'text-white' : 'text-[var(--color-text-primary)]'}`}>
                                            {pageNumber}
                                        </span>
                                        <p className={`text-xs font-arabic ${isDarkReading ? 'text-gray-400' : 'text-[var(--color-text-tertiary)]'}`}>
                                            الصفحة الحالية من 604
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
                                            className={`flex-1 text-center rounded-xl px-4 py-3 text-lg font-bold border focus:outline-none focus:border-[var(--color-accent)] transition-colors font-arabic ${isDarkReading
                                                ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                                                : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border)] text-[var(--color-text-primary)]'
                                                }`}
                                            autoFocus
                                        />
                                        <button
                                            type="submit"
                                            className="px-6 py-3 rounded-xl bg-[var(--color-accent)] text-white font-arabic font-bold active:scale-95 transition-transform"
                                        >
                                            انتقل
                                        </button>
                                    </form>

                                    {/* Quick Page Jumps */}
                                    <div className="grid grid-cols-4 gap-2">
                                        {[1, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 604].map(p => (
                                            <button
                                                key={p}
                                                onClick={() => navigateTo(p, p > pageNumber ? 'left' : 'right')}
                                                className={`py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${p === pageNumber
                                                    ? 'bg-[var(--color-accent)] text-white'
                                                    : isDarkReading
                                                        ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                                                        : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent)]/10'
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
                                <div className="p-3 space-y-1">
                                    {bookmarkedPages.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Bookmark size={40} className={`mx-auto mb-3 ${isDarkReading ? 'text-gray-600' : 'text-[var(--color-text-tertiary)]'}`} />
                                            <p className={`font-arabic text-sm ${isDarkReading ? 'text-gray-400' : 'text-[var(--color-text-tertiary)]'}`}>
                                                لا توجد علامات مرجعية
                                            </p>
                                        </div>
                                    ) : (
                                        bookmarkedPages.map(p => (
                                            <div key={p} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${p === pageNumber
                                                ? 'bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30'
                                                : isDarkReading ? 'hover:bg-white/5' : 'hover:bg-[var(--color-bg-secondary)]'
                                                }`}>
                                                <button
                                                    onClick={() => navigateTo(p, p > pageNumber ? 'left' : 'right')}
                                                    className="flex-1 flex items-center gap-3"
                                                >
                                                    <BookmarkCheck size={18} className="text-[var(--color-accent)]" />
                                                    <span className={`font-arabic font-bold text-sm ${isDarkReading ? 'text-white' : 'text-[var(--color-text-primary)]'}`}>
                                                        صفحة {p}
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => setBookmarkedPages(prev => prev.filter(bp => bp !== p))}
                                                    className={`p-1.5 rounded-lg transition-all active:scale-90 ${isDarkReading ? 'hover:bg-white/10 text-gray-500' : 'hover:bg-red-50 text-red-400'}`}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Custom animations & styles */}
            <style>{`
                @keyframes slide-in-left {
                    from { opacity: 0; transform: translateX(-30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes slide-in-right {
                    from { opacity: 0; transform: translateX(30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-in-left { animation: slide-in-left 0.35s ease-out; }
                .animate-slide-in-right { animation: slide-in-right 0.35s ease-out; }
                .animate-slide-up { animation: slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1); }

                /* Mushaf slider thumb */
                .mushaf-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: var(--color-accent);
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
                    border: 3px solid white;
                    transition: transform 0.15s;
                }
                .mushaf-slider::-webkit-slider-thumb:active {
                    transform: scale(1.2);
                }
                .mushaf-slider::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: var(--color-accent);
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
                    border: 3px solid white;
                }
            `}</style>
        </div>
    );
};

export default MushafPage;
