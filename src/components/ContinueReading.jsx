import React from 'react';
import { Headphones } from 'lucide-react';

export const ContinueReading = ({ lastRead, onClick }) => {
    if (!lastRead) return null;

    return (
        <div
            onClick={onClick}
            className="group w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl p-6 shadow-sm hover:border-[var(--color-accent)] transition-colors cursor-pointer"
            dir="rtl"
        >
            <div className="flex items-center justify-between gap-6 relative z-10">
                <div className="flex flex-col items-end text-right">
                    <span className="font-ui text-[12px] font-black tracking-[0.4em] uppercase text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-4 py-1.5 rounded-full mb-3">
                        متابعة
                    </span>
                    <h3 className="font-arabic font-black text-3xl text-[var(--color-text-primary)] tracking-tight">
                        {lastRead.surahName}
                    </h3>
                    {lastRead.verseNumber && (
                        <span className="font-arabic font-bold text-lg text-[var(--color-text-secondary)] mt-2 opacity-80">
                            آية {lastRead.verseNumber}
                        </span>
                    )}
                </div>

                <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] flex items-center justify-center">
                    <Headphones size={24} />
                </div>
            </div>
        </div>
    );
};
