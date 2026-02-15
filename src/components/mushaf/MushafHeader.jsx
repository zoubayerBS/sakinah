import React from 'react';
import { Home, Bookmark, BookmarkCheck } from 'lucide-react';

const MushafHeader = ({
    showControls,
    onBack,
    mode,
    isDarkMode,
    pageInfo,
    formatSurahTitle,
    khitma,
    wirdProgress,
    toggleBookmark,
    isCurrentPageBookmarked,
    readingMode,
    setReadingMode,
    READING_MODES
}) => {
    return (
        <header
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[600] w-auto max-w-[94%] ${showControls ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0 pointer-events-none'}`}
            style={{
                transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms cubic-bezier(0.22, 1, 0.36, 1)',
                willChange: 'transform, opacity',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="flex items-center justify-between gap-4 pl-2 pr-4 py-2 rounded-full shadow-2xl border border-[var(--color-border)] transition-all duration-300 backdrop-blur-md"
                style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    boxShadow: 'var(--shadow-lg)',
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
                <div className="flex flex-col items-center min-w-[120px]">
                    <h1 className="font-arabic font-bold text-base leading-tight" style={{ color: mode.text }}>
                        {pageInfo ? formatSurahTitle(pageInfo.surah) : 'المصحف'}
                    </h1>

                    {khitma?.isStarted ? (
                        <div className="flex flex-col items-center w-full mt-1.5 px-2">
                            <div className="w-full h-1 bg-black/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[var(--color-accent)] shadow-[0_0_5px_var(--color-accent)] transition-all duration-1000"
                                    style={{ width: `${wirdProgress}%` }}
                                />
                            </div>
                            <div className="flex justify-between w-full mt-1">
                                <span className="text-[7px] font-bold opacity-30 uppercase" style={{ color: mode.text }}>
                                    الجزء {pageInfo?.juz}
                                </span>
                                <span className="text-[7px] font-bold opacity-40 uppercase tracking-tighter" style={{ color: mode.text }}>
                                    ورد اليوم {Math.round(wirdProgress)}%
                                </span>
                            </div>
                        </div>
                    ) : (
                        pageInfo && (
                            <span className="text-[9px] font-bold opacity-50" style={{ color: mode.text }}>
                                الجزء {pageInfo.juz} • {pageInfo.surahEnglish}
                            </span>
                        )
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
    );
};

export default MushafHeader;
