import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BookOpen, ChevronRight, ChevronLeft, Search, Loader2, Bookmark, BookmarkCheck, Maximize2, Minimize2, Sun, Moon, Coffee, Layers, X, BookMarked, Hash, List, Type, Home } from 'lucide-react';
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
    light: { bg: '#FDFCFA', text: '#2C2C2C', accent: '#8B7355', label: 'فاتح', icon: Sun },
    sepia: { bg: '#F4ECD8', text: '#433422', accent: '#A67C52', label: 'ورقي', icon: Coffee },
    dark: { bg: '#121212', text: '#E0E0E0', accent: '#C9A227', label: 'داكن', icon: Moon },
    midnight: { bg: '#0A0E17', text: '#D1D5DB', accent: '#60A5FA', label: 'ليلي', icon: Layers },
};

const MushafPage = ({ onBack }) => {
    // Core state
    const [pageNumber, setPageNumber] = useState(() => {
        const saved = localStorage.getItem('mushaf-last-page');
        return saved ? parseInt(saved) : 1;
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isFontLoading, setIsFontLoading] = useState(true);
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
    const [viewMode, setViewMode] = useState('text'); // 'image' or 'text'
    const [textAyahs, setTextAyahs] = useState([]);

    // Navigation panel state
    const [showNavPanel, setShowNavPanel] = useState(false);
    const [navTab, setNavTab] = useState('surah'); // 'surah', 'juz', 'page', 'bookmarks'
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocusMode, setIsFocusMode] = useState(false);

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

    // Dynamic Font Loading for QPC V2 with Preloading
    useEffect(() => {
        setIsFontLoading(true);
        const loadFont = async (pn) => {
            const fontName = `p${pn}-v2`;
            const fontUrl = `https://static-cdn.tarteel.ai/qul/fonts/quran_fonts/v2/woff2/p${pn}.woff2`;

            if (!document.getElementById(`font-${fontName}`)) {
                const style = document.createElement('style');
                style.id = `font-${fontName}`;
                style.innerHTML = `
                    @font-face {
                        font-family: '${fontName}';
                        src: url('${fontUrl}') format('woff2');
                        font-display: optional;
                    }
                `;
                document.head.appendChild(style);

                // Preload the font using Font Loading API
                try {
                    const font = new FontFace(fontName, `url('${fontUrl}')`);
                    await font.load();
                    document.fonts.add(font);
                } catch (err) {
                    console.warn(`Failed to preload font ${fontName}:`, err);
                }
            }
        };

        // Load fonts in parallel for better performance
        const fontsToLoad = [pageNumber];
        if (pageNumber < 604) fontsToLoad.push(pageNumber + 1);
        if (pageNumber > 1) fontsToLoad.push(pageNumber - 1);

        Promise.all(fontsToLoad.map(loadFont))
            .then(() => setIsFontLoading(false))
            .catch(err => {
                console.warn('Some fonts failed to load:', err);
                setIsFontLoading(false);
            });
    }, [pageNumber]);

    // Fetch page data
    useEffect(() => {
        let isCancelled = false;
        const fetchMushafPage = async () => {
            setIsLoading(true);
            try {
                const data = await quranAPI.getMushafPage(pageNumber);
                if (!isCancelled && data) {
                    setVerses(data);

                    // Calculate page metadata from verses
                    const firstAyah = data[0];
                    const lastAyah = data[data.length - 1];
                    const surahs = await quranAPI.getAllSurahs();
                    const getSurahName = (num) => surahs.find(s => s.number === num)?.name || `Surah ${num}`;
                    const getSurahEnglish = (num) => surahs.find(s => s.number === num)?.transliteration || `Surah ${num}`;

                    const surahsOnPage = [...new Set(data.map(v => getSurahName(v.surah.number)))];

                    setPageInfo({
                        surah: getSurahName(firstAyah.surah.number),
                        surahEnglish: getSurahEnglish(firstAyah.surah.number),
                        surahNumber: firstAyah.surah.number,
                        juz: firstAyah.juz,
                        number: pageNumber,
                        surahsOnPage,
                        firstVerse: firstAyah.numberInSurah,
                        lastVerse: lastAyah.numberInSurah,
                        lastSurah: getSurahName(lastAyah.surah.number),
                    });

                    // Save text ayahs for text mode (Paragraph mode)
                    // Map SDK verse results to match expected structure for Paragraph rendering
                    const textAyahsFormatted = data.map(v => ({
                        ...v,
                        numberInSurah: v.numberInSurah,
                        surah: {
                            number: v.surah.number,
                            name: getSurahName(v.surah.number)
                        }
                    }));
                    setTextAyahs(textAyahsFormatted);
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
                const data = await quranAPI.getMushafPage(pn);
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

        // Only auto-hide in fullscreen mode, and give more time (8s)
        if (isFullscreen) {
            controlsTimeout.current = setTimeout(() => {
                setShowControls(false);
            }, 8000);
        }
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
    const mode = READING_MODES[readingMode] || READING_MODES.light;
    const isDarkMode = readingMode === 'dark' || readingMode === 'midnight';
    const progressPercent = ((pageNumber / 604) * 100).toFixed(1);

    // Filter surahs by search
    const filteredSurahs = SURAH_NAMES.map((name, idx) => ({ name, number: idx + 1 }))
        .filter(s => searchQuery === '' || s.name.includes(searchQuery) || s.number.toString().includes(searchQuery));

    // Find current juz
    const currentJuz = JUZ_PAGES.reduce((acc, j) => pageNumber >= j.page ? j.juz : acc, 1);

    return (
        <div
            ref={containerRef}
            className={`min-h-screen relative overflow-hidden transition-all duration-700 ${isFullscreen ? 'fixed inset-0 z-[9999]' : ''}`}
            style={{
                backgroundColor: mode.bg,
                color: mode.text
            }}
            dir="rtl"
            onClick={() => {
                if (isFullscreen) setShowControls(prev => !prev);
            }}
        >
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* FLOATING HEADER BAR (Glassmorphism) */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <header
                className={`fixed top-4 left-1/2 -translate-x-1/2 z-[600] w-[92%] max-w-[800px] transition-all duration-700 ease-in-out ${showControls ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-24 opacity-0 scale-95 pointer-events-none'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="relative overflow-hidden rounded-2xl border shadow-2xl"
                    style={{
                        backgroundColor: readingMode === 'dark' || readingMode === 'midnight' ? '#1E1E28' : '#FFFFFF',
                        borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    }}
                >
                    {/* Progress indicator line */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/5">
                        <div
                            className="h-full transition-all duration-700 ease-out"
                            style={{
                                width: `${progressPercent}%`,
                                backgroundColor: mode.accent,
                                boxShadow: `0 0 8px ${mode.accent}`
                            }}
                        />
                    </div>

                    <div className="px-5 py-3 flex items-center justify-between gap-4">
                        {/* Exit/Home Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onBack) onBack();
                            }}
                            className="p-2.5 rounded-xl transition-all hover:bg-white/10 active:scale-90"
                            title="الرئيسية"
                        >
                            <Home size={20} />
                        </button>

                        {/* Info Section */}
                        <div className="flex flex-col min-w-0 mr-auto">
                            <div className="flex items-center gap-2">
                                <h1 className="font-arabic font-bold text-lg truncate tracking-wide">
                                    {pageInfo ? pageInfo.surah : 'المصحف'}
                                </h1>
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 font-bold opacity-60">
                                    {pageNumber}
                                </span>
                            </div>
                            {pageInfo && (
                                <div className="flex items-center gap-1.5 opacity-60 text-[10px] font-medium">
                                    <span>الجزء {pageInfo.juz}</span>
                                    <span className="w-1 h-1 rounded-full bg-current opacity-30" />
                                    <span>{pageInfo.surahEnglish}</span>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                            {/* Bookmark */}
                            <button
                                onClick={toggleBookmark}
                                className={`p-2.5 rounded-xl transition-all active:scale-90 ${isCurrentPageBookmarked
                                    ? 'shadow-[0_0_15px_rgba(201,162,39,0.3)]'
                                    : 'hover:bg-white/10'
                                    }`}
                                style={{ color: isCurrentPageBookmarked ? mode.accent : 'inherit' }}
                            >
                                {isCurrentPageBookmarked ? <BookmarkCheck size={20} fill="currentColor" fillOpacity={0.2} /> : <Bookmark size={20} />}
                            </button>

                            {/* Theme Toggle */}
                            <button
                                onClick={() => {
                                    const modes = Object.keys(READING_MODES);
                                    const idx = modes.indexOf(readingMode);
                                    setReadingMode(modes[(idx + 1) % modes.length]);
                                }}
                                className="p-2.5 rounded-xl transition-all hover:bg-white/5 active:scale-90"
                            >
                                {React.createElement(mode.icon, { size: 20 })}
                            </button>

                            {/* View Mode */}
                            <button
                                onClick={() => setViewMode(prev => prev === 'image' ? 'text' : 'image')}
                                className="p-2.5 rounded-xl transition-all hover:bg-white/5 active:scale-90"
                                title={viewMode === 'image' ? 'الوضع النصي' : 'عرض الصور'}
                            >
                                {viewMode === 'image' ? <Type size={20} /> : <BookOpen size={20} />}
                            </button>

                            {/* Fullscreen/Focus */}
                            <button
                                onClick={() => setIsFullscreen(prev => !prev)}
                                className="p-2.5 rounded-xl transition-all hover:bg-white/5 active:scale-90"
                            >
                                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* MAIN MUSHAF CONTENT */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <main
                className={`transition-all duration-700 ease-in-out ${isFullscreen ? 'h-screen pt-0' : 'min-h-screen pt-24 pb-32 flex items-center justify-center px-4'}`}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    ref={pageContentRef}
                    className={`relative w-full max-w-[800px] overflow-hidden transition-all duration-500 ${isFullscreen ? 'h-full' : ''}`}
                    style={{
                        backgroundColor: mode.bg,
                        minHeight: isFullscreen ? '100%' : '100%',
                    }}
                >
                    {/* Page Content - Full page reader style */}
                    <div className={`relative z-10 w-full flex flex-col justify-start items-center ${isFullscreen ? 'p-2 md:p-4 h-full' : 'py-4'}`}>
                        {isLoading || isFontLoading ? (
                            <div className="flex flex-col items-center justify-center py-40 space-y-8 animate-pulse">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full border-[3px] border-current opacity-20" />
                                    <div className="absolute inset-0 border-[3px] border-t-transparent animate-spin rounded-full" style={{ borderColor: mode.accent }} />
                                    <BookOpen className="absolute inset-0 m-auto w-8 h-8 opacity-40" />
                                </div>
                                <p className="font-arabic text-lg tracking-wide opacity-50">جاري التحميل...</p>
                            </div>
                        ) : (
                            <div className={`w-full flex-1 flex flex-col items-center justify-center transition-all duration-500 ${slideDirection === 'left' ? 'animate-slide-in-left' : slideDirection === 'right' ? 'animate-slide-in-right' : 'animate-fade-in'}`}>
                                {viewMode === 'text' ? (
                                    // MUSHAF READING MODE - Quran.com style: words grouped by line
                                    <div
                                        className="w-full flex flex-col items-center justify-start py-4 md:py-8 transition-all duration-500"
                                        style={{
                                            fontFamily: `p${pageNumber}-v2`,
                                            direction: 'rtl',
                                            minHeight: '100%',
                                        }}
                                    >
                                        {(() => {
                                            // Collect all words from all verses and group by lineNumber
                                            const lineMap = new Map();
                                            // Track first verse of surah lines for centering
                                            const firstVerseLines = new Set();
                                            // Track surahs on this page for displaying surah names
                                            const surahsOnPage = new Map(); // surahNumber -> { name, firstLineNum }

                                            verses.forEach(verse => {
                                                const isFirstVerse = verse.numberInSurah === 1 || verse.verseNumber === 1;
                                                const surahNum = verse.surah.number;
                                                // Get surah name from textAyahs (SDK data with proper glyphs)
                                                const surahName = textAyahs.find(t => t.surah.number === surahNum)?.surah?.name || SURAH_NAMES[surahNum - 1] || `Surah ${surahNum}`;

                                                if (isFirstVerse && !surahsOnPage.has(surahNum)) {
                                                    surahsOnPage.set(surahNum, { name: surahName, firstLineNum: null });
                                                }

                                                if (verse.words && verse.words.length > 0) {
                                                    verse.words.forEach(word => {
                                                        const lineNum = word.line_number || word.lineNumber || 1;
                                                        if (!lineMap.has(lineNum)) lineMap.set(lineNum, []);
                                                        lineMap.get(lineNum).push(word);
                                                        if (isFirstVerse) {
                                                            firstVerseLines.add(lineNum);
                                                            // Update the first line number for this surah
                                                            if (surahsOnPage.has(surahNum)) {
                                                                const surahInfo = surahsOnPage.get(surahNum);
                                                                if (surahInfo.firstLineNum === null || lineNum < surahInfo.firstLineNum) {
                                                                    surahInfo.firstLineNum = lineNum;
                                                                }
                                                            }
                                                        }
                                                    });
                                                }
                                            });

                                            const lines = Array.from(lineMap.entries()).sort((a, b) => a[0] - b[0]);

                                            if (lines.length === 0) {
                                                return (
                                                    <div className="w-full text-center leading-[4.5rem] md:leading-[5.5rem]" style={{ color: mode.text }}>
                                                        {verses.map((verse, idx) => (
                                                            <span key={verse.id || idx} dangerouslySetInnerHTML={{ __html: verse.code_v2 }} className="inline" />
                                                        ))}
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div className="w-full flex flex-col" style={{ gap: '0.25rem' }}>
                                                    {lines.map(([lineNum, words]) => {
                                                        const isFirstSurahLine = firstVerseLines.has(lineNum);
                                                        // Check if this line is the start of a new surah
                                                        const surahStart = Array.from(surahsOnPage.entries()).find(([_, info]) => info.firstLineNum === lineNum);
                                                        const surahName = surahStart ? surahStart[1].name : null;

                                                        return (
                                                            <React.Fragment key={lineNum}>
                                                                {/* Display surah name before the first verse of each surah */}
                                                                {surahName && (
                                                                    <div className="w-full flex justify-center py-4">
                                                                        <div
                                                                            className="px-6 py-2 rounded-full text-center"
                                                                            style={{
                                                                                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                                                                color: mode.accent,
                                                                                border: `1px solid ${mode.accent}30`,
                                                                                fontFamily: `p${pageNumber}-v2`,
                                                                            }}
                                                                        >
                                                                            <span className="font-bold text-lg" dangerouslySetInnerHTML={{ __html: surahName }} />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div
                                                                    className={`w-full flex ${isFirstSurahLine ? 'justify-center' : 'justify-between'}`}
                                                                    style={{
                                                                        minHeight: '4rem',
                                                                        color: mode.text,
                                                                        lineHeight: 1,
                                                                    }}
                                                                >
                                                                    {/* Wrap words in centered inline container for proper centering */}
                                                                    <div
                                                                        className="flex items-baseline"
                                                                        style={{
                                                                            display: isFirstSurahLine ? 'inline-flex' : 'flex',
                                                                            width: isFirstSurahLine ? 'auto' : '100%',
                                                                            justifyContent: 'center',
                                                                        }}
                                                                    >
                                                                        {words.map((word, wIdx) => (
                                                                            <span
                                                                                key={`${lineNum}-${wIdx}`}
                                                                                dangerouslySetInnerHTML={{ __html: word.code_v2 || word.codeV2 || '' }}
                                                                                className="inline-block text-center select-none mushaf-word"
                                                                                style={{
                                                                                    marginLeft: word.char_type === 'end' ? '0.5rem' : '0',
                                                                                }}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                ) : (
                                    // MUSHAF IMAGE MODE - Quran.com style: words grouped by line with Mushaf styling
                                    <div
                                        className="w-full flex flex-col items-center justify-start py-4 md:py-8 transition-all duration-700"
                                        style={{
                                            fontFamily: `p${pageNumber}-v2`,
                                            direction: 'rtl',
                                        }}
                                    >
                                        {(() => {
                                            const lineMap = new Map();
                                            const firstVerseLines = new Set();
                                            // Track surahs on this page for displaying surah names
                                            const surahsOnPage = new Map(); // surahNumber -> { name, firstLineNum }

                                            verses.forEach(verse => {
                                                const isFirstVerse = verse.numberInSurah === 1 || verse.verseNumber === 1;
                                                const surahNum = verse.surah.number;
                                                // Get surah name from textAyahs (SDK data with proper glyphs)
                                                const surahName = textAyahs.find(t => t.surah.number === surahNum)?.surah?.name || SURAH_NAMES[surahNum - 1] || `Surah ${surahNum}`;

                                                if (isFirstVerse && !surahsOnPage.has(surahNum)) {
                                                    surahsOnPage.set(surahNum, { name: surahName, firstLineNum: null });
                                                }

                                                if (verse.words && verse.words.length > 0) {
                                                    verse.words.forEach(word => {
                                                        const lineNum = word.line_number || word.lineNumber || 1;
                                                        if (!lineMap.has(lineNum)) lineMap.set(lineNum, []);
                                                        lineMap.get(lineNum).push(word);
                                                        if (isFirstVerse) {
                                                            firstVerseLines.add(lineNum);
                                                            // Update the first line number for this surah
                                                            if (surahsOnPage.has(surahNum)) {
                                                                const surahInfo = surahsOnPage.get(surahNum);
                                                                if (surahInfo.firstLineNum === null || lineNum < surahInfo.firstLineNum) {
                                                                    surahInfo.firstLineNum = lineNum;
                                                                }
                                                            }
                                                        }
                                                    });
                                                }
                                            });

                                            const lines = Array.from(lineMap.entries()).sort((a, b) => a[0] - b[0]);

                                            if (lines.length === 0) {
                                                return (
                                                    <div className="w-full text-center leading-[4.5rem] md:leading-[5.5rem]" style={{ color: mode.text }}>
                                                        {verses.map((verse, idx) => (
                                                            <span key={verse.id || idx} dangerouslySetInnerHTML={{ __html: verse.code_v2 }} className="inline" />
                                                        ))}
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div className="w-full flex flex-col" style={{ gap: '0.25rem' }}>
                                                    {lines.map(([lineNum, words]) => {
                                                        const isFirstSurahLine = firstVerseLines.has(lineNum);
                                                        // Check if this line is the start of a new surah
                                                        const surahStart = Array.from(surahsOnPage.entries()).find(([_, info]) => info.firstLineNum === lineNum);
                                                        const surahName = surahStart ? surahStart[1].name : null;

                                                        return (
                                                            <React.Fragment key={lineNum}>
                                                                {/* Display surah name before the first verse of each surah */}
                                                                {surahName && (
                                                                    <div className="w-full flex justify-center py-4">
                                                                        <div
                                                                            className="px-6 py-2 rounded-full text-center"
                                                                            style={{
                                                                                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                                                                color: mode.accent,
                                                                                border: `1px solid ${mode.accent}30`,
                                                                                fontFamily: `p${pageNumber}-v2`,
                                                                            }}
                                                                        >
                                                                            <span className="font-bold text-lg" dangerouslySetInnerHTML={{ __html: surahName }} />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div
                                                                    className={`w-full flex items-baseline ${isFirstSurahLine ? 'justify-center' : 'justify-between'}`}
                                                                    style={{
                                                                        minHeight: '4rem',
                                                                        color: mode.text,
                                                                        lineHeight: 1,
                                                                        paddingLeft: isFirstSurahLine ? '2rem' : '0',
                                                                    }}
                                                                >
                                                                    {words.map((word, wIdx) => (
                                                                        <span
                                                                            key={`${lineNum}-${wIdx}`}
                                                                            dangerouslySetInnerHTML={{ __html: word.code_v2 || word.codeV2 || '' }}
                                                                            className="inline-block text-center select-none mushaf-word"
                                                                            style={{
                                                                                marginLeft: word.char_type === 'end' ? '0.5rem' : '0',
                                                                            }}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Subtle Page Footer */}
                    <div className="absolute bottom-4 left-0 right-0 z-30 flex items-center justify-center opacity-30 text-[10px] font-bold tracking-[0.2em]">
                        {pageNumber}
                    </div>
                </div>
            </main>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* FLOATING BOTTOM NAV BAR */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <nav
                className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[600] w-[94%] max-w-[800px] transition-all duration-700 ease-in-out ${showControls ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-32 opacity-0 scale-95 pointer-events-none'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="rounded-3xl border shadow-2xl overflow-hidden"
                    style={{
                        backgroundColor: readingMode === 'dark' || readingMode === 'midnight' ? '#14141E' : '#FFFFFF',
                        borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    }}
                >
                    {/* Compact Slider area */}
                    <div className="px-6 pt-4 pb-1">
                        <div className="flex items-center gap-4" dir="ltr">
                            <span className="text-[10px] font-bold opacity-30 w-4">1</span>
                            <div className="flex-1 relative group py-2">
                                <input
                                    type="range"
                                    min="1"
                                    max="604"
                                    value={pageNumber}
                                    onChange={(e) => setPageNumber(parseInt(e.target.value))}
                                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 mushaf-slider transition-all"
                                    style={{
                                        background: `linear-gradient(to right, ${mode.accent} 0%, ${mode.accent} ${progressPercent}%, rgba(255,255,255,0.1) ${progressPercent}%)`,
                                    }}
                                />
                            </div>
                            <span className="text-[10px] font-bold opacity-30 w-8">604</span>
                        </div>
                    </div>

                    {/* Navigation Buttons Row */}
                    <div className="flex items-center justify-between px-3 pb-3 pt-1 gap-2">
                        {/* Right/Next in Arabic */}
                        <button
                            onClick={handlePrev}
                            disabled={pageNumber <= 1}
                            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:bg-white/10 active:scale-90 disabled:opacity-10"
                        >
                            <ChevronRight size={26} />
                        </button>

                        {/* Navigation Groups */}
                        <div className={`flex items-center rounded-2xl p-1 gap-1 ${isDarkMode ? 'bg-white/10' : 'bg-black/5'}`}>
                            <button
                                onClick={() => { setShowNavPanel(true); setNavTab('surah'); }}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${navTab === 'surah' ? 'bg-white/10 text-white' : 'opacity-40 hover:opacity-100 hover:bg-white/5'}`}
                            >
                                <BookOpen size={16} />
                                <span className="font-arabic md:inline hidden">السور</span>
                            </button>

                            <button
                                onClick={() => { setShowNavPanel(true); setNavTab('juz'); }}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${navTab === 'juz' ? 'bg-white/10 text-white' : 'opacity-40 hover:opacity-100 hover:bg-white/5'}`}
                            >
                                <Layers size={16} />
                                <span className="font-arabic md:inline hidden">الأجزاء</span>
                            </button>

                            <button
                                onClick={() => { setShowNavPanel(true); setNavTab('page'); }}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${navTab === 'page' ? 'bg-white/10 text-white' : 'opacity-40 hover:opacity-100 hover:bg-white/5'}`}
                            >
                                <Hash size={16} />
                                <span className="font-arabic md:inline hidden">صفحة</span>
                            </button>

                            {bookmarkedPages.length > 0 && (
                                <button
                                    onClick={() => { setShowNavPanel(true); setNavTab('bookmarks'); }}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-[var(--color-accent)] animate-pulse"
                                    style={{ color: mode.accent }}
                                >
                                    <BookMarked size={16} />
                                    <span className="font-arabic">{bookmarkedPages.length}</span>
                                </button>
                            )}
                        </div>

                        {/* Left/Prev in Arabic */}
                        <button
                            onClick={handleNext}
                            disabled={pageNumber >= 604}
                            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:bg-white/10 active:scale-90 disabled:opacity-10"
                        >
                            <ChevronLeft size={26} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* NAVIGATION PANEL (Full-screen slide-up) */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {showNavPanel && (
                <div className="fixed inset-0 z-[9999] flex items-end justify-center" onClick={() => setShowNavPanel(false)}>
                    <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} />
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
                                                <Bookmark size={36} className={`${isDarkMode ? 'text-gray-600' : 'text-[var(--color-text-tertiary)]'}`} />
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
                                                        <BookmarkCheck size={18} className={p === pageNumber ? 'text-white' : 'text-[#A67C52]'} />
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`font-arabic font-bold text-sm block ${p === pageNumber ? 'text-white' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            صفحة {p}
                                                        </span>
                                                        {surahPageMapping && (
                                                            <span className={`text-[10px] ${p === pageNumber ? 'text-white/60' : isDarkMode ? 'text-gray-500' : 'text-[var(--color-text-tertiary)]'}`}>
                                                                سورة {Object.entries(surahPageMapping).find(([key, val]) => val.start <= p && val.end >= p)?.[1]?.name || ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={() => setBookmarkedPages(prev => prev.filter(bp => bp !== p))}
                                                    className={`p-2 rounded-lg transition-all active:scale-90 ${p === pageNumber ? 'hover:bg-white/20 text-white/70' : isDarkMode ? 'hover:bg-white/10 text-gray-500' : 'hover:bg-red-100 text-red-500'}`}
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
            )}

            {/* Custom animations & styles */}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slide-in-left {
                    from { opacity: 0; transform: translateX(-40px) scale(0.98); }
                    to { opacity: 1; transform: translateX(0) scale(1); }
                }
                @keyframes slide-in-right {
                    from { opacity: 0; transform: translateX(40px) scale(0.98); }
                    to { opacity: 1; transform: translateX(0) scale(1); }
                }
                @keyframes slide-up {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes pulse-subtle {
                    0%, 100% { opacity: 0.1; }
                    50% { opacity: 0.2; }
                }
                
                .animate-fade-in { animation: fade-in 1s cubic-bezier(0.4, 0, 0.2, 1); }
                .animate-slide-in-left { animation: slide-in-left 0.6s cubic-bezier(0.23, 1, 0.32, 1); }
                .animate-slide-in-right { animation: slide-in-right 0.6s cubic-bezier(0.23, 1, 0.32, 1); }
                .animate-slide-up { animation: slide-up 0.7s cubic-bezier(0.16, 1, 0.3, 1); }

                /* Premium Mushaf slider styling */
                .mushaf-slider {
                    -webkit-appearance: none;
                    background: transparent;
                }
                .mushaf-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: ${mode.accent};
                    cursor: pointer;
                    box-shadow: 0 0 20px ${mode.accent}44, 0 4px 12px rgba(0,0,0,0.4);
                    border: 3px solid rgba(255,255,255,0.9);
                    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    margin-top: -9px;
                }
                .mushaf-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.15);
                    box-shadow: 0 0 30px ${mode.accent}66, 0 6px 16px rgba(0,0,0,0.5);
                }
                .mushaf-slider::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 6px;
                    cursor: pointer;
                    border-radius: 3px;
                }
                .mushaf-slider::-moz-range-thumb {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: ${mode.accent};
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                    border: 3px solid white;
                }

                /* Hide scrollbar for nav panel */
                .nav-panel-scroll::-webkit-scrollbar {
                    display: none;
                }
                .nav-panel-scroll {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                /* Authentic Mushaf styling */
                .mushaf-word {
                    position: relative;
                    vertical-align: baseline;
                    /* Ensure words flow naturally like the printed Mushaf */
                    transition: opacity 0.2s ease;
                }
                .mushaf-word:hover {
                    opacity: 0.8;
                }

                /* Line container for Mushaf pages */
                .mushaf-line {
                    display: flex;
                    align-items: baseline;
                    justify-content: space-between;
                    width: 100%;
                    min-height: 4rem;
                    line-height: 1;
                }

                /* Page container for Mushaf layout */
                .mushaf-page {
                    font-family: inherit;
                    direction: rtl;
                    line-height: 1;
                    letter-spacing: 0;
                }
            `}</style>
        </div>
    );
};

export default MushafPage;
