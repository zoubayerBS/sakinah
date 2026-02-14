import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BookOpen, ChevronRight, ChevronLeft, Search, Loader2, Bookmark, BookmarkCheck, Maximize2, Minimize2, Sun, Moon, Coffee, Layers, X, BookMarked, Hash, List, Type, Home, Minus, Plus, ChevronDown, Check } from 'lucide-react';
import { quranAPI } from '../services/quran-api.js';
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

const toArabicIndicDigits = (value) => {
    const digits = String(value).split('');
    const map = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return digits.map((d) => (/\d/.test(d) ? map[Number(d)] : d)).join('');
};

const formatSurahTitle = (name) => {
    if (!name) return '';
    return name.startsWith('سورة') ? name : `سورة ${name}`;
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
    const [fontScale, setFontScale] = useState(() => {
        const saved = parseFloat(localStorage.getItem('mushaf-font-scale') || '1');
        return Number.isFinite(saved) ? saved : 1;
    });
    const [bookmarkedPages, setBookmarkedPages] = useState(() => {
        try { return JSON.parse(localStorage.getItem('mushaf-bookmarks') || '[]'); }
        catch { return []; }
    });
    const [slideDirection, setSlideDirection] = useState(null);
    const [viewMode] = useState('authentic'); // locked to authentic mode
    const [textAyahs, setTextAyahs] = useState([]);

    // Navigation panel state
    const [showNavPanel, setShowNavPanel] = useState(false);
    const [navTab, setNavTab] = useState('surah'); // 'surah', 'juz', 'page', 'bookmarks'
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocusMode, setIsFocusMode] = useState(false);

    // Ayah Selection & Tafsir state
    const [selectedVerseKey, setSelectedVerseKey] = useState(null);
    const [showVerseDetail, setShowVerseDetail] = useState(false);
    const [verseDetailLoading, setVerseDetailLoading] = useState(false);
    const [verseDetailData, setVerseDetailData] = useState(null);
    const [tafsirData, setTafsirData] = useState(null);
    const [tafsirList, setTafsirList] = useState([]);
    const [selectedTafsir, setSelectedTafsir] = useState(16); // Default: Al-Muyassar (Arabic ID)
    const [showTafsirSelect, setShowTafsirSelect] = useState(false);

    // Refs
    const containerRef = useRef(null);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const touchDeltaX = useRef(0);
    const isSwiping = useRef(false);
    const controlsTimeout = useRef(null);
    const pageContentRef = useRef(null);
    const surahNameMapRef = useRef(new Map());
    const scrollStyleRef = useRef(null);
    const showControlsRef = useRef(showControls);

    // Derived state
    const mode = READING_MODES[readingMode] || READING_MODES.light;
    const isDarkMode = readingMode === 'dark' || readingMode === 'midnight';
    const progressPercent = ((pageNumber / 604) * 100).toFixed(1);

    // Find current juz
    const currentJuz = JUZ_PAGES.reduce((acc, j) => pageNumber >= j.page ? j.juz : acc, 1);

    // Filter surahs by search
    const filteredSurahs = SURAH_NAMES.map((name, idx) => ({ name, number: idx + 1 }))
        .filter(s => searchQuery === '' || s.name.includes(searchQuery) || s.number.toString().includes(searchQuery));

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

    // Save font scale
    useEffect(() => {
        localStorage.setItem('mushaf-font-scale', fontScale.toString());
    }, [fontScale]);

    // Save bookmarks
    useEffect(() => {
        localStorage.setItem('mushaf-bookmarks', JSON.stringify(bookmarkedPages));
    }, [bookmarkedPages]);

    useEffect(() => {
        showControlsRef.current = showControls;
    }, [showControls]);

    // Dynamic Font Loading for QPC V2 with Preloading
    useEffect(() => {
        const fontName = `p${pageNumber}-v2`;
        const fontUrl = `https://static-cdn.tarteel.ai/qul/fonts/quran_fonts/v2/woff2/p${pageNumber}.woff2`;

        // Check if font is already loaded to avoid blinking
        if (document.fonts.check(`12px "${fontName}"`)) {
            setIsFontLoading(false);
        } else {
            setIsFontLoading(true);
        }

        const loadFont = async (pn) => {
            const fName = `p${pn}-v2`;
            const fUrl = `https://static-cdn.tarteel.ai/qul/fonts/quran_fonts/v2/woff2/p${pn}.woff2`;

            if (!document.getElementById(`font-${fName}`)) {
                const style = document.createElement('style');
                style.id = `font-${fName}`;
                style.innerHTML = `
                    @font-face {
                        font-family: '${fName}';
                        src: url('${fUrl}') format('woff2');
                        font-display: block;
                    }
                `;
                document.head.appendChild(style);

                try {
                    const font = new FontFace(fName, `url('${fUrl}')`);
                    await font.load();
                    document.fonts.add(font);
                } catch (err) {
                    console.warn(`Failed to preload font ${fName}:`, err);
                }
            }
        };

        // Load fonts in parallel
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

    // Lock page scrolling while on MushafPage
    useEffect(() => {
        if (!scrollStyleRef.current) {
            scrollStyleRef.current = {
                htmlOverflow: document.documentElement.style.overflow,
                htmlHeight: document.documentElement.style.height,
                htmlOverscrollY: document.documentElement.style.overscrollBehaviorY,
                bodyOverflow: document.body.style.overflow,
                bodyPosition: document.body.style.position,
                bodyTop: document.body.style.top,
                bodyLeft: document.body.style.left,
                bodyRight: document.body.style.right,
                bodyWidth: document.body.style.width,
                bodyHeight: document.body.style.height,
                bodyTouchAction: document.body.style.touchAction,
            };
        }

        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.height = '100%';
        document.documentElement.style.overscrollBehaviorY = 'none';
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = '0';
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.documentElement.style.overscrollBehaviorY = 'none';

        const allowScrollInNav = (target) => {
            if (!showNavPanel) return false;
            return Boolean(target.closest && target.closest('.nav-panel-scroll'));
        };

        const handleTouchMove = (e) => {
            if (!allowScrollInNav(e.target)) {
                e.preventDefault();
            }
        };

        const handleWheel = (e) => {
            if (!allowScrollInNav(e.target)) {
                e.preventDefault();
            }
        };

        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            if (scrollStyleRef.current) {
                document.documentElement.style.overflow = scrollStyleRef.current.htmlOverflow;
                document.documentElement.style.height = scrollStyleRef.current.htmlHeight;
                document.documentElement.style.overscrollBehaviorY = scrollStyleRef.current.htmlOverscrollY;
                document.body.style.overflow = scrollStyleRef.current.bodyOverflow;
                document.body.style.position = scrollStyleRef.current.bodyPosition;
                document.body.style.top = scrollStyleRef.current.bodyTop;
                document.body.style.left = scrollStyleRef.current.bodyLeft;
                document.body.style.right = scrollStyleRef.current.bodyRight;
                document.body.style.width = scrollStyleRef.current.bodyWidth;
                document.body.style.height = scrollStyleRef.current.bodyHeight;
                document.body.style.touchAction = scrollStyleRef.current.bodyTouchAction;
            }
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('wheel', handleWheel);
        };
    }, [showNavPanel]);

    // Helper to process page data
    const processPageData = async (data) => {
        setVerses(data);

        // Calculate page metadata from verses
        const firstAyah = data[0];
        const lastAyah = data[data.length - 1];
        const surahs = await quranAPI.getAllSurahs();
        const getSurahName = (num) => surahs.find(s => s.number === num)?.name || `Surah ${num}`;
        const getSurahEnglish = (num) => surahs.find(s => s.number === num)?.transliteration || `Surah ${num}`;
        surahNameMapRef.current = new Map(surahs.map(s => [s.number, s.name]));

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

        // Save text ayahs for text mode
        const textAyahsFormatted = data.map(v => ({
            ...v,
            numberInSurah: v.numberInSurah,
            surah: {
                number: v.surah.number,
                name: getSurahName(v.surah.number)
            }
        }));
        setTextAyahs(textAyahsFormatted);
    };

    // Fetch page data
    useEffect(() => {
        let isCancelled = false;

        const fetchMushafPage = async () => {
            // Check preloaded cache first to avoid loading state
            if (preloadedPages[pageNumber]) {
                await processPageData(preloadedPages[pageNumber]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const data = await quranAPI.getMushafPage(pageNumber);
                if (!isCancelled && data) {
                    await processPageData(data);
                }
            } catch (err) {
                console.error('Error fetching mushaf page:', err);
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        };

        fetchMushafPage();
        return () => { isCancelled = true; };
    }, [pageNumber]); // preloadedPages is stable or read from closure, but adding it might loop if not careful. 
    // Ideally we'd use a ref for cache, but here we trust the preload effect ran before.

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
    }, [pageNumber]); // Keep this separate

    // Update body background to match theme (fixes overscroll/rubber-banding color)
    useEffect(() => {
        document.body.style.backgroundColor = mode.bg;
        // Also meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', mode.bg);
        }
        return () => {
            document.body.style.backgroundColor = ''; // Cleanup? Optional, or reset to default
        };
    }, [mode.bg]);

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
            if (touchDeltaX.current < -threshold && pageNumber > 1) {
                navigateTo(pageNumber - 1, 'right');
            } else if (touchDeltaX.current > threshold && pageNumber < 604) {
                navigateTo(pageNumber + 1, 'left');
            }
        } else if (showControlsRef.current) {
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

    const handleVerseClick = useCallback(async (verseKey) => {
        if (!verseKey) return;

        setSelectedVerseKey(verseKey);
        setShowVerseDetail(true);
        setVerseDetailLoading(true);
        setVerseDetailData(null);
        setTafsirData(null);

        try {
            // Load available tafsirs if empty
            if (tafsirList.length === 0) {
                quranAPI.getAvailableTafsirs().then(list => {
                    if (list && list.length > 0) {
                        setTafsirList(list);
                    } else {
                        // Fallback if API fails or returns empty
                        setTafsirList([
                            { id: 999, name: 'التحرير والتنوير' },
                            { id: 16, name: 'التفسير الميسّر' },
                            { id: 14, name: 'تفسير ابن كثير' },
                            { id: 90, name: 'تفسير القرطبي' },
                            { id: 91, name: 'تفسير السعدي' },
                            { id: 94, name: 'تفسير البغوي' },
                            { id: 15, name: 'تفسير الطبري' },
                            { id: 93, name: 'التفسير الوسيط' }
                        ]);
                    }
                }).catch(() => {
                    // Fallback on error
                    setTafsirList([
                        { id: 999, name: 'التحرير والتنوير' },
                        { id: 16, name: 'التفسير الميسّر' },
                        { id: 14, name: 'تفسير ابن كثير' },
                        { id: 91, name: 'تفسير السعدي' },
                        { id: 15, name: 'تفسير الطبري' }
                    ]);
                });
            }

            const [info, tafsir] = await Promise.all([
                quranAPI.getVerseInfo(verseKey),
                quranAPI.getTafsir(verseKey, selectedTafsir)
            ]);
            setVerseDetailData(info);
            setTafsirData(tafsir);
        } catch (err) {
            console.error('Error fetching verse detail:', err);
        } finally {
            setVerseDetailLoading(false);
        }
    }, [selectedTafsir, tafsirList.length]);

    // Refetch Tafsir when selection changes
    useEffect(() => {
        if (showVerseDetail && selectedVerseKey) {
            setVerseDetailLoading(true);
            quranAPI.getTafsir(selectedVerseKey, selectedTafsir)
                .then(setTafsirData)
                .catch(console.error)
                .finally(() => setVerseDetailLoading(false));
        }
    }, [selectedTafsir]);

    return (
        <div
            ref={containerRef}
            className={`min-h-[100dvh] relative overflow-hidden transition-all duration-700 ${isFullscreen ? 'fixed inset-0 z-[9999]' : ''}`}
            style={{
                backgroundColor: mode.bg,
                color: mode.text,
                touchAction: viewMode === 'authentic' && !showNavPanel && !showVerseDetail ? 'pan-x' : 'auto',
                '--mushaf-scale': String(fontScale)
            }}
            dir="rtl"
            onClick={() => {
                if (showVerseDetail) {
                    setShowVerseDetail(false);
                    setSelectedVerseKey(null);
                } else {
                    setShowControls(prev => !prev);
                }
            }}
        >
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* MINIMAL FLOATING HEADER BAR */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <header
                className={`fixed top-6 left-1/2 -translate-x-1/2 z-[600] w-auto max-w-[94%] ${showControls ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0 pointer-events-none'}`}
                style={{
                    transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms cubic-bezier(0.22, 1, 0.36, 1)',
                    willChange: 'transform, opacity',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="flex items-center justify-between gap-4 pl-2 pr-4 py-2 rounded-full shadow-2xl border border-white/5"
                    style={{
                        backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                        boxShadow: isDarkMode ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.05)',
                    }}
                >
                    {/* Home / Back */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onBack) onBack();
                        }}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 active:scale-90"
                        style={{ color: mode.text }}
                    >
                        <Home size={20} />
                    </button>

                    {/* Title Info */}
                    <div className="flex flex-col items-center min-w-[100px]">
                        <h1 className="font-arabic font-bold text-base leading-tight" style={{ color: mode.text }}>
                            {pageInfo ? formatSurahTitle(pageInfo.surah) : 'المصحف'}
                        </h1>
                        {pageInfo && (
                            <span className="text-[9px] font-bold opacity-50" style={{ color: mode.text }}>
                                الجزء {pageInfo.juz} • {pageInfo.surahEnglish}
                            </span>
                        )}
                    </div>

                    {/* Actions Group */}
                    <div className="flex items-center gap-1">
                        {/* Bookmark */}
                        <button
                            onClick={toggleBookmark}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${isCurrentPageBookmarked ? '' : 'hover:bg-black/5'}`}
                            style={{ color: isCurrentPageBookmarked ? mode.accent : mode.text, opacity: isCurrentPageBookmarked ? 1 : 0.6 }}
                        >
                            {isCurrentPageBookmarked ? <BookmarkCheck size={18} fill="currentColor" /> : <Bookmark size={18} />}
                        </button>


                        {/* Theme Toggle */}
                        <button
                            onClick={() => {
                                const modes = Object.keys(READING_MODES);
                                const idx = modes.indexOf(readingMode);
                                setReadingMode(modes[(idx + 1) % modes.length]);
                            }}
                            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/5 active:scale-90 opacity-60 hover:opacity-100"
                            style={{ color: mode.text }}
                        >
                            {React.createElement(mode.icon, { size: 18 })}
                        </button>
                    </div>
                </div>
            </header>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* MAIN MUSHAF CONTENT */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <main
                className={`transition-all duration-700 ease-in-out ${isFullscreen ? 'h-screen pt-0' : 'min-h-[100dvh] -mt-4 pb-6 flex items-stretch justify-center px-3 md:px-6'}`}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    ref={pageContentRef}
                    className={`relative w-full max-w-4xl transition-all duration-500 ${isFullscreen ? 'h-full' : 'min-h-[100dvh]'} ${fontScale > 1 && viewMode === 'authentic' ? 'overflow-x-auto overflow-y-hidden' : 'overflow-hidden'}`}
                    style={{
                        backgroundColor: mode.bg,
                        minHeight: isFullscreen ? '100%' : '100%',
                        scrollbarWidth: fontScale > 1 && viewMode === 'authentic' ? 'none' : undefined,
                    }}
                >
                    {/* Page Header Labels (Mushaf style) */}
                    <div
                        className="absolute top-12 left-6 right-6 flex items-center justify-between text-[11px] font-bold opacity-70 pointer-events-none"
                        style={{ color: mode.text }}
                    >
                        <span
                            className="font-kfgqpc text-[20.8px]"
                            style={{ direction: 'rtl', textAlign: 'right' }}
                            aria-label={pageInfo ? pageInfo.surah : 'المصحف'}
                            title={pageInfo ? pageInfo.surah : 'المصحف'}
                        >
                            {pageInfo ? formatSurahTitle(pageInfo.surah) : 'المصحف'}
                        </span>
                        <span className="font-kfgqpc text-[18.2px]" style={{ direction: 'rtl', textAlign: 'left' }}>
                            {pageInfo ? `الجزء ${toArabicIndicDigits(pageInfo.juz)}` : ''}
                        </span>
                    </div>
                    {/* Page Content - Full page reader style */}
                    <div className={`relative z-10 w-full flex-1 flex flex-col justify-start items-center ${isFullscreen ? 'p-2 md:p-4 h-full' : 'py-2 min-h-[100dvh]'}`}>
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
                                        className="w-full flex flex-col items-center justify-start py-2 md:py-6 transition-all duration-500"
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
                                            const surahsOnPage = new Map(); // surahNumber -> { name, firstLineNum, number }

                                            verses.forEach(verse => {
                                                // Safety check for verse.surah
                                                if (!verse.surah) return;

                                                const isFirstVerse = verse.numberInSurah === 1 || verse.verseNumber === 1;
                                                const surahNum = verse.surah.number;
                                                // Use tashkeel from API if available, fallback to local list
                                                const surahName = surahNameMapRef.current.get(surahNum) || SURAH_NAMES[surahNum - 1] || `Surah ${surahNum}`;

                                                if (isFirstVerse && !surahsOnPage.has(surahNum)) {
                                                    surahsOnPage.set(surahNum, { name: surahName, firstLineNum: null, number: surahNum });
                                                }

                                                if (verse.words && verse.words.length > 0) {
                                                    verse.words.forEach(word => {
                                                        const lineNum = word.line_number || word.lineNumber || 1;
                                                        if (!lineMap.has(lineNum)) lineMap.set(lineNum, []);
                                                        // Ensure word has verse_key for selection to work
                                                        const wordWithKey = {
                                                            ...word,
                                                            verse_key: word.verse_key || word.verseKey || verse.verse_key || verse.verseKey
                                                        };
                                                        lineMap.get(lineNum).push(wordWithKey);
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
                                                <div className="w-full flex flex-col" style={{ gap: '0.5rem' }}>
                                                    {lines.map(([lineNum, words]) => {
                                                        const isFirstSurahLine = firstVerseLines.has(lineNum);
                                                        // Check if this line is the start of a new surah
                                                        const surahStart = Array.from(surahsOnPage.entries()).find(([_, info]) => info.firstLineNum === lineNum);
                                                        const surahName = surahStart ? surahStart[1].name : null;
                                                        const surahNumber = surahStart ? surahStart[1].number : null;
                                                        const surahLigature = surahNumber ? `surah${String(surahNumber).padStart(3, '0')}` : '';

                                                        return (
                                                            <React.Fragment key={lineNum}>
                                                                {/* Display surah name before the first verse of each surah */}
                                                                {surahName && (
                                                                    <div className="w-full flex justify-center py-6">
                                                                        <span
                                                                            className="surah-title"
                                                                            dir="rtl"
                                                                            aria-label={surahName}
                                                                            title={surahName}
                                                                        >
                                                                            {surahLigature || surahName}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <div
                                                                    className={`w-full flex justify-center`}
                                                                    style={{
                                                                        minHeight: '4.5rem',
                                                                        color: mode.text,
                                                                        lineHeight: 1.1,
                                                                    }}
                                                                >
                                                                    {/* Wrap words in centered inline container for proper centering */}
                                                                    <div
                                                                        className="flex items-baseline justify-center"
                                                                        style={{
                                                                            width: 'auto',
                                                                        }}
                                                                    >
                                                                        {words.map((word, wIdx) => {
                                                                            const vKey = word.verse_key || word.verseKey;
                                                                            const isSelected = selectedVerseKey === vKey;
                                                                            return (
                                                                                <span
                                                                                    key={`${lineNum}-${wIdx}`}
                                                                                    dangerouslySetInnerHTML={{ __html: word.code_v2 || word.codeV2 || '' }}
                                                                                    className={`inline-block text-center select-none mushaf-word mushaf-word-selectable transition-all duration-300 ${isSelected ? 'selected-ayah' : ''}`}
                                                                                    style={{
                                                                                        marginLeft: word.char_type === 'end' ? '0.5rem' : '0',
                                                                                    }}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleVerseClick(vKey);
                                                                                    }}
                                                                                />
                                                                            );
                                                                        })}
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
                                    // AUTHENTIC MUSHAF MODE - render full lines with QPC V2 glyphs
                                    <div
                                        className="w-full flex flex-col items-center justify-start py-4 md:py-8 transition-all duration-700 mushaf-page"
                                        style={{
                                            fontFamily: `p${pageNumber}-v2`,
                                            direction: 'rtl',
                                        }}
                                    >
                                        {(() => {
                                            const lineMap = new Map();
                                            const firstVerseLines = new Set();
                                            // Track surahs on this page for displaying surah names
                                            const surahsOnPage = new Map(); // surahNumber -> { name, firstLineNum, number }

                                            verses.forEach(verse => {
                                                // Safety check for verse.surah
                                                if (!verse.surah) return;

                                                const isFirstVerse = verse.numberInSurah === 1 || verse.verseNumber === 1;
                                                const surahNum = verse.surah.number;
                                                // Use tashkeel from API if available, fallback to local list
                                                const surahName = surahNameMapRef.current.get(surahNum) || SURAH_NAMES[surahNum - 1] || `Surah ${surahNum}`;

                                                if (isFirstVerse && !surahsOnPage.has(surahNum)) {
                                                    surahsOnPage.set(surahNum, { name: surahName, firstLineNum: null, number: surahNum });
                                                }

                                                if (verse.words && verse.words.length > 0) {
                                                    verse.words.forEach(word => {
                                                        const lineNum = word.line_number || word.lineNumber || 1;
                                                        if (!lineMap.has(lineNum)) lineMap.set(lineNum, []);
                                                        // Ensure word has verse_key for selection to work
                                                        const wordWithKey = {
                                                            ...word,
                                                            verse_key: word.verse_key || word.verseKey || verse.verse_key || verse.verseKey
                                                        };
                                                        lineMap.get(lineNum).push(wordWithKey);
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
                                                <div className="w-full flex flex-col" style={{ gap: '0.85rem' }}>
                                                    {lines.map(([lineNum, words]) => {
                                                        const isFirstSurahLine = firstVerseLines.has(lineNum);
                                                        // Check if this line is the start of a new surah
                                                        const surahStart = Array.from(surahsOnPage.entries()).find(([_, info]) => info.firstLineNum === lineNum);
                                                        const surahName = surahStart ? surahStart[1].name : null;
                                                        const surahNumber = surahStart ? surahStart[1].number : null;
                                                        const surahLigature = surahNumber ? `surah${String(surahNumber).padStart(3, '0')}` : '';
                                                        const lineGlyphs = words
                                                            .map((word) => word.code_v2 || word.codeV2 || '')
                                                            .join('');

                                                        return (
                                                            <React.Fragment key={lineNum}>
                                                                {/* Display surah name before the first verse of each surah */}
                                                                {surahName && (
                                                                    <div className="w-full flex justify-center py-4">
                                                                        <span
                                                                            className="surah-title"
                                                                            dir="rtl"
                                                                            aria-label={surahName}
                                                                            title={surahName}
                                                                        >
                                                                            {surahLigature || surahName}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <div
                                                                    className={`mushaf-line-auth ${isFirstSurahLine ? 'mushaf-line-auth--center' : ''}`}
                                                                    style={{ color: mode.text }}
                                                                >
                                                                    <div className="mushaf-line-glyphs-container">
                                                                        {words.map((word, wIdx) => {
                                                                            const vKey = word.verse_key || word.verseKey;
                                                                            const isSelected = selectedVerseKey === vKey;
                                                                            return (
                                                                                <span
                                                                                    key={`${lineNum}-${wIdx}`}
                                                                                    dangerouslySetInnerHTML={{ __html: word.code_v2 || word.codeV2 || '' }}
                                                                                    className={`mushaf-word-selectable transition-all duration-300 ${isSelected ? 'selected-ayah' : ''}`}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleVerseClick(vKey);
                                                                                    }}
                                                                                />
                                                                            );
                                                                        })}
                                                                    </div>
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
                    <div className="fixed bottom-24 left-0 right-0 z-[700] flex items-center justify-center pointer-events-none">
                        <div
                            className="px-3 py-1 rounded-full text-[14px] font-bold font-kfgqpc"
                            style={{
                                color: mode.text,
                                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                border: `1px solid ${mode.accent}30`,
                                opacity: 0.8
                            }}
                        >
                            <span>{`صفحة ${toArabicIndicDigits(pageNumber)}`}</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* MINIMAL FLOATING BOTTOM NAV BAR */}
            {/* ═══════════════════════════════════════════════════════════════ */}
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
                            صفحة {pageNumber}
                        </span>
                        <input
                            type="range"
                            min="1"
                            max="604"
                            value={pageNumber}
                            onChange={(e) => setPageNumber(parseInt(e.target.value))}
                            className="w-full h-1 rounded-full appearance-none cursor-pointer bg-current opacity-20 hover:opacity-100 transition-opacity"
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

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* NAVIGATION PANEL (Full-screen slide-up) */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* AYAH DETAIL PANEL */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {showVerseDetail && (
                <div
                    className="fixed inset-0 z-[10000] flex items-end justify-center"
                    onClick={() => {
                        setShowVerseDetail(false);
                        setSelectedVerseKey(null);
                    }}
                >
                    {/* Modified: Overlay removed as per user request */}
                    {/* <div className="absolute inset-0 bg-black/5 pointer-events-auto" /> */}
                    <div
                        className={`relative flex flex-col w-full max-w-[600px] max-h-[70vh] rounded-t-[2.5rem] overflow-hidden shadow-2xl animate-slide-up ${isDarkMode ? 'bg-[#1A1A1A] text-white' : 'bg-[#FDFCFA] text-[#2C2C2C]'}`}
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                        style={{ borderTop: `2px solid ${mode.accent}30` }}
                    >
                        {/* Drag Handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-12 h-1.5 rounded-full bg-current opacity-10" />
                        </div>

                        {/* Panel Header */}
                        <div className="flex items-center justify-between px-6 pb-4 pt-2">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">معلومات الآية</span>
                                <h3 className="font-arabic font-bold text-xl" style={{ color: mode.accent }}>
                                    {selectedVerseKey}
                                </h3>
                            </div>
                            <button
                                onClick={() => {
                                    setShowVerseDetail(false);
                                    setSelectedVerseKey(null);
                                }}
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 hover:bg-black/10 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content Scroll Area */}
                        <div
                            className="flex-1 min-h-0 overflow-y-auto px-6 pb-12 nav-panel-scroll"
                            style={{ touchAction: 'pan-y', overscrollBehaviorY: 'contain' }}
                        >
                            {verseDetailLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="animate-spin opacity-40" size={32} />
                                    <span className="font-arabic opacity-40">جاري تحميل التفسير...</span>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-fade-in">
                                    {/* Verse Text Display */}
                                    {verseDetailData && (
                                        <div className="text-right p-4 rounded-2xl bg-black/5 border border-white/5">
                                            <p className="font-arabic text-2xl leading-relaxed mb-2" dir="rtl">
                                                {verseDetailData.textUthmani || verseDetailData.text}
                                            </p>
                                        </div>
                                    )}

                                    {/* Tafsir Content */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: mode.accent }} />
                                                <h4 className="font-arabic font-bold text-lg">
                                                    {tafsirList.find(t => t.id === selectedTafsir)?.name || 'التفسير'}
                                                </h4>
                                            </div>

                                            {/* Tafsir Selector */}
                                            {tafsirList.length > 0 && (
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowTafsirSelect(!showTafsirSelect);
                                                        }}
                                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all active:scale-95"
                                                        style={{
                                                            borderColor: mode.accent + '40',
                                                            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                                            color: mode.text
                                                        }}
                                                    >
                                                        <span className="text-xs font-bold font-arabic opacity-80">
                                                            {tafsirList.find(t => t.id === selectedTafsir)?.name || 'اختر التفسير'}
                                                        </span>
                                                        <ChevronDown size={14} className={`opacity-50 transition-transform ${showTafsirSelect ? 'rotate-180' : ''}`} />
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    {showTafsirSelect && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-10"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setShowTafsirSelect(false);
                                                                }}
                                                            />
                                                            <div
                                                                className="absolute top-full left-0 mt-2 w-56 max-h-[300px] overflow-y-auto rounded-xl shadow-xl z-20 border py-1 animate-fade-in nav-panel-scroll"
                                                                style={{
                                                                    backgroundColor: isDarkMode ? '#252525' : '#FFFFFF',
                                                                    borderColor: mode.accent + '20',
                                                                    touchAction: 'pan-y',
                                                                    overscrollBehaviorY: 'contain'
                                                                }}
                                                                onTouchStart={(e) => e.stopPropagation()}
                                                                onTouchMove={(e) => e.stopPropagation()}
                                                                onTouchEnd={(e) => e.stopPropagation()}
                                                            >
                                                                {tafsirList.map(t => (
                                                                    <button
                                                                        key={t.id}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedTafsir(t.id);
                                                                            setShowTafsirSelect(false);
                                                                        }}
                                                                        className={`w-full text-right px-4 py-2.5 text-xs font-arabic transition-colors flex items-center justify-between gap-2 border-b border-dashed border-white/5 last:border-0 hover:bg-black/5 ${selectedTafsir === t.id ? 'font-bold' : 'opacity-70'}`}
                                                                        style={{
                                                                            color: selectedTafsir === t.id ? mode.accent : mode.text
                                                                        }}
                                                                    >
                                                                        <span>
                                                                            {t.name}
                                                                            {t.language && t.language !== 'arabic' && (
                                                                                <span className="text-[10px] opacity-60 mr-1">({t.language})</span>
                                                                            )}
                                                                        </span>
                                                                        {selectedTafsir === t.id && <Check size={12} />}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div
                                            className="font-tafsir text-xl leading-loose text-justify opacity-90"
                                            dir="rtl"
                                            dangerouslySetInnerHTML={{ __html: tafsirData?.text || 'لا يتوفر تفسير حالياً.' }}
                                        />
                                    </div>

                                    {/* Translation if available */}
                                    {verseDetailData?.translations && verseDetailData.translations.length > 0 && (
                                        <div className="space-y-4 pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-1.5 h-6 rounded-full opacity-30" style={{ backgroundColor: mode.accent }} />
                                                <h4 className="font-arabic font-bold text-lg">الترجمة الإنجليزية</h4>
                                            </div>
                                            <p className="text-sm opacity-60 leading-relaxed text-left" dir="ltr">
                                                {verseDetailData.translations[0].text.replace(/<[^>]*>/g, '')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* NAVIGATION PANEL (Full-screen slide-up) */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {showNavPanel && (
                <div
                    className="fixed inset-0 z-[9999] flex items-end justify-center"
                    onClick={() => setShowNavPanel(false)}
                    style={{ touchAction: 'pan-y', overscrollBehaviorY: 'contain' }}
                >
                    {/* Modified: Overlay removed as per user request */}
                    {/* <div className="absolute inset-0 bg-black/5" /> */}
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
            )}

            {/* Custom animations & styles */}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0.4; }
                    to { opacity: 1; }
                }
                @keyframes slide-in-left {
                    from { opacity: 0.6; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes slide-in-right {
                    from { opacity: 0.6; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
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
                    font-size: clamp(calc(1.5rem * var(--mushaf-scale, 1)), calc((3.5vw + 1vh) * var(--mushaf-scale, 1)), calc(3rem * var(--mushaf-scale, 1)));
                    /* Ensure words flow naturally like the printed Mushaf */
                    transition: opacity 0.2s ease;
                }
                @media (min-width: 1024px) {
                    .mushaf-word {
                        font-size: 3.5rem !important; /* Cap font size on desktops */
                    }
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

                /* Authentic Mushaf line layout */
                .mushaf-line-auth {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: baseline;
                    white-space: nowrap;
                    line-height: 1.25;
                    overflow: hidden;
                    padding-inline: 0.75rem;
                }
                .mushaf-line-auth--center {
                    justify-content: center;
                }
                .mushaf-line-glyphs-container {
                    display: flex;
                    align-items: baseline;
                    justify-content: center;
                    flex-wrap: nowrap;
                    font-size: clamp(calc(1.35rem * var(--mushaf-scale, 1)), calc((3.6vw + 0.4rem) * var(--mushaf-scale, 1)), calc(2.6rem * var(--mushaf-scale, 1)));
                }
                .mushaf-word-selectable {
                    cursor: pointer;
                    display: inline-block;
                    line-height: inherit;
                }
                .mushaf-word-selectable:hover {
                    opacity: 0.7;
                }
                .selected-ayah {
                    background-color: rgba(166, 124, 82, 0.35) !important;
                    border-radius: 4px;
                    box-shadow: 0 0 8px rgba(166, 124, 82, 0.2);
                    display: inline-block;
                }

                /* Page container for Mushaf layout */
                .mushaf-page {
                    font-family: inherit;
                    direction: rtl;
                    line-height: 1;
                    letter-spacing: 0;
                }
            `}</style>
        </div >
    );
};

export default MushafPage;
