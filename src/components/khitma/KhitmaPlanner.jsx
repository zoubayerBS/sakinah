import React from 'react';
import { Compass, Clock, Target } from 'lucide-react';

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
    <div className="animate-fade-in space-y-8">
        {/* Landing Hero */}
        <div className="relative p-8 bg-[var(--color-bg-secondary)]/90 border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] overflow-hidden">
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)]">
                    <Compass size={40} />
                </div>
                <div>
                    <h2 className="font-reem-kufi-fun text-3xl text-[var(--color-text-primary)]">رحلة الختمة</h2>
                    <p className="font-arabic text-[var(--color-text-secondary)] mt-1">خطط لمسارك in تلاوة كتاب الله</p>
                </div>
            </div>
        </div>

        {/* Planning Tabs */}
        <div className="flex gap-3 bg-[var(--color-bg-secondary)]/80 border border-[var(--color-border)] rounded-full p-2 w-fit mx-auto">
            <button
                onClick={() => setPlanType('days')}
                className={`px-6 py-2 rounded-full font-arabic text-sm transition-all border ${planType === 'days' ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-sm' : 'text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)]'}`}
            >
                بعدد الأيام
            </button>
            <button
                onClick={() => setPlanType('date')}
                className={`px-6 py-2 rounded-full font-arabic text-sm transition-all border ${planType === 'date' ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-sm' : 'text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)]'}`}
            >
                بتاريخ محدد
            </button>
        </div>

        {/* Planner Section */}
        <div className="bg-[var(--color-bg-secondary)]/90 border border-[var(--color-border)] rounded-[var(--radius-lg)] p-8 space-y-8">
            {planType === 'days' ? (
                <div className="space-y-6 text-center">
                    <p className="font-arabic text-sm text-[var(--color-text-tertiary)]">خلال كم يوم تود الختم؟</p>
                    <div className="flex items-center justify-center gap-4">
                        <input
                            type="number"
                            value={days}
                            onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-32 bg-transparent text-center font-ui font-black text-6xl text-[var(--color-text-primary)] focus:outline-none"
                        />
                        <span className="font-arabic font-bold text-2xl text-[var(--color-accent)] pt-4">يوماً</span>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {[7, 10, 15, 30, 60].map(d => (
                            <button
                                key={d}
                                onClick={() => setDays(d)}
                                className={`px-5 py-2 rounded-full border transition-all text-sm font-ui font-bold ${days === d ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white shadow-sm' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-text-secondary)]'}`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <label className="font-arabic font-bold text-[var(--color-text-secondary)] block text-center">اختر الموعد المستهدف</label>
                    <input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-[var(--radius-md)] py-4 px-6 text-center font-ui font-bold text-lg text-[var(--color-accent)] outline-none"
                    />
                </div>
            )}

            <div className="pt-6 border-t border-[var(--color-divider)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[var(--color-highlight)]/10 flex items-center justify-center text-[var(--color-highlight)]">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="font-arabic text-xs text-[var(--color-text-tertiary)]">الورد اليومي</p>
                            <p className="font-arabic font-bold text-lg text-[var(--color-text-primary)]">
                                {results.daily} {mode === 'pages' ? 'صفحة' : 'آية'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setMode(mode === 'pages' ? 'verses' : 'pages')}
                        className="text-[10px] font-arabic px-3 py-1 rounded-full border border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-colors"
                    >
                        تبديل للآيات
                    </button>
                </div>
            </div>
        </div>

        <button
            onClick={handleStart}
            className="w-full py-5 bg-[var(--color-accent)] text-white rounded-full font-arabic font-bold text-xl shadow-[var(--shadow-md)] hover:opacity-95 transition-all flex items-center justify-center gap-4"
        >
            <Target size={24} />
            اعقد النية وابدأ
        </button>
    </div>
);

export default KhitmaPlanner;
