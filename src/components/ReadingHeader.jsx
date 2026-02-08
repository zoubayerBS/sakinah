import React from 'react';
import { ArrowLeft, Bookmark, Share2, Headphones, LayoutList, AlignJustify } from 'lucide-react';

export const ReadingHeader = ({
    surah,
    onBack,
    reciterName,
    onChangeReciter,
    isBookmarked,
    onToggleBookmark,
    viewMode,
    onViewModeChange
}) => {
    return (
        <header className="sticky top-0 z-[var(--z-fixed)] w-full bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] px-6 py-4 shadow-[var(--shadow-sm)] transition-colors">
            <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4" dir="rtl">

                {/* Right: Back & Info */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]
                          hover:bg-[var(--color-accent)] hover:text-white transition-all group"
                    >
                        <ArrowLeft size={20} className="rotate-180 group-hover:scale-110 transition-transform" />
                    </button>

                    <div className="flex flex-col items-start">
                        <h1 className="font-arabic font-bold text-2xl text-[var(--color-text-primary)] leading-none">
                            {surah.name}
                        </h1>
                        <span className="font-arabic text-xs text-[var(--color-text-secondary)] mt-1">
                            {surah.verses} آية • {surah.revelation === 'Meccan' ? 'مكية' : 'مدنية'}
                        </span>
                    </div>
                </div>

                {/* Center: Controls */}
                <div className="hidden md:flex items-center gap-4">
                    {/* View Toggle */}
                    <div className="flex bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-full p-1 shadow-inner">
                        <button
                            onClick={() => onViewModeChange('list')}
                            className={`px-4 py-1.5 rounded-full flex items-center gap-2 text-sm transition-all ${viewMode === 'list' ? 'bg-[var(--color-accent)] text-white shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                        >
                            <LayoutList size={16} />
                            <span className="font-arabic">قائمة</span>
                        </button>
                        <button
                            onClick={() => onViewModeChange('continuous')}
                            className={`px-4 py-1.5 rounded-full flex items-center gap-2 text-sm transition-all ${viewMode === 'continuous' ? 'bg-[var(--color-accent)] text-white shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                        >
                            <AlignJustify size={16} />
                            <span className="font-arabic">مصحف</span>
                        </button>
                    </div>

                    <button
                        onClick={onChangeReciter}
                        className="flex items-center gap-3 px-4 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-full hover:border-[var(--color-accent)] transition-all group"
                    >
                        <Headphones className="w-4 h-4 text-[var(--color-accent)]" />
                        <span className="text-sm font-medium text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]">
                            {reciterName || 'اختر القارئ'}
                        </span>
                    </button>
                </div>

                {/* Left: Actions */}
                <div className="flex items-center gap-3">
                    {/* Mobile View Toggle Icon */}
                    <button
                        onClick={() => onViewModeChange(viewMode === 'list' ? 'continuous' : 'list')}
                        className="md:hidden w-10 h-10 flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
                    >
                        {viewMode === 'list' ? <AlignJustify size={18} /> : <LayoutList size={18} />}
                    </button>

                    <button
                        onClick={onChangeReciter}
                        className="md:hidden w-10 h-10 flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-accent)]"
                    >
                        <Headphones size={18} className="text-[var(--color-accent)]" />
                    </button>
                    <button
                        onClick={onToggleBookmark}
                        className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors group"
                    >
                        <Bookmark size={18} className={`transition-colors ${isBookmarked ? 'fill-[var(--color-accent)] text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)]'}`} />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors group">
                        <Share2 size={18} className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)] transition-colors" />
                    </button>
                </div>
            </div>
        </header>
    );
};

