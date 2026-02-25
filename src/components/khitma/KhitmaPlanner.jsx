import React from 'react';
import { Compass, Clock, Target, Hash } from 'lucide-react';

const KhitmaPlanner = ({
    days,
    setDays,
    startPage,
    setStartPage,
    handleStart
}) => {
    // We assume 604 pages total
    const TOTAL_PAGES = 604;

    // Calculate daily target preview
    const basePagesPerDay = Math.floor(TOTAL_PAGES / Math.max(1, days));
    const remainder = TOTAL_PAGES % Math.max(1, days);
    const maxPagesPerDay = basePagesPerDay + (remainder > 0 ? 1 : 0);

    // Estimated end date
    const getEndDatePreview = () => {
        const end = new Date();
        end.setDate(end.getDate() + Math.max(1, days));
        return end.toLocaleDateString('ar-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const todayFormatted = new Date().toLocaleDateString('ar-u-nu-latn', { day: 'numeric', month: 'long' });

    return (
        <div className="animate-fade-in space-y-8">
            {/* Landing Hero */}
            <div className="relative bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-8 md:p-10 rounded-3xl shadow-sm text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-highlight)]/20 text-[var(--color-highlight)] flex items-center justify-center">
                    <Compass size={40} />
                </div>
                <h2 className="font-reem-kufi-fun text-3xl text-[var(--color-text-primary)] mb-2">إعداد الختمة</h2>
                <p className="font-arabic text-[var(--color-text-secondary)] opacity-80">صمم وردك اليومي للختم بكل يسر</p>
            </div>

            {/* Planner Section */}
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl p-8 space-y-10 shadow-sm">

                {/* Setting 1: Days */}
                <div className="space-y-6 text-center">
                    <label className="font-arabic font-bold text-lg text-[var(--color-text-primary)]">
                        في كم يوم تريد أن تختم القرآن؟
                    </label>
                    <div className="flex items-center justify-center gap-4">
                        <input
                            type="number"
                            min="1"
                            max="1000"
                            value={days}
                            onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 30))}
                            className="w-32 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 text-center font-ui font-black text-4xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                        />
                        <span className="font-arabic font-bold text-2xl text-[var(--color-text-secondary)]">يوماً</span>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                        {[7, 10, 15, 30, 60].map(d => (
                            <button
                                key={d}
                                onClick={() => setDays(d)}
                                className={`px-5 py-2.5 rounded-xl border-2 transition-all duration-300 font-ui font-black ${days === d
                                        ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white shadow-md scale-105'
                                        : 'border-black/5 dark:border-white/10 text-[var(--color-text-tertiary)] hover:border-[var(--color-accent)]/30'
                                    }`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-full h-px bg-black/5 dark:bg-white/5"></div>

                {/* Setting 2: Start Page */}
                <div className="space-y-6 text-center">
                    <label className="font-arabic font-bold text-lg text-[var(--color-text-primary)]">
                        من أي صفحة تريد أن تبدأ؟
                    </label>
                    <div className="flex items-center justify-center gap-4">
                        <input
                            type="number"
                            min="1"
                            max="604"
                            value={startPage}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val)) {
                                    setStartPage(Math.min(604, Math.max(1, val)));
                                }
                            }}
                            className="w-32 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 text-center font-ui font-black text-4xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-highlight)]"
                        />
                        <Hash className="text-[var(--color-text-secondary)] opacity-50" size={28} />
                    </div>
                    <p className="text-xs font-arabic text-[var(--color-text-tertiary)] max-w-xs mx-auto">
                        القرآن الكريم يتكون من 604 صفحات. القيمة الافتراضية هي الصفحة الأولى (الفاتحة).
                    </p>
                </div>

                {/* Preview Summary */}
                <div className="bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 p-6 rounded-2xl space-y-4">
                    <h3 className="font-arabic font-bold text-center text-[var(--color-accent)] text-lg mb-4">ملخص خطتك</h3>

                    <div className="flex justify-between items-center bg-white/50 dark:bg-black/20 p-4 rounded-xl">
                        <span className="font-arabic font-medium text-[var(--color-text-secondary)]">الورد اليومي</span>
                        <span className="font-ui font-black text-xl text-[var(--color-text-primary)]">
                            {basePagesPerDay} - {maxPagesPerDay} <span className="text-sm font-arabic font-normal">صفحات</span>
                        </span>
                    </div>

                    <div className="flex justify-between items-center bg-white/50 dark:bg-black/20 p-4 rounded-xl">
                        <span className="font-arabic font-medium text-[var(--color-text-secondary)]">موعد الختم المتوقع</span>
                        <span className="font-arabic font-bold text-[var(--color-text-primary)]">{getEndDatePreview()}</span>
                    </div>
                </div>

            </div>

            {/* Start Button */}
            <button
                onClick={handleStart}
                className="w-full py-6 bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] rounded-3xl font-arabic font-black text-2xl shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-4"
            >
                <Target size={28} />
                <span>اعقد النية وابدأ</span>
            </button>
        </div>
    );
};

export default KhitmaPlanner;
