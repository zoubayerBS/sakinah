import React from 'react';
import { ArrowLeft, Flame, Award } from 'lucide-react';

const KhitmaHeader = ({ onBack, isStarted, currentStreak, completedKhitmas = 0, progressPercentage = 0 }) => (
    <header className="sticky top-0 z-[var(--z-fixed)] w-full bg-[var(--color-bg-secondary)]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-4 md:px-6 py-3 md:py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between" dir="rtl">
            <div className="flex items-center gap-3 md:gap-6">
                <button
                    onClick={onBack}
                    className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center rounded-xl md:rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-accent)]/5 transition-all text-[var(--color-text-primary)]"
                >
                    <ArrowLeft size={20} className="rotate-180 sm:w-5 sm:h-5 w-4 h-4" />
                </button>
                <div>
                    <h1 className="font-arabic font-black text-lg sm:text-xl md:text-2xl text-[var(--color-text-primary)] tracking-tight">
                        مخطط الختمة
                    </h1>
                    {isStarted && (
                        <span className="text-[10px] font-arabic font-bold text-[var(--color-accent)] opacity-70">
                            {progressPercentage}% مكتمل
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                {/* Completed Khitmas Badge */}
                {completedKhitmas > 0 && (
                    <div className="flex items-center gap-1 sm:gap-2 bg-[var(--color-highlight)]/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-[var(--color-highlight)]/20">
                        <Award size={14} className="text-[var(--color-highlight)] sm:w-3.5 sm:h-3.5 w-3 h-3" />
                        <span className="font-ui font-black text-xs sm:text-sm text-[var(--color-highlight)]">{completedKhitmas}</span>
                    </div>
                )}

                {/* Streak Counter */}
                {isStarted && (
                    <div className="flex items-center gap-1 sm:gap-3 bg-[var(--color-accent)]/10 px-2 sm:px-4 py-1.5 sm:py-2 rounded-2xl border border-[var(--color-accent)]/20 shadow-inner group shrink-0">
                        <Flame size={18} className="text-[var(--color-accent)] animate-pulse sm:w-4.5 sm:h-4.5 w-4 h-4" />
                        <span className="font-ui font-black text-base sm:text-lg text-[var(--color-accent)]">{currentStreak}</span>
                        <span className="text-[10px] font-arabic font-bold text-[var(--color-accent)] opacity-60">يوم</span>
                    </div>
                )}
            </div>
        </div>
    </header>
);

export default KhitmaHeader;
