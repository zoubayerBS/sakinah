import React from 'react';
import { Headphones } from 'lucide-react';

export const ContinueReading = ({ lastRead, onClick }) => {
    if (!lastRead) return null;

    return (
        <div
            onClick={onClick}
            className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 mb-8 shadow-[var(--shadow-sm)] hover:border-[var(--color-accent)] transition-all cursor-pointer flex items-center justify-between group"
        >
            <div className="flex flex-col items-end text-right">
                <span className="font-arabic text-xs text-[var(--color-accent)] mb-1">
                    تابع الاستماع
                </span>
                <h3 className="font-arabic text-xl text-[var(--color-text-primary)]">
                    {lastRead.surahName}
                </h3>
            </div>

            <div className="w-12 h-12 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[var(--color-accent)] group-hover:bg-[var(--color-accent)] group-hover:text-white transition-colors">
                <Headphones size={20} />
            </div>
        </div>
    );
};
