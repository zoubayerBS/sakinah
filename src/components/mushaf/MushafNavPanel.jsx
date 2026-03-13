import React, { useState, useEffect, useCallback } from 'react';
import { X, BookOpen, Layers, Hash, BookMarked, Search, Check, Download, Trash2, Loader2, WifiOff, CheckCircle2, ChevronDown } from 'lucide-react';
import { startFullQuranDownload, startSurahDownload, getMushafDownloadStatus, getSurahDownloadStatuses, refreshSurahStatuses, deleteMushafOfflineData } from '../../services/mushaf-download.js';
import { surahPageMapping } from '../../data/surah-pages.js';

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
    surahPageMapping: surahPageMappingProp,
    pageInfo,
    pageNumber,
    navigateTo,
    JUZ_PAGES,
    currentJuz,
    setBookmarkedPages
}) => {
    // Download state
    const [downloadStatus, setDownloadStatus] = useState(() => getMushafDownloadStatus());
    const [surahStatuses, setSurahStatuses] = useState(() => getSurahDownloadStatuses());
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(null);
    const [downloadingSurah, setDownloadingSurah] = useState(null); // null = full quran or idle
    const [abortFn, setAbortFn] = useState(null);
    const [downloadMode, setDownloadMode] = useState('surah'); // 'surah' or 'full'

    // Refresh statuses when panel opens on download tab
    useEffect(() => {
        if (showNavPanel && navTab === 'download') {
            refreshSurahStatuses().then(statuses => {
                setSurahStatuses(statuses);
                setDownloadStatus(getMushafDownloadStatus());
            });
        }
    }, [showNavPanel, navTab]);

    // ─── Full Quran download ─────────────────────────────────
    const handleFullDownload = useCallback(() => {
        setIsDownloading(true);
        setDownloadingSurah(null);
        const { abort, promise } = startFullQuranDownload((progress) => {
            setDownloadProgress(progress);
            if (progress.phase === 'complete' || progress.phase === 'cancelled') {
                setIsDownloading(false);
                setAbortFn(null);
                setDownloadStatus(getMushafDownloadStatus());
                refreshSurahStatuses().then(setSurahStatuses);
            }
        });
        setAbortFn(() => abort);
        promise.catch(() => { setIsDownloading(false); setAbortFn(null); });
    }, []);

    // ─── Per-surah download ──────────────────────────────────
    const handleSurahDownload = useCallback((surahNum) => {
        setIsDownloading(true);
        setDownloadingSurah(surahNum);
        const { abort, promise } = startSurahDownload(surahNum, (progress) => {
            setDownloadProgress(progress);
            if (progress.phase === 'complete' || progress.phase === 'cancelled') {
                setIsDownloading(false);
                setDownloadingSurah(null);
                setAbortFn(null);
                setDownloadStatus(getMushafDownloadStatus());
                refreshSurahStatuses().then(setSurahStatuses);
            }
        });
        setAbortFn(() => abort);
        promise.catch(() => { setIsDownloading(false); setDownloadingSurah(null); setAbortFn(null); });
    }, []);

    const handleCancel = useCallback(() => {
        if (abortFn) abortFn();
    }, [abortFn]);

    const handleDeleteAll = useCallback(async () => {
        await deleteMushafOfflineData();
        setDownloadStatus({ downloaded: 0, total: 604, isComplete: false });
        setSurahStatuses({});
        setDownloadProgress(null);
    }, []);

    if (!showNavPanel) return null;

    const downloadedSurahCount = Object.keys(surahStatuses).length;

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
                <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)] sticky top-0 z-10 bg-[var(--color-bg-primary)]">
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

                {/* Tab Buttons */}
                <div className="flex px-4 gap-1.5 pb-3">
                    {[
                        { id: 'surah', label: 'السور', icon: BookOpen },
                        { id: 'juz', label: 'الأجزاء', icon: Layers },
                        { id: 'page', label: 'صفحة', icon: Hash },
                        ...(bookmarkedPages.length > 0 ? [{ id: 'bookmarks', label: 'العلامات', icon: BookMarked }] : []),
                        { id: 'download', label: 'تحميل', icon: Download },
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

                {/* Search Bar */}
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
                                const pages = surahPageMappingProp[number];
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
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${isCurrentSurah
                                            ? 'bg-white/20 text-white'
                                            : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]'
                                            }`}>{number}</div>
                                        <div className="flex-1 text-right">
                                            <span className={`font-arabic font-bold text-sm block ${isCurrentSurah ? 'text-white' : 'text-[var(--color-text-primary)]'}`}>
                                                {name}
                                            </span>
                                        </div>
                                        <div className={`text-center px-2 py-1 rounded-lg ${isCurrentSurah ? 'bg-white/10' : 'bg-[var(--color-bg-tertiary)]'}`}>
                                            <span className={`text-[10px] font-bold tabular-nums block ${isCurrentSurah ? 'text-white' : 'text-[var(--color-text-tertiary)]'}`}>
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
                            <div className="text-center space-y-2 py-3">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-bg-tertiary)]">
                                    <span className="text-4xl font-bold tabular-nums text-[var(--color-text-primary)]">{pageNumber}</span>
                                </div>
                                <p className="text-xs font-arabic text-[var(--color-text-tertiary)] mt-1">
                                    من 604 صفحة (P. {pageNumber}/604)
                                </p>
                            </div>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const p = parseInt(e.target.elements.pageInput.value);
                                if (p >= 1 && p <= 604) navigateTo(p, p > pageNumber ? 'left' : 'right');
                            }} className="flex gap-2">
                                <input name="pageInput" type="number" placeholder="رقم الصفحة..." min="1" max="604"
                                    className="flex-1 text-center rounded-xl px-4 py-2.5 text-base font-bold bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:opacity-30 focus:border-[var(--color-accent)] focus:outline-none transition-all font-arabic"
                                    autoFocus />
                                <button type="submit" className="px-5 py-2.5 rounded-xl text-white font-arabic font-bold active:scale-95 transition-all shadow-md bg-[var(--color-accent)]">
                                    انتقل
                                </button>
                            </form>
                            <div className="grid grid-cols-4 gap-1.5">
                                {[1, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 604].map(p => (
                                    <button key={p} onClick={() => navigateTo(p, p > pageNumber ? 'left' : 'right')}
                                        className={`py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${p === pageNumber
                                            ? 'bg-[var(--color-accent)] text-white shadow-md'
                                            : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
                                            }`}>{p}</button>
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
                                    <p className="font-arabic text-sm text-[var(--color-text-tertiary)]">لا توجد علامات مرجعية</p>
                                </div>
                            ) : (
                                bookmarkedPages.map(p => (
                                    <div key={p} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all border ${p === pageNumber
                                        ? 'bg-[var(--color-accent)] text-white border-transparent shadow-lg'
                                        : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]'
                                        }`}>
                                        <button onClick={() => navigateTo(p, p > pageNumber ? 'left' : 'right')} className="flex-1 flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p === pageNumber ? 'bg-white/20' : 'bg-[var(--color-bg-secondary)]'}`}>
                                                <Check size={18} className={p === pageNumber ? 'text-white' : 'text-[var(--color-accent)]'} />
                                            </div>
                                            <div className="text-right">
                                                <span className={`font-arabic font-bold text-sm block ${p === pageNumber ? 'text-white' : 'text-[var(--color-text-primary)]'}`}>
                                                    صفحة {p}
                                                </span>
                                            </div>
                                        </button>
                                        <button onClick={() => setBookmarkedPages(prev => prev.filter(bp => bp !== p))}
                                            className={`p-2 rounded-lg transition-all active:scale-90 ${p === pageNumber ? 'hover:bg-white/20 text-white/70' : 'hover:bg-red-100 text-red-500'}`}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════════════════ */}
                    {/* ── DOWNLOAD TAB ── */}
                    {/* ══════════════════════════════════════════════════════════ */}
                    {navTab === 'download' && (
                        <div className="p-4 space-y-4 px-4">

                            {/* Download mode toggle */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setDownloadMode('surah')}
                                    className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold font-arabic transition-all border ${downloadMode === 'surah'
                                        ? 'bg-[var(--color-accent)] text-white border-transparent shadow-md'
                                        : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border)] opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    تحميل بالسورة
                                </button>
                                <button
                                    onClick={() => setDownloadMode('full')}
                                    className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold font-arabic transition-all border ${downloadMode === 'full'
                                        ? 'bg-[var(--color-accent)] text-white border-transparent shadow-md'
                                        : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border)] opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    تحميل الكل
                                </button>
                            </div>

                            {/* ── FULL QURAN MODE ── */}
                            {downloadMode === 'full' && (
                                <div className="space-y-5">
                                    {/* Status icon */}
                                    <div className="text-center space-y-3 py-3">
                                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full transition-all duration-500 ${downloadStatus.isComplete ? 'bg-green-500/10'
                                                : isDownloading && !downloadingSurah ? 'bg-[var(--color-accent)]/10'
                                                    : 'bg-[var(--color-bg-tertiary)]'
                                            }`}>
                                            {downloadStatus.isComplete ? (
                                                <CheckCircle2 size={40} className="text-green-500" />
                                            ) : isDownloading && !downloadingSurah ? (
                                                <Loader2 size={40} className="text-[var(--color-accent)] animate-spin" />
                                            ) : (
                                                <WifiOff size={36} className="text-[var(--color-text-tertiary)]" />
                                            )}
                                        </div>
                                        <h3 className="font-arabic font-bold text-base text-[var(--color-text-primary)]">
                                            {downloadStatus.isComplete ? 'المصحف جاهز للقراءة بدون انترنت' : 'تحميل القرآن كاملاً'}
                                        </h3>
                                        <p className="font-arabic text-xs text-[var(--color-text-tertiary)] leading-relaxed max-w-[280px] mx-auto">
                                            {downloadStatus.isComplete
                                                ? 'تم تحميل جميع الصفحات. يمكنك القراءة بدون اتصال.'
                                                : `حمّل جميع صفحات المصحف (٦٠٤ صفحة) دفعة واحدة. الحجم ≈ 50 MB`
                                            }
                                        </p>
                                    </div>

                                    {/* Progress bar for full download */}
                                    {(isDownloading && !downloadingSurah) && downloadProgress && (
                                        <div className="space-y-2">
                                            <div className="w-full h-3 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-300 ease-out"
                                                    style={{ width: `${downloadProgress.percent}%`, background: 'linear-gradient(90deg, var(--color-accent), #8B5CF6)' }} />
                                            </div>
                                            <div className="flex items-center justify-between text-[11px] font-bold font-arabic text-[var(--color-text-tertiary)]">
                                                <span>{downloadProgress.downloaded} / 604 صفحة</span>
                                                <span>{downloadProgress.percent}٪</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action buttons */}
                                    <div className="space-y-3">
                                        {!downloadStatus.isComplete && !(isDownloading && !downloadingSurah) && (
                                            <button onClick={handleFullDownload} disabled={isDownloading}
                                                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-arabic font-bold text-base active:scale-[0.98] transition-all shadow-lg disabled:opacity-40"
                                                style={{ background: 'linear-gradient(135deg, var(--color-accent), #8B5CF6)', boxShadow: '0 8px 24px var(--color-accent)33' }}>
                                                <Download size={22} />
                                                {downloadStatus.downloaded > 0 ? 'متابعة التحميل' : 'بدء التحميل'}
                                            </button>
                                        )}
                                        {isDownloading && !downloadingSurah && (
                                            <button onClick={handleCancel}
                                                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-arabic font-bold text-base active:scale-[0.98] transition-all border-2 border-red-500/30 text-red-500 hover:bg-red-50">
                                                <X size={20} />
                                                إلغاء التحميل
                                            </button>
                                        )}
                                        {downloadStatus.isComplete && (
                                            <button onClick={handleDeleteAll}
                                                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-arabic font-bold text-sm active:scale-[0.98] transition-all border border-[var(--color-border)] text-red-500 hover:bg-red-50">
                                                <Trash2 size={18} />
                                                حذف البيانات المحملة
                                            </button>
                                        )}
                                    </div>

                                    {/* Info card */}
                                    <div className="rounded-xl bg-[var(--color-bg-tertiary)] p-4 space-y-2">
                                        <div className="flex items-center justify-between text-[11px] font-arabic">
                                            <span className="text-[var(--color-text-tertiary)]">عدد الصفحات</span>
                                            <span className="font-bold text-[var(--color-text-primary)]">٦٠٤ صفحة</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] font-arabic">
                                            <span className="text-[var(--color-text-tertiary)]">السور المحملة</span>
                                            <span className="font-bold text-[var(--color-text-primary)]">{downloadedSurahCount} / 114</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] font-arabic">
                                            <span className="text-[var(--color-text-tertiary)]">الحجم التقريبي</span>
                                            <span className="font-bold text-[var(--color-text-primary)]">~50 MB</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── PER-SURAH MODE ── */}
                            {downloadMode === 'surah' && (
                                <div className="space-y-2">
                                    {/* Summary bar */}
                                    <div className="flex items-center justify-between px-2 py-2">
                                        <span className="text-[11px] font-arabic font-bold text-[var(--color-text-tertiary)]">
                                            {downloadedSurahCount} / 114 سورة محملة
                                        </span>
                                        {downloadedSurahCount > 0 && !isDownloading && (
                                            <button onClick={handleDeleteAll}
                                                className="text-[10px] font-arabic font-bold text-red-500 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50">
                                                حذف الكل
                                            </button>
                                        )}
                                    </div>

                                    {/* Surah list */}
                                    {SURAH_NAMES.map((name, idx) => {
                                        const surahNum = idx + 1;
                                        const isCached = surahStatuses[surahNum];
                                        const isThisSurahDownloading = isDownloading && downloadingSurah === surahNum;
                                        const mapping = surahPageMapping[surahNum];
                                        const pageCount = mapping ? (mapping.end - mapping.start + 1) : 0;

                                        return (
                                            <div
                                                key={surahNum}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all border ${isCached
                                                        ? 'bg-green-500/5 border-green-500/20'
                                                        : 'bg-[var(--color-bg-tertiary)] border-transparent'
                                                    }`}
                                            >
                                                {/* Number */}
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${isCached ? 'bg-green-500/10 text-green-600' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
                                                    }`}>
                                                    {surahNum}
                                                </div>

                                                {/* Name + page count */}
                                                <div className="flex-1 min-w-0">
                                                    <span className="font-arabic font-bold text-sm block text-[var(--color-text-primary)]">{name}</span>
                                                    <span className="text-[10px] text-[var(--color-text-tertiary)]">
                                                        {pageCount} {pageCount === 1 ? 'صفحة' : 'صفحات'}
                                                    </span>
                                                </div>

                                                {/* Action button */}
                                                {isCached ? (
                                                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-green-500/10">
                                                        <CheckCircle2 size={18} className="text-green-500" />
                                                    </div>
                                                ) : isThisSurahDownloading ? (
                                                    <button onClick={handleCancel}
                                                        className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--color-accent)]/10">
                                                        <Loader2 size={18} className="text-[var(--color-accent)] animate-spin" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleSurahDownload(surahNum)}
                                                        disabled={isDownloading}
                                                        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--color-accent)]/10 transition-all active:scale-90 disabled:opacity-30"
                                                    >
                                                        <Download size={16} className="text-[var(--color-accent)]" />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Per-surah progress bar (floating) */}
                            {isDownloading && downloadingSurah && downloadProgress && (
                                <div className="sticky bottom-0 left-0 right-0 bg-[var(--color-bg-primary)] border-t border-[var(--color-border)] p-3 -mx-4 -mb-4 rounded-b-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <div className="text-[11px] font-arabic font-bold text-[var(--color-text-primary)] mb-1">
                                                سورة {SURAH_NAMES[downloadingSurah - 1]}
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-300 ease-out"
                                                    style={{ width: `${downloadProgress.percent}%`, background: 'linear-gradient(90deg, var(--color-accent), #8B5CF6)' }} />
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-bold tabular-nums text-[var(--color-text-tertiary)]">{downloadProgress.percent}٪</span>
                                        <button onClick={handleCancel}
                                            className="p-1.5 rounded-full text-red-500 hover:bg-red-50 transition-all active:scale-90">
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MushafNavPanel;
