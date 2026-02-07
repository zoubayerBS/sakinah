import React from 'react';
import { BookOpen, MapPin } from 'lucide-react';

export const SurahCard = ({ surah, index, onClick }) => {
    // Dynamic font size based on Arabic name length
    const getArabicFontSize = () => {
        const nameLength = surah.name.length;
        if (nameLength > 15) return 'text-2xl'; // Long names
        if (nameLength > 10) return 'text-[2.5rem]'; // Medium names
        return 'text-3xl'; // Short names
    };

    return (
        <div
            onClick={onClick}
            className="group relative w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[var(--color-highlight)] transition-all duration-[var(--transition-base)] cursor-pointer"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            {/* Layout: Flexbox to group Text (Right) vs Number (Left) */}
            <div className="flex items-center justify-between" dir="rtl">

                {/* Right Group: Arabic & Latin */}
                <div className="flex items-center gap-6">
                    {/* Arabic Name (Rightmost) */}
                    <div className="text-right">
                        <h3 className={`font-arabic ${getArabicFontSize()} text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors leading-none`}>
                            {surah.name}
                        </h3>
                        <p className="font-arabic text-sm text-[var(--color-text-secondary)] mt-1">
                            {surah.revelation === 'Meccan' ? 'مكية' : 'مدنية'}
                        </p>
                    </div>

                    {/* Latin Info (Left of Arabic) */}
                    <div className="flex flex-col gap-1 items-end text-right" dir="ltr">
                        <h4 className="font-ui font-bold text-lg text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                            {surah.transliteration}
                        </h4>
                        <p className="font-ui text-sm text-[var(--color-text-secondary)]">
                            {surah.translation}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1">
                                <BookOpen size={14} className="text-[var(--color-text-tertiary)]" />
                                <span className="font-arabic text-xs text-[var(--color-text-tertiary)]">
                                    آية {surah.verses}
                                </span>
                            </div>
                            <span className="text-[var(--color-text-tertiary)]">•</span>
                            <div className="flex items-center gap-1">
                                <MapPin size={14} className="text-[var(--color-text-tertiary)]" />
                                <span className="font-arabic text-xs text-[var(--color-text-tertiary)]">
                                    {surah.revelation === 'Meccan' ? 'مكية' : 'مدنية'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Left Item: Surah Number (Far Left) */}
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] flex items-center justify-center">
                    <span className="font-ui font-bold text-xl text-[var(--color-highlight)]">
                        {surah.number}
                    </span>
                </div>

            </div>
        </div>
    );
};
