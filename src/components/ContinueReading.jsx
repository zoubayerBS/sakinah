import React from 'react';
import { Headphones } from 'lucide-react';

export const ContinueReading = ({ lastRead, onClick }) => {
    if (!lastRead) return null;

    return (
        <div
            onClick={onClick}
            className="group relative w-full overflow-hidden bg-[var(--color-bg-secondary)]/90 border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-md)] hover:border-[var(--color-highlight)] transition-all cursor-pointer"
            dir="rtl"
        >
            <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-[var(--color-highlight)]/10 blur-2xl"></div>
            <div className="flex items-center justify-between gap-4 relative">
                <div className="flex flex-col items-end text-right">
                    <span className="font-ui text-[10px] tracking-[0.35em] uppercase text-[var(--color-text-tertiary)]">
                        متابعة
                    </span>
                    <h3 className="font-arabic text-2xl text-[var(--color-text-primary)] mt-1">
                        {lastRead.surahName}
                    </h3>
                    {lastRead.verseNumber && (
                        <span className="font-arabic text-xs text-[var(--color-text-tertiary)] mt-1">
                            آية {lastRead.verseNumber}
                        </span>
                    )}
                </div>

                <div className="w-12 h-12 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[var(--color-accent)] group-hover:bg-[var(--color-accent)] group-hover:text-white transition-colors">
                    <Headphones size={20} />
                </div>
            </div>
        </div>
    );
};
