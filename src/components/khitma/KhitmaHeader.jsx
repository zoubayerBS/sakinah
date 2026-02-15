import React from 'react';
import { ArrowLeft, Flame } from 'lucide-react';

const KhitmaHeader = ({ onBack, isStarted, currentStreak }) => (
    <header className="sticky top-0 z-[var(--z-fixed)] w-full bg-[var(--color-bg-secondary)]/90 backdrop-blur-md border-b border-[var(--color-border)] px-6 py-4">
        <div className="max-w-[700px] mx-auto flex items-center justify-between" dir="rtl">
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all"
                >
                    <ArrowLeft size={20} className="rotate-180" />
                </button>
                <div>
                    <h1 className="font-arabic font-bold text-xl text-[var(--color-text-primary)]">
                        مخطط الختمة
                    </h1>
                </div>
            </div>
            {isStarted && (
                <div className="flex items-center gap-2 bg-[var(--color-accent)]/10 px-3 py-1.5 rounded-full border border-[var(--color-accent)]/20">
                    <Flame size={16} className="text-[var(--color-accent)]" />
                    <span className="font-ui font-bold text-sm text-[var(--color-accent)]">{currentStreak}</span>
                </div>
            )}
        </div>
    </header>
);

export default KhitmaHeader;
