import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Compass, Sparkles } from 'lucide-react';
import { getKhitmaState, saveKhitmaState } from '../utils/storage-utils.js';
import { calculateWirdProgress, calculateKhitmaProgress } from '../utils/quran-utils.js';

// Import modular components
import KhitmaHeader from '../components/khitma/KhitmaHeader.jsx';
import KhitmaPlanner from '../components/khitma/KhitmaPlanner.jsx';
import KhitmaStats from '../components/khitma/KhitmaStats.jsx';
import KhitmaJourney from '../components/khitma/KhitmaJourney.jsx';

export const KhitmaPage = ({ onBack, khitma, onUpdateKhitma }) => {
    // 1. Data Definitions
    const TOTAL_PAGES = 604;
    const TOTAL_VERSES = 6236;
    const JUZ_TOTAL = 30;

    // 2. Planning State (local until started/updated)
    const [localPlan, setLocalPlan] = useState({
        days: khitma?.days || 30,
        planType: khitma?.planType || 'days',
        targetDate: khitma?.targetDate || '',
        mode: khitma?.mode || 'pages',
        reminderEnabled: khitma?.reminderEnabled || false,
        reminderTime: khitma?.reminderTime || '20:30'
    });

    const [results, setResults] = useState({ daily: 0, perPrayer: 0, totalPortions: 0 });

    // 4. Shared Data Sync
    // We only update localPlan from props if the khitma object changes (e.g. loaded from DB)
    useEffect(() => {
        if (khitma) {
            setLocalPlan({
                days: khitma.days || 30,
                planType: khitma.planType || 'days',
                targetDate: khitma.targetDate || '',
                mode: khitma.mode || 'pages',
                reminderEnabled: khitma.reminderEnabled !== undefined ? Boolean(khitma.reminderEnabled) : false,
                reminderTime: khitma.reminderTime || '20:30'
            });
        }
    }, [khitma]);

    // 5. Calculations
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

    // 6. Handlers
    const updateKhitmaState = (updates) => {
        if (!onUpdateKhitma) return;
        const newState = {
            ...localPlan,
            isStarted: khitma?.isStarted || false,
            progress: khitma?.progress || 0,
            progressLog: khitma?.progressLog || {},
            ...updates
        };
        onUpdateKhitma(newState);
    };

    const handleStart = () => {
        if (localPlan.planType === 'date' && !localPlan.targetDate) return;
        updateKhitmaState({
            isStarted: true,
            progress: 0,
            progressLog: {}
        });
    };

    const handleReset = () => {
        if (window.confirm('إعادة ضبط خطة الختمة؟')) {
            updateKhitmaState({
                isStarted: false,
                progress: 0,
                progressLog: {}
            });
        }
    };

    const handleLogProgress = (amount = 1) => {
        const currentProgress = khitma?.progress || 0;
        const currentLog = khitma?.progressLog || {};

        if (currentProgress < results.totalUnits) {
            const todayKey = new Date().toISOString().split('T')[0];
            updateKhitmaState({
                progress: Math.min(results.totalUnits, currentProgress + amount),
                progressLog: {
                    ...currentLog,
                    [todayKey]: (currentLog[todayKey] || 0) + amount
                }
            });
        }
    };

    // 7. Derived Values
    const progressPercentage = useMemo(() => {
        return calculateKhitmaProgress(khitma);
    }, [khitma]);

    const currentJuz = Math.min(30, Math.floor((progressPercentage / 100) * JUZ_TOTAL) + 1);
    const todayKey = new Date().toISOString().split('T')[0];
    const todayProgress = khitma?.progressLog?.[todayKey] || 0;
    const remainingToday = Math.max(0, results.daily - todayProgress);

    const computeStreak = useCallback(() => {
        const log = khitma?.progressLog || {};
        let streak = 0;
        const date = new Date();
        const todayCount = log[date.toISOString().split('T')[0]] || 0;
        if (todayCount < results.daily) {
            date.setDate(date.getDate() - 1);
        }
        while (streak < 1000) { // Safety break
            const key = date.toISOString().split('T')[0];
            if ((log[key] || 0) >= results.daily) {
                streak += 1;
                date.setDate(date.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    }, [khitma?.progressLog, results.daily]);

    const currentStreak = useMemo(() => computeStreak(), [computeStreak]);

    return (
        <div className="min-h-screen pb-24 relative overflow-x-hidden mesh-bg" dir="rtl">
            {/* Immersive Floating Elements */}
            <div className="absolute top-[10%] left-[-5%] w-[40rem] h-[40rem] bg-[var(--color-highlight)]/5 rounded-full blur-[120px] animate-pulse-slow"></div>
            <div className="absolute bottom-[10%] right-[-5%] w-[35rem] h-[35rem] bg-[var(--color-accent)]/5 rounded-full blur-[100px] animate-pulse-slow font-delay-2000"></div>

            <KhitmaHeader
                onBack={onBack}
                isStarted={khitma?.isStarted}
                currentStreak={currentStreak}
            />

            <main className="relative max-w-4xl mx-auto px-6 py-10 space-y-12">
                {!khitma?.isStarted ? (
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
                ) : (
                    <div className="animate-fade-in space-y-12">
                        <div className="animate-fade-in-up stagger-1">
                            <KhitmaStats
                                currentJuz={currentJuz}
                                progressPercentage={progressPercentage}
                                results={results}
                                progress={khitma?.progress || 0}
                            />
                        </div>

                        <div className="animate-fade-in-up stagger-2">
                            <div className="glass-premium rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent)]/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
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
                                            ? `أنجزت ${Math.round(calculateWirdProgress(khitma, results.daily))}%`
                                            : 'اكتمل ورد اليوم ✨'}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-6 relative z-10">
                                    <div className="flex gap-4">
                                        {[1, 5, 10].map(amount => (
                                            <button
                                                key={amount}
                                                onClick={() => handleLogProgress(amount)}
                                                className="flex-1 py-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[var(--color-text-primary)] font-arabic font-bold hover:border-[var(--color-accent)]/30 transition-all flex flex-col items-center gap-1 group/btn"
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
                            <div className="glass-premium rounded-[2.5rem] overflow-hidden shadow-2xl">
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
                                <button
                                    className="px-8 py-3 rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 font-arabic font-bold text-sm hover:bg-[var(--color-accent)]/20 transition-all flex items-center gap-3"
                                >
                                    <ArrowLeft size={16} className="rotate-270" />
                                    شارك التقدم
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
