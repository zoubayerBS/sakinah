import React from 'react';

export const VerseView = ({ verse, index, surahNumber }) => {
    const isFirstVerse = verse.number === 1;
    const isBismillah = verse.text.includes('بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ');

    return (
        <div
            className={`
        group relative w-full mb-8 p-10 rounded-[2.5rem] bg-white/40 dark:bg-white/5 backdrop-blur-3xl border border-white/60 dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-700 animate-fade-in
        ${isFirstVerse ? 'text-center' : 'text-right'}
      `}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="relative z-10 flex flex-col items-end gap-8">
                {/* Arabic Text */}
                <p className={`
          w-full font-arabic leading-loose text-var(--color-text-arabic) selection:bg-[#FA8112]/20
          ${isFirstVerse ? 'text-4xl text-[#FA8112] text-center' : 'text-[1.75rem] text-right'}
        `}>
                    {verse.text}
                </p>

                {/* Translation (if available) */}
                {verse.translation && (
                    <p className="w-full text-left font-ui font-medium text-lg text-[var(--color-text-secondary)] opacity-60 leading-relaxed italic border-l-2 border-[#FA8112]/20 pl-6">
                        {verse.translation}
                    </p>
                )}

                {/* Verse Medallion */}
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/60 dark:bg-white/5 border border-[#FA8112]/20 shadow-inner group-hover:scale-110 group-hover:bg-[#FA8112] transition-all duration-700 flex-shrink-0">
                    <span className="font-ui font-black text-sm text-[#FA8112] group-hover:text-white transition-colors duration-500">
                        {verse.number}
                    </span>
                </div>
            </div>

            {/* Subtle Divider for non-last verses */}
            <div className="absolute bottom-[-1rem] left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-[var(--color-divider)] to-transparent opacity-30"></div>
        </div>
    );
};
