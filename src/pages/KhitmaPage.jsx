import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, PartyPopper, Share2, BookOpen, CheckCircle2 } from 'lucide-react';
import { generateKhitmaSchedule } from '../utils/quran-utils.js';
import { tapMedium, tapSuccess } from '../utils/haptics.js';


// Import modular components
import KhitmaHeader from '../components/khitma/KhitmaHeader.jsx';
import KhitmaPlanner from '../components/khitma/KhitmaPlanner.jsx';

export const KhitmaPage = ({ onBack, onNavigate, khitma, onUpdateKhitma }) => {
    // Planning State
    const [localPlan, setLocalPlan] = useState({
        days: khitma?.days || 30,
        startPage: khitma?.startPage || 1,
    });

    const [showCompletion, setShowCompletion] = useState(false);

    // Sync localPlan from props
    useEffect(() => {
        if (khitma && !khitma.isStarted) {
            setLocalPlan({
                days: khitma.days || 30,
                startPage: khitma.startPage || 1,
            });
        }
    }, [khitma]);

    // Check if entire Khitma is complete
    useEffect(() => {
        if (khitma?.isStarted && khitma?.schedule) {
            const allCompleted = khitma.schedule.every(day => day.isCompleted);
            if (allCompleted && !showCompletion) {
                setShowCompletion(true);
            }
        }
    }, [khitma, showCompletion]);

    const updateKhitmaState = (updates) => {
        if (!onUpdateKhitma) return;
        const newState = {
            ...khitma,
            ...updates
        };
        onUpdateKhitma(newState);
    };

    const handleStart = () => {
        const schedule = generateKhitmaSchedule(localPlan.days, localPlan.startPage);
        updateKhitmaState({
            isStarted: true,
            days: localPlan.days,
            startPage: localPlan.startPage,
            schedule: schedule,
            currentDayIndex: 0,
            startDate: new Date().toISOString().split('T')[0],
        });
    };

    const handleReadWird = () => {
        if (!khitma?.schedule || khitma.currentDayIndex === undefined) return;
        const currentWird = khitma.schedule[khitma.currentDayIndex];

        // Navigate to Mushaf at the start page of today's wird
        if (onNavigate) {
            onNavigate('mushaf', { page: currentWird.startPage });
        }
    };

    const handleMarkCompleted = () => {
        if (!khitma?.schedule || khitma.currentDayIndex === undefined) return;

        tapSuccess();
        const currentDayIdx = khitma.currentDayIndex;
        const schedule = [...khitma.schedule];

        // Mark current day as completed
        schedule[currentDayIdx] = {
            ...schedule[currentDayIdx],
            isCompleted: true,
            completedAt: new Date().toISOString()
        };

        // Advance to next day if available
        let nextDayIdx = currentDayIdx;
        if (currentDayIdx < schedule.length - 1) {
            nextDayIdx += 1;
        }

        updateKhitmaState({
            schedule,
            currentDayIndex: nextDayIdx
        });
    };

    const handleRestart = () => {
        if (window.confirm('هل أنت متأكد من إعادة تعيين الختمة؟')) {
            setShowCompletion(false);
            updateKhitmaState({
                isStarted: false,
                schedule: [],
                currentDayIndex: 0,
                startDate: null,
            });
        }
    };

    // Derived State
    const hasValidSchedule = khitma?.schedule && khitma.schedule.length > 0;
    const isActivelyReading = khitma?.isStarted && hasValidSchedule && !showCompletion;
    const currentWird = hasValidSchedule ? khitma.schedule[khitma.currentDayIndex] : null;

    const progressPercentage = hasValidSchedule
        ? Math.round((khitma.schedule.filter(d => d.isCompleted).length / khitma.schedule.length) * 100)
        : 0;

    return (
        <div className="min-h-screen pb-24 relative overflow-x-hidden bg-[var(--color-bg-primary)]" dir="rtl">

            <KhitmaHeader
                onBack={onBack}
                isStarted={isActivelyReading}
                currentStreak={0} // Streak logic simplified out
                completedKhitmas={khitma?.completedKhitmas || 0}
                progressPercentage={progressPercentage}
            />

            <main className="relative max-w-4xl mx-auto px-6 py-10 space-y-12">

                {/* ─── COMPLETION CELEBRATION ─── */}
                {showCompletion && (
                    <div className="animate-fade-in-up">
                        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl p-8 md:p-12 shadow-sm text-center space-y-8 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/5 via-transparent to-[var(--color-highlight)]/5"></div>

                            <div className="relative z-10 space-y-6">
                                <div className="w-24 h-24 mx-auto rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center shadow-sm">
                                    <PartyPopper size={48} className="text-white" />
                                </div>
                                <h2 className="font-arabic font-black text-4xl text-[var(--color-text-primary)]">مبارك! أتممت الختمة 🎉</h2>
                                <p className="font-arabic text-lg text-[var(--color-text-secondary)] max-w-md mx-auto">
                                    تقبل الله منك وجعله في ميزان حسناتك
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={() => {
                                            setShowCompletion(false);
                                            updateKhitmaState({
                                                isStarted: false,
                                                schedule: [],
                                                currentDayIndex: 0,
                                                startDate: null,
                                                completedKhitmas: (khitma?.completedKhitmas || 0) + 1,
                                            });
                                        }}
                                        className="flex-1 py-5 bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] rounded-2xl font-arabic font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        ابدأ ختمة جديدة
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── PLANNER (Not Started or Invalid Data) ─── */}
                {!isActivelyReading && !showCompletion && (
                    <div className="animate-fade-in-up">
                        <KhitmaPlanner
                            days={localPlan.days}
                            setDays={(val) => setLocalPlan(p => ({ ...p, days: val }))}
                            startPage={localPlan.startPage}
                            setStartPage={(val) => setLocalPlan(p => ({ ...p, startPage: val }))}
                            handleStart={handleStart}
                        />
                    </div>
                )}

                {/* ─── ACTIVE KHITMA (Today's Wird) ─── */}
                {isActivelyReading && currentWird && (
                    <div className="animate-fade-in space-y-12">

                        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl p-6 md:p-10 shadow-sm space-y-8 relative overflow-hidden group">

                            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-[var(--color-highlight)]/10 text-[var(--color-highlight)] flex items-center justify-center">
                                        <BookOpen size={28} />
                                    </div>
                                    <div>
                                        <h4 className="font-arabic font-black text-3xl text-[var(--color-text-primary)]">ورد اليوم</h4>
                                        <p className="text-sm font-arabic font-bold text-[var(--color-text-tertiary)] mt-1">
                                            اليوم {currentWird.day} من {khitma.days}
                                        </p>
                                    </div>
                                </div>
                                <div className="w-16 h-16 rounded-full border-4 border-[var(--color-border)] flex items-center justify-center">
                                    <span className="font-ui font-black text-xl text-[var(--color-text-secondary)]">{progressPercentage}%</span>
                                </div>
                            </div>

                            <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-8 text-center space-y-4">
                                <p className="font-arabic font-bold text-lg text-[var(--color-text-secondary)]">نطاق القراءة</p>
                                <div className="flex items-center justify-center gap-6">
                                    <div className="space-y-1">
                                        <p className="font-arabic text-sm opacity-60">الورد يبدأ من</p>
                                        <p className="font-arabic font-black text-2xl text-[var(--color-accent)]">صفحة {currentWird.startPage}</p>
                                    </div>
                                    <div className="w-12 h-px bg-black/20 dark:bg-white/20"></div>
                                    <div className="space-y-1">
                                        <p className="font-arabic text-sm opacity-60">إلى غاية</p>
                                        <p className="font-arabic font-black text-2xl text-[var(--color-text-primary)]">صفحة {currentWird.endPage}</p>
                                    </div>
                                </div>
                                <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/5 mx-auto max-w-xs">
                                    <p className="font-arabic font-bold text-sm text-[var(--color-text-tertiary)]">
                                        الإجمالي: {currentWird.pagesCount} صفحات
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={handleReadWird}
                                    className="w-full py-5 bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] rounded-2xl font-arabic font-black text-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    <BookOpen size={24} />
                                    اقرأ الورد الآن
                                </button>

                                <button
                                    onClick={handleMarkCompleted}
                                    className="w-full py-5 bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 rounded-2xl font-arabic font-black text-lg hover:bg-[var(--color-accent)]/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    <CheckCircle2 size={24} />
                                    قرأته من المصحف الورقي
                                </button>
                            </div>

                            <p className="text-center text-[11px] font-arabic text-[var(--color-text-tertiary)] opacity-60 pt-2">
                                💡 إذا قرأت الورد داخل التطبيق، سيتم تعليمه كمقروء تلقائياً عند تجاوز الصفحة {currentWird.endPage}.
                            </p>
                        </div>

                        {/* Reset Plan */}
                        <div className="pt-8 flex justify-center">
                            <button
                                onClick={handleRestart}
                                className="px-6 py-2 rounded-xl border border-dashed border-[var(--color-error)]/30 text-[var(--color-error)] font-arabic font-bold text-sm hover:bg-[var(--color-error)]/10 transition-all"
                            >
                                تعديل أو إلغاء خطة الختمة
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer Spiritual Message */}
                <div className="pt-10 flex flex-col items-center text-center space-y-8">
                    <div className="w-px h-16 bg-gradient-to-b from-[var(--color-accent)]/30 to-transparent"></div>
                    <div className="max-w-[85%] mx-auto relative">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl text-[var(--color-highlight)]/20 font-arabic">"</div>
                        <p className="font-arabic text-[var(--color-text-secondary)] italic leading-relaxed text-lg md:text-xl opacity-90">
                            "يقال لصاحب القرآن اقرأ وارتق ورتل كما كنت ترتل في الدنيا فإن منزلتك عند آخر آية تقرؤها"
                        </p>
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-4xl text-[var(--color-highlight)]/20 font-arabic rotate-180">"</div>
                    </div>
                    <div className="flex items-center gap-3 text-[var(--color-accent)] bg-[var(--color-accent)]/5 px-6 py-2 rounded-full border border-[var(--color-accent)]/10">
                        <Sparkles size={16} className="animate-pulse" />
                        <span className="text-xs font-arabic font-bold">رزقكم الله القبول</span>
                    </div>
                </div>
            </main>
        </div>
    );
};
