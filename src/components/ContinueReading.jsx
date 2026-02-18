import React from 'react';
import { Headphones } from 'lucide-react';

export const ContinueReading = ({ lastRead, onClick }) => {
    if (!lastRead) return null;

    return (
        <div
            onClick={onClick}
            className="group relative w-full overflow-hidden glass-premium rounded-[2rem] p-8 shadow-2xl hover:border-[var(--color-accent)]/40 transition-all duration-500 cursor-pointer"
            dir="rtl"
        >
            <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-[var(--color-highlight)]/10 blur-3xl group-hover:bg-[var(--color-highlight)]/20 transition-colors duration-700"></div>
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

                <div className="w-16 h-16 rounded-3xl bg-[var(--color-accent)] text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Headphones size={28} />
                </div>
            </div>
        </div>
    );
};
