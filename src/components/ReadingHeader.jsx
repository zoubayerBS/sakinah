import React from 'react';
import { ArrowLeft, Bookmark, Share2, Headphones } from 'lucide-react';

export const ReadingHeader = ({ surah, onBack, reciterName, onChangeReciter, isBookmarked, onToggleBookmark }) => {
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
                        <h1 className="font-arabic font-bold text-2xl text-[var(--color-text-primary)]">
                            {surah.name}
                        </h1>
                        <span className="font-arabic text-xs text-[var(--color-text-secondary)]">
                            {surah.verses} آية • {surah.revelation === 'Meccan' ? 'مكية' : 'مدنية'}
                        </span>
                    </div>
                </div>

                {/* Center: Reciter Info */}
                <button
                    onClick={onChangeReciter}
                    className="hidden md:flex items-center gap-3 px-4 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-full hover:border-[var(--color-accent)] transition-all group"
                >
                    <Headphones className="w-4 h-4 text-[var(--color-accent)]" />
                    <span className="text-sm font-medium text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]">
                        {reciterName || 'اختر القارئ'}
                    </span>
                </button>

                {/* Left: Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onChangeReciter}
                        className="md:hidden w-10 h-10 flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] animate-pulse"
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
