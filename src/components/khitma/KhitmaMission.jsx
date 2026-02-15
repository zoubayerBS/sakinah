import React from 'react';
import { Sparkles, CheckCircle2, Heart } from 'lucide-react';

const KhitmaMission = ({ remainingToday, todayPortions, handleFinishPortion, progress, totalPortions }) => (
    <div className="bg-[var(--color-bg-secondary)]/90 border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Sparkles size={18} className="text-[var(--color-highlight)]" />
                <h4 className="font-arabic font-bold text-[var(--color-text-primary)]">أوراد اليوم</h4>
            </div>
            <span className="text-[10px] font-arabic text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] px-3 py-1 rounded-full border border-[var(--color-border)]">
                {remainingToday > 0 ? `باقي ${remainingToday}` : 'تمت المهمة ✨'}
            </span>
        </div>

        <div className="overflow-x-auto no-scrollbar -mx-2 px-2 pb-4 touch-pan-x">
            <div className="flex items-center gap-4 min-w-max">
                {[1, 2, 3, 4, 5].map(idx => (
                    <div key={idx} className="flex flex-col items-center gap-2 group shrink-0">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-500
                            ${idx <= todayPortions ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white shadow-md' : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border)] text-[var(--color-text-tertiary)]'}
                        `}>
                            {idx <= todayPortions ? <CheckCircle2 size={24} /> : <span className="font-ui font-bold">{idx}</span>}
                        </div>
                        <span className={`font-arabic text-[9px] ${idx <= todayPortions ? 'text-[var(--color-accent)] font-bold' : 'text-[var(--color-text-tertiary)] opacity-60'}`}>الورد {idx}</span>
                    </div>
                ))}
            </div>
        </div>

        <button
            onClick={handleFinishPortion}
            disabled={progress >= totalPortions}
            className="w-full py-4 bg-[var(--color-accent)] text-white rounded-full font-arabic font-bold text-lg shadow-[var(--shadow-sm)] hover:opacity-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
        >
            <Heart size={20} className={remainingToday === 0 ? 'fill-current' : ''} />
            {remainingToday === 0 ? 'سجل ورداً إضافياً' : 'أتممت ورداً الآن'}
        </button>
    </div>
);

export default KhitmaMission;
