import React from 'react';
import { Sparkles, CheckCircle2, Heart, Award } from 'lucide-react';

const KhitmaMission = ({ remainingToday, todayPortions, handleFinishPortion, progress, totalPortions }) => (
    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-sm rounded-3xl p-6 md:p-8 space-y-8 relative overflow-hidden group">

        <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-highlight)]/10 text-[var(--color-highlight)] flex items-center justify-center">
                    <Sparkles size={24} className="animate-pulse-slow" />
                </div>
                <div>
                    <h4 className="font-arabic font-black text-2xl text-[var(--color-text-primary)]">أوراد اليوم</h4>
                    <p className="text-xs text-[var(--color-text-tertiary)] opacity-70">أكمل أورادك الخمسة لليوم</p>
                </div>
            </div>
            <div className={`px-4 py-2 rounded-xl font-arabic font-bold text-sm border transition-all duration-500
                ${remainingToday > 0
                    ? 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-black/60 dark:text-white/60'
                    : 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/20 text-[var(--color-accent)]'}`}>
                {remainingToday > 0 ? `باقي ${remainingToday} أوراد` : 'اكتملت مهمة اليوم ✨'}
            </div>
        </div>

        <div className="overflow-x-auto no-scrollbar -mx-2 px-2 pb-4 touch-pan-x relative z-10">
            <div className="flex items-center justify-between min-w-max gap-6 md:gap-8 px-4">
                {[1, 2, 3, 4, 5].map(idx => {
                    const isDone = idx <= todayPortions;
                    return (
                        <div key={idx} className="flex flex-col items-center gap-3 group/item shrink-0">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-700
                                ${isDone
                                    ? 'bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-highlight)] border-[var(--color-highlight)] text-white shadow-lg scale-110'
                                    : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-[var(--color-text-tertiary)] hover:border-[var(--color-accent)]/30'}
                            `}>
                                {isDone ? <CheckCircle2 size={28} /> : <span className="font-ui font-black text-xl">{idx}</span>}
                            </div>
                            <span className={`font-arabic text-xs font-bold transition-colors ${isDone ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-tertiary)] opacity-60'}`}>
                                الورد {idx}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>

        <button
            onClick={handleFinishPortion}
            disabled={progress >= totalPortions}
            className="w-full py-5 bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] rounded-3xl font-arabic font-black text-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-30 group/btn relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
            <Award size={24} className={remainingToday === 0 ? 'text-[var(--color-highlight)]' : ''} />
            <span>{remainingToday === 0 ? 'سجل ورداً إضافياً للبركة' : 'أتممت ورداً الآن'}</span>
        </button>
    </div>
);

export default KhitmaMission;
