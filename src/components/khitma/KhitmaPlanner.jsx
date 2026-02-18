import React from 'react';
import { Compass, Clock, Target, Calendar } from 'lucide-react';

const KhitmaPlanner = ({
    planType,
    setPlanType,
    days,
    setDays,
    targetDate,
    setTargetDate,
    results,
    mode,
    setMode,
    handleStart
}) => (
    <div className="animate-fade-in space-y-10">
        {/* Landing Hero */}
        <div className="relative glass-premium p-10 md:p-12 rounded-[3rem] shadow-2xl overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-highlight)]/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-highlight)]/20 border border-[var(--color-highlight)]/30 flex items-center justify-center text-[var(--color-highlight)] shadow-inner transform group-hover:scale-110 transition-transform duration-700">
                    <Compass size={48} />
                </div>
                <div>
                    <h2 className="font-reem-kufi-fun text-4xl text-[var(--color-text-primary)] mb-2">رحلة الختمة</h2>
                    <p className="font-arabic text-lg text-[var(--color-text-secondary)] opacity-80 max-w-md">خطط لمسارك المبارك في تلاوة كتاب الله العظيم</p>
                </div>
            </div>
        </div>

        {/* Planning Tabs */}
        <div className="flex bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl p-2 w-fit mx-auto shadow-inner">
            <button
                onClick={() => setPlanType('days')}
                className={`px-8 py-3 rounded-2xl font-arabic font-bold text-sm transition-all duration-500 ${planType === 'days' ? 'bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] shadow-lg scale-105' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'}`}
            >
                بعدد الأيام
            </button>
            <button
                onClick={() => setPlanType('date')}
                className={`px-8 py-3 rounded-2xl font-arabic font-bold text-sm transition-all duration-500 ${planType === 'date' ? 'bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] shadow-lg scale-105' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'}`}
            >
                بتاريخ محدد
            </button>
        </div>

        {/* Planner Section */}
        <div className="glass-premium rounded-[3rem] p-8 md:p-12 space-y-10 shadow-2xl relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--color-accent)]/5 rounded-full blur-[60px] -ml-24 -mb-24"></div>

            {planType === 'days' ? (
                <div className="space-y-8 text-center relative z-10">
                    <p className="font-arabic font-bold text-lg text-[var(--color-text-secondary)]">خلال كم يوم تود الختم؟</p>
                    <div className="flex items-center justify-center gap-6">
                        <input
                            type="number"
                            value={days}
                            onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-40 bg-transparent text-center font-ui font-black text-7xl md:text-8xl text-[var(--color-text-primary)] focus:outline-none selection:bg-[var(--color-accent)]/20"
                        />
                        <span className="font-arabic font-black text-3xl text-[var(--color-accent)] pt-8">يوماً</span>
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {[7, 10, 15, 30, 60].map(d => (
                            <button
                                key={d}
                                onClick={() => setDays(d)}
                                className={`px-6 py-3 rounded-2xl border-2 transition-all duration-500 text-base font-ui font-black ${days === d ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white shadow-xl scale-110' : 'border-black/5 dark:border-white/10 text-[var(--color-text-tertiary)] hover:border-[var(--color-accent)]/30'}`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-6 text-center relative z-10">
                    <label className="font-arabic font-black text-xl text-[var(--color-text-secondary)] block">اختر الموعد الختامي</label>
                    <div className="relative max-w-md mx-auto">
                        <input
                            type="date"
                            value={targetDate}
                            onChange={(e) => setTargetDate(e.target.value)}
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl py-6 px-10 text-center font-ui font-black text-2xl text-[var(--color-accent)] outline-none focus:border-[var(--color-accent)] transition-all appearance-none"
                        />
                        <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--color-accent)] pointer-events-none" size={24} />
                    </div>
                </div>
            )}

            <div className="pt-8 border-t border-black/5 dark:border-white/5 relative z-10">
                <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--color-highlight)]/10 flex items-center justify-center text-[var(--color-highlight)] shadow-inner">
                            <Clock size={28} />
                        </div>
                        <div>
                            <p className="font-arabic text-sm text-[var(--color-text-tertiary)] font-bold">الورد اليومي المقترح</p>
                            <p className="font-arabic font-black text-2xl text-[var(--color-text-primary)]">
                                {results.daily} {mode === 'pages' ? 'صفحة' : 'آية'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setMode(mode === 'pages' ? 'verses' : 'pages')}
                        className="font-arabic font-bold text-sm px-6 py-2 rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 hover:bg-[var(--color-accent)]/20 transition-all"
                    >
                        تبديل للآيات
                    </button>
                </div>
            </div>
        </div>
        <button
            onClick={handleStart}
            className="w-full py-6 bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] rounded-[2.5rem] font-arabic font-black text-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
            <Target size={28} />
            <span>اعقد النية وابدأ الرحلة</span>
        </button>
    </div>
);

export default KhitmaPlanner;
