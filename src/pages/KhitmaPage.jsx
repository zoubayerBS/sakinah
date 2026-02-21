import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Compass, Sparkles, PartyPopper, RotateCcw, Share2 } from 'lucide-react';
import { calculateWirdProgress, calculateKhitmaProgress, getKhitmaDailyTarget, getDaysElapsed, getDailyAverage, getEstimatedEndDate, isKhitmaComplete, getWeeklyHistory } from '../utils/quran-utils.js';
import { tapMedium, tapSuccess } from '../utils/haptics.js';

// Import modular components
import KhitmaHeader from '../components/khitma/KhitmaHeader.jsx';
import KhitmaPlanner from '../components/khitma/KhitmaPlanner.jsx';
import KhitmaStats from '../components/khitma/KhitmaStats.jsx';
import KhitmaJourney from '../components/khitma/KhitmaJourney.jsx';

export const KhitmaPage = ({ onBack, khitma, onUpdateKhitma }) => {
    // 1. Constants
    const TOTAL_PAGES = 604;
    const TOTAL_VERSES = 6236;
    const JUZ_TOTAL = 30;

    // 2. Planning State (local until started)
    const [localPlan, setLocalPlan] = useState({
        days: khitma?.days || 30,
        planType: khitma?.planType || 'days',
        targetDate: khitma?.targetDate || '',
        mode: khitma?.mode || 'pages',
    });

    const [results, setResults] = useState({ daily: 0, perPrayer: 0, totalUnits: 0 });
    const [showCompletion, setShowCompletion] = useState(false);

    // 3. Sync localPlan from props
    useEffect(() => {
        if (khitma) {
            setLocalPlan({
                days: khitma.days || 30,
                planType: khitma.planType || 'days',
                targetDate: khitma.targetDate || '',
                mode: khitma.mode || 'pages',
            });
        }
    }, [khitma]);

    // 4. Calculations
    useEffect(() => {
        const total = localPlan.mode === 'pages' ? TOTAL_PAGES : TOTAL_VERSES;
        const daily = Math.ceil(total / localPlan.days);
        const perPrayer = Math.ceil(daily / 5);
        setResults({ daily, perPrayer, totalUnits: total });
    }, [localPlan.days, localPlan.mode]);

    useEffect(() => {
        if (localPlan.planType !== 'date' || !localPlan.targetDate) return;
        const target = new Date(localPlan.targetDate);
        if (Number.isNaN(target.getTime())) return;
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const end = new Date(target.getFullYear(), target.getMonth(), target.getDate());
        const diffDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        if (diffDays !== localPlan.days) {
            setLocalPlan(prev => ({ ...prev, days: diffDays }));
        }
    }, [localPlan.planType, localPlan.targetDate, localPlan.days]);

    // 5. Detect completion
    useEffect(() => {
        if (khitma?.isStarted && isKhitmaComplete(khitma) && !showCompletion) {
            setShowCompletion(true);
        }
    }, [khitma]);

    // 6. Handlers
    const updateKhitmaState = (updates) => {
        if (!onUpdateKhitma) return;
        const newState = {
            ...localPlan,
            isStarted: khitma?.isStarted || false,
            progress: khitma?.progress || 0,
            progressLog: khitma?.progressLog || {},
            startDate: khitma?.startDate || null,
            lastReadPage: khitma?.lastReadPage || 0,
            completedKhitmas: khitma?.completedKhitmas || 0,
            ...updates
        };
        onUpdateKhitma(newState);
    };

    const handleStart = () => {
        if (localPlan.planType === 'date' && !localPlan.targetDate) return;
        updateKhitmaState({
            isStarted: true,
            progress: 0,
            progressLog: {},
            startDate: new Date().toISOString().split('T')[0],
            lastReadPage: 0,
        });
    };

    const handleReset = () => {
        if (window.confirm('إعادة ضبط خطة الختمة؟')) {
            setShowCompletion(false);
            updateKhitmaState({
                isStarted: false,
                progress: 0,
                progressLog: {},
                startDate: null,
                lastReadPage: 0,
            });
        }
    };

    const handleCompleteAndRestart = () => {
        setShowCompletion(false);
        updateKhitmaState({
            isStarted: true,
            progress: 0,
            progressLog: {},
            startDate: new Date().toISOString().split('T')[0],
            lastReadPage: 0,
            completedKhitmas: (khitma?.completedKhitmas || 0) + 1,
        });
    };

    const handleLogProgress = (amount = 1) => {
        tapMedium();
        const currentProgress = khitma?.progress || 0;
        if (currentProgress < results.totalUnits) {
            const todayKey = new Date().toISOString().split('T')[0];
            updateKhitmaState({
                progress: Math.min(results.totalUnits, currentProgress + amount),
                progressLog: {
                    ...(khitma?.progressLog || {}),
                    [todayKey]: ((khitma?.progressLog || {})[todayKey] || 0) + amount
                }
            });
        }
    };

    // 7. Derived Values
    const progressPercentage = useMemo(() => Math.round(calculateKhitmaProgress(khitma)), [khitma]);
    const currentJuz = Math.min(30, Math.floor((progressPercentage / 100) * JUZ_TOTAL) + 1);
    const todayKey = new Date().toISOString().split('T')[0];
    const todayProgress = khitma?.progressLog?.[todayKey] || 0;
    const dailyTarget = results.daily;
    const remainingToday = Math.max(0, dailyTarget - todayProgress);
    const daysElapsed = getDaysElapsed(khitma);
    const dailyAverage = getDailyAverage(khitma);
    const estimatedEnd = getEstimatedEndDate(khitma);
    const weeklyHistory = getWeeklyHistory(khitma);

    const computeStreak = useCallback(() => {
        const log = khitma?.progressLog || {};
        let streak = 0;
        const date = new Date();
        const todayCount = log[date.toISOString().split('T')[0]] || 0;
        if (todayCount < dailyTarget) date.setDate(date.getDate() - 1);
        while (streak < 1000) {
            const key = date.toISOString().split('T')[0];
            if ((log[key] || 0) >= dailyTarget) {
                streak += 1;
                date.setDate(date.getDate() - 1);
            } else break;
        }
        return streak;
    }, [khitma?.progressLog, dailyTarget]);
    const currentStreak = useMemo(() => computeStreak(), [computeStreak]);

    // Format date for display (Latin script)
    const formatDate = (d) => {
        if (!d) return '—';
        const date = d instanceof Date ? d : new Date(d);
        return date.toLocaleDateString('ar-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="min-h-screen pb-24 relative overflow-x-hidden bg-[var(--color-bg-primary)]" dir="rtl">

            <KhitmaHeader
                onBack={onBack}
                isStarted={khitma?.isStarted}
                currentStreak={currentStreak}
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

                                <div className="flex flex-wrap gap-4 justify-center">
                                    <div className="bg-black/5 dark:bg-white/5 px-6 py-4 rounded-2xl text-center">
                                        <p className="font-ui font-black text-3xl text-[var(--color-accent)]">{daysElapsed}</p>
                                        <p className="text-xs font-arabic opacity-50">يوم</p>
                                    </div>
                                    <div className="bg-black/5 dark:bg-white/5 px-6 py-4 rounded-2xl text-center">
                                        <p className="font-ui font-black text-3xl text-[var(--color-highlight)]">{dailyAverage}</p>
                                        <p className="text-xs font-arabic opacity-50">معدل يومي</p>
                                    </div>
                                    <div className="bg-black/5 dark:bg-white/5 px-6 py-4 rounded-2xl text-center">
                                        <p className="font-ui font-black text-3xl text-[var(--color-text-primary)]">{(khitma?.completedKhitmas || 0) + 1}</p>
                                        <p className="text-xs font-arabic opacity-50">ختمة</p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={handleCompleteAndRestart}
                                        className="flex-1 py-5 bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] rounded-2xl font-arabic font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        <RotateCcw size={20} />
                                        ابدأ ختمة جديدة
                                    </button>
                                    <button
                                        onClick={() => setShowCompletion(false)}
                                        className="flex-1 py-5 bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 rounded-2xl font-arabic font-black text-lg hover:bg-[var(--color-accent)]/20 transition-all flex items-center justify-center gap-3"
                                    >
                                        <Share2 size={20} />
                                        شارك الإنجاز
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── PLANNER (Not Started) ─── */}
                {!khitma?.isStarted && !showCompletion && (
                    <div className="animate-fade-in-up">
                        <KhitmaPlanner
                            planType={localPlan.planType}
                            setPlanType={(val) => setLocalPlan(p => ({ ...p, planType: val }))}
                            days={localPlan.days}
                            setDays={(val) => setLocalPlan(p => ({ ...p, days: val }))}
                            targetDate={localPlan.targetDate}
                            setTargetDate={(val) => setLocalPlan(p => ({ ...p, targetDate: val }))}
                            results={results}
                            mode={localPlan.mode}
                            setMode={(val) => setLocalPlan(p => ({ ...p, mode: val }))}
                            handleStart={handleStart}
                        />
                    </div>
                )}

                {/* ─── ACTIVE KHITMA ─── */}
                {khitma?.isStarted && !showCompletion && (
                    <div className="animate-fade-in space-y-12">

                        {/* Professional Stats Dashboard */}
                        <div className="animate-fade-in-up stagger-1">
                            <KhitmaStats
                                currentJuz={currentJuz}
                                progressPercentage={progressPercentage}
                                results={results}
                                progress={khitma?.progress || 0}
                                daysElapsed={daysElapsed}
                                dailyAverage={dailyAverage}
                                estimatedEnd={formatDate(estimatedEnd)}
                                weeklyHistory={weeklyHistory}
                                mode={localPlan.mode}
                            />
                        </div>

                        {/* Today's Progress Section */}
                        <div className="animate-fade-in-up stagger-2">
                            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl p-6 md:p-8 shadow-sm space-y-8 relative overflow-hidden group">
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-[var(--color-highlight)]/10 text-[var(--color-highlight)] flex items-center justify-center">
                                            <Sparkles size={24} className="animate-pulse-slow" />
                                        </div>
                                        <div>
                                            <h4 className="font-arabic font-black text-2xl text-[var(--color-text-primary)]">إنجاز اليوم</h4>
                                            <p className="text-xs text-[var(--color-text-tertiary)] opacity-70">المتبقي {remainingToday} {localPlan.mode === 'pages' ? 'صفحة' : 'آية'}</p>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl font-arabic font-bold text-sm border transition-all duration-500
                                        ${remainingToday > 0
                                            ? 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-black/60 dark:text-white/60'
                                            : 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/20 text-[var(--color-accent)]'}`}>
                                        {remainingToday > 0
                                            ? `أنجزت ${Math.round(calculateWirdProgress(khitma, dailyTarget))}%`
                                            : 'اكتمل ورد اليوم ✨'}
                                    </div>
                                </div>

                                {/* Today's progress bar */}
                                <div className="relative z-10 space-y-2">
                                    <div className="w-full h-3 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-highlight)] transition-all duration-1000 rounded-full"
                                            style={{ width: `${Math.min(100, (todayProgress / dailyTarget) * 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-arabic font-bold opacity-40">
                                        <span>{todayProgress} {localPlan.mode === 'pages' ? 'صفحة' : 'آية'}</span>
                                        <span>الهدف: {dailyTarget}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-6 relative z-10">
                                    <div className="flex gap-4">
                                        {[1, 5, 10].map(amount => (
                                            <button
                                                key={amount}
                                                onClick={() => handleLogProgress(amount)}
                                                className="flex-1 py-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[var(--color-text-primary)] font-arabic font-bold hover:border-[var(--color-accent)]/30 transition-all flex flex-col items-center gap-1 group/btn active:scale-95"
                                            >
                                                <span className="text-lg">+{amount}</span>
                                                <span className="text-[10px] opacity-60 font-medium">{localPlan.mode === 'pages' ? 'صفحة' : 'آية'}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handleLogProgress(remainingToday)}
                                        disabled={remainingToday <= 0}
                                        className="w-full py-5 bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 rounded-2xl font-arabic font-black text-lg hover:bg-[var(--color-accent)]/20 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:scale-100"
                                    >
                                        {remainingToday <= 0 ? 'أتممت هدفك لليوم مبارك!' : 'تسجيل إتمام الورد اليومي'}
                                    </button>

                                    {/* Auto-tracking hint */}
                                    {localPlan.mode === 'pages' && (
                                        <p className="text-center text-[10px] font-arabic text-[var(--color-text-tertiary)] opacity-50">
                                            💡 يتم تسجيل التقدم تلقائياً عند القراءة في المصحف
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Journey Map Section */}
                        <div className="space-y-6 animate-fade-in-up stagger-3">
                            <div className="flex items-center gap-4 px-2">
                                <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center">
                                    <Compass size={22} />
                                </div>
                                <div>
                                    <h3 className="font-arabic font-black text-2xl text-[var(--color-text-primary)]">مسارك الروحاني</h3>
                                    <p className="text-sm text-[var(--color-text-secondary)] opacity-70">خارطة تقدمك نحو الختام</p>
                                </div>
                            </div>
                            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-sm">
                                <KhitmaJourney
                                    currentJuz={currentJuz}
                                    progressPercentage={progressPercentage}
                                />
                            </div>
                        </div>

                        {/* Quick Settings */}
                        <div className="pt-10 border-t border-black/5 dark:border-white/5">
                            <div className="flex flex-wrap gap-6 justify-center">
                                <button
                                    onClick={handleReset}
                                    className="px-8 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10 text-[var(--color-text-tertiary)] font-arabic font-bold text-sm hover:border-[var(--color-error)] hover:text-[var(--color-error)] transition-all flex items-center gap-3"
                                >
                                    <ArrowLeft size={16} className="rotate-90" />
                                    إعادة ضبط الخطة
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Spiritual Message */}
                <div className="pt-20 flex flex-col items-center text-center space-y-8">
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
