import React from 'react';
import { Trophy } from 'lucide-react';

const KhitmaStats = ({ currentJuz, progressPercentage, results, progress }) => (
    <div className="p-8 bg-[var(--color-bg-secondary)]/90 border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[var(--color-highlight)]/10 flex items-center justify-center text-[var(--color-highlight)]">
                    <Trophy size={28} />
                </div>
                <div>
                    <h3 className="font-arabic font-bold text-lg text-[var(--color-text-primary)]">الجزء {currentJuz}</h3>
                    <p className="font-arabic text-xs text-[var(--color-text-tertiary)]">التقدم: {progressPercentage}%</p>
                </div>
            </div>
            <div className="text-right">
                <p className="font-arabic text-xs text-[var(--color-text-tertiary)] mb-1">المتبقي</p>
                <p className="font-ui font-black text-xl text-[var(--color-accent)]">{results.totalPortions - progress}</p>
            </div>
        </div>

        <div className="w-full h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
            <div
                className="h-full bg-[var(--color-accent)] transition-all duration-1000 shadow-[0_0_8px_var(--color-accent)]"
                style={{ width: `${progressPercentage}%` }}
            ></div>
        </div>
    </div>
);

export default KhitmaStats;
