import React from 'react';
import { Trophy, Star, CalendarDays, TrendingUp, Target } from 'lucide-react';

const KhitmaStats = ({
    currentJuz,
    progressPercentage,
    results,
    progress,
    daysElapsed,
    dailyAverage,
    estimatedEnd,
    weeklyHistory,
    mode
}) => {
    const unitLabel = mode === 'pages' ? 'صفحة' : 'آية';
    const maxBarValue = weeklyHistory ? Math.max(...weeklyHistory.map(d => d.value), weeklyHistory[0]?.target || 1) : 1;

    return (
        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden group">

            {/* Top: Current Juz & Overall Progress */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8 relative z-10">
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
                    </div>
                </div>
            </div>

            {/* Stats Row: 3 Key Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-8 relative z-10">
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl text-center border border-black/5 dark:border-white/5">
                    <CalendarDays size={18} className="mx-auto mb-2 text-[var(--color-accent)] opacity-70" />
                    <p className="font-ui font-black text-2xl text-[var(--color-text-primary)]">{daysElapsed || 0}</p>
                    <p className="font-arabic text-[10px] font-bold text-[var(--color-text-tertiary)] mt-1">يوم منذ البداية</p>
                </div>
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl text-center border border-black/5 dark:border-white/5">
                    <TrendingUp size={18} className="mx-auto mb-2 text-[var(--color-highlight)] opacity-70" />
                    <p className="font-ui font-black text-2xl text-[var(--color-text-primary)]">{dailyAverage || 0}</p>
                    <p className="font-arabic text-[10px] font-bold text-[var(--color-text-tertiary)] mt-1">معدل يومي ({unitLabel})</p>
                </div>
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl text-center border border-black/5 dark:border-white/5">
                    <Target size={18} className="mx-auto mb-2 text-[var(--color-accent)] opacity-70" />
                    <p className="font-arabic font-black text-sm text-[var(--color-text-primary)] leading-tight">{estimatedEnd || '—'}</p>
                    <p className="font-arabic text-[10px] font-bold text-[var(--color-text-tertiary)] mt-1">موعد الإنتهاء المتوقع</p>
                </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-3 relative z-10 mb-8">
                <div className="flex justify-between items-end">
                    <span className="text-sm font-bold bg-[var(--color-accent)]/10 px-4 py-1 rounded-full text-[var(--color-accent)]">
                        {Math.round(progressPercentage)}% من الختمة
                    </span>
                    <span className="text-xs font-arabic font-bold opacity-40">{progress} / {results.totalUnits} {unitLabel}</span>
                </div>
                <div className="w-full h-4 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden shadow-inner p-1">
                    <div
                        className="h-full bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-highlight)] to-[var(--color-accent)] transition-all duration-1000 ease-out liquid-progress shadow-[0_0_20px_rgba(201,162,39,0.3)] rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Weekly Mini Chart */}
            {weeklyHistory && weeklyHistory.length > 0 && (
                <div className="relative z-10 pt-6 border-t border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-5 rounded-full bg-[var(--color-accent)]"></div>
                        <h4 className="font-arabic font-bold text-sm text-[var(--color-text-primary)]">آخر 7 أيام</h4>
                    </div>
                    <div className="flex items-end justify-between gap-2 h-28">
                        {weeklyHistory.map((day, i) => {
                            const height = maxBarValue > 0 ? Math.max(4, (day.value / maxBarValue) * 100) : 4;
                            const isToday = i === weeklyHistory.length - 1;
                            const metTarget = day.value >= day.target && day.target > 0;
                            return (
                                <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                                    <span className={`text-[9px] font-ui font-bold tabular-nums ${day.value > 0 ? 'text-[var(--color-text-primary)]' : 'opacity-30'}`}>
                                        {day.value > 0 ? day.value : ''}
                                    </span>
                                    <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                                        <div
                                            className={`w-full max-w-[28px] rounded-lg transition-all duration-700 ${metTarget
                                                ? 'bg-gradient-to-t from-[var(--color-accent)] to-[var(--color-highlight)] shadow-[0_0_8px_var(--color-accent)]'
                                                : isToday
                                                    ? 'bg-[var(--color-accent)]/60'
                                                    : 'bg-black/10 dark:bg-white/10'
                                                }`}
                                            style={{ height: `${height}%`, minHeight: '4px' }}
                                        ></div>
                                    </div>
                                    <span className={`text-[9px] font-arabic font-bold ${isToday ? 'text-[var(--color-accent)]' : 'opacity-40'}`}>
                                        {day.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    {/* Target line label */}
                    {weeklyHistory[0]?.target > 0 && (
                        <div className="flex items-center gap-2 mt-3 justify-end">
                            <div className="w-4 h-0.5 bg-[var(--color-accent)]/40 rounded"></div>
                            <span className="text-[9px] font-arabic opacity-40">الهدف: {weeklyHistory[0].target} {unitLabel}/يوم</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default KhitmaStats;
