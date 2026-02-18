import React from 'react';
import { Trophy, Star } from 'lucide-react';

const KhitmaStats = ({ currentJuz, progressPercentage, results, progress }) => (
    <div className="glass-premium rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[var(--color-highlight)]/10 blur-3xl group-hover:bg-[var(--color-highlight)]/20 transition-colors"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 relative z-10">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-highlight)] to-[var(--color-accent)] text-white flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-500">
                    <Trophy size={32} />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Star size={14} className="text-[var(--color-highlight)] fill-[var(--color-highlight)]" />
                        <span className="text-xs font-bold text-[var(--color-highlight)] uppercase tracking-wider">المرحلة الحالية</span>
                    </div>
                    <h3 className="font-arabic font-black text-3xl text-[var(--color-text-primary)]">الجزء {currentJuz}</h3>
                    <p className="font-arabic text-sm text-[var(--color-text-secondary)] opacity-80">أنت تبلي بلاءً حسناً في رحلتك</p>
                </div>
            </div>

            <div className="flex gap-4 md:text-right">
                <div className="bg-black/5 dark:bg-white/5 px-6 py-4 rounded-3xl border border-white/10">
                    <p className="font-arabic text-xs text-[var(--color-text-tertiary)] mb-1">المتبقي</p>
                    <p className="font-ui font-black text-2xl text-[var(--color-accent)]">{results.totalPortions - progress} <span className="text-sm opacity-60">ورد</span></p>
                </div>
                <div className="bg-black/5 dark:bg-white/5 px-6 py-4 rounded-3xl border border-white/10">
                    <p className="font-arabic text-xs text-[var(--color-text-tertiary)] mb-1">الإجمالي</p>
                    <p className="font-ui font-black text-2xl text-[var(--color-text-primary)]">{results.totalPortions}</p>
                </div>
            </div>
        </div>

        <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-[var(--color-text-primary)] bg-[var(--color-accent)]/10 px-4 py-1 rounded-full text-[var(--color-accent)]">
                    {progressPercentage}% من الختمة
                </span>
                <span className="text-xs font-ui font-bold opacity-40">604 صفحة</span>
            </div>
            <div className="w-full h-4 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden shadow-inner p-1">
                <div
                    className="h-full bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-highlight)] to-[var(--color-accent)] transition-all duration-1000 ease-out liquid-progress shadow-[0_0_20px_rgba(201,162,39,0.3)] rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
        </div>
    </div>
);

export default KhitmaStats;
