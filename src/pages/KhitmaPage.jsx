import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Compass, Sparkles } from 'lucide-react';
import { getKhitmaState, saveKhitmaState } from '../utils/storage-utils.js';
import { calculateWirdProgress } from '../utils/quran-utils.js';

// Import modular components
import KhitmaHeader from '../components/khitma/KhitmaHeader.jsx';
import KhitmaPlanner from '../components/khitma/KhitmaPlanner.jsx';
import KhitmaStats from '../components/khitma/KhitmaStats.jsx';
import KhitmaMission from '../components/khitma/KhitmaMission.jsx';
import KhitmaJourney from '../components/khitma/KhitmaJourney.jsx';

export const KhitmaPage = ({ onBack }) => {
    // 1. Data Definitions
    const TOTAL_PAGES = 604;
    const TOTAL_VERSES = 6236;
    const JUZ_TOTAL = 30;

    // 2. State
    const [days, setDays] = useState(30);
    const [planType, setPlanType] = useState('days');
    const [targetDate, setTargetDate] = useState('');
    const [mode, setMode] = useState('pages');
    const [isStarted, setIsStarted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressLog, setProgressLog] = useState({});
    const [results, setResults] = useState({ daily: 0, perPrayer: 0, totalPortions: 0 });
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState('20:30');

    // 3. Persistence
    useEffect(() => {
        const load = async () => {
            const saved = await getKhitmaState();
            if (saved) {
                if (saved.days) setDays(saved.days);
                if (saved.planType) setPlanType(saved.planType);
                if (saved.targetDate) setTargetDate(saved.targetDate);
                if (saved.mode) setMode(saved.mode);
                if (saved.isStarted !== undefined) setIsStarted(saved.isStarted);
                if (saved.progress !== undefined) setProgress(saved.progress);
                if (saved.progressLog) setProgressLog(saved.progressLog);
                if (saved.reminderEnabled !== undefined) setReminderEnabled(Boolean(saved.reminderEnabled));
                if (saved.reminderTime) setReminderTime(saved.reminderTime);
            }
        };
        load();
    }, []);

    useEffect(() => {
        const save = async () => {
            const state = {
                days, planType, targetDate, mode,
                isStarted, progress, progressLog,
                reminderEnabled, reminderTime
            };
            await saveKhitmaState(state);
        };
        save();
    }, [days, planType, targetDate, mode, isStarted, progress, progressLog, reminderEnabled, reminderTime]);

    // 4. Calculations
    useEffect(() => {
        const total = mode === 'pages' ? TOTAL_PAGES : TOTAL_VERSES;
        const daily = Math.ceil(total / days);
        const perPrayer = Math.ceil(daily / 5);
        const totalPortions = days * 5;
        setResults({ daily, perPrayer, totalPortions });
    }, [days, mode]);

    useEffect(() => {
        if (planType !== 'date' || !targetDate) return;
        const target = new Date(targetDate);
        if (Number.isNaN(target.getTime())) return;
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const end = new Date(target.getFullYear(), target.getMonth(), target.getDate());
        const diffDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        if (diffDays !== days) setDays(diffDays);
    }, [planType, targetDate, days]);

    // 5. Handlers
    const handleStart = () => {
        if (planType === 'date' && !targetDate) return;
        setIsStarted(true);
        setProgress(0);
        setProgressLog({});
    };

    const handleReset = () => {
        if (window.confirm('إعادة ضبط خطة الختمة؟')) {
            setIsStarted(false);
            setProgress(0);
            setProgressLog({});
        }
    };

    const handleFinishPortion = () => {
        if (progress < results.totalPortions) {
            const todayKey = new Date().toISOString().split('T')[0];
            setProgress(prev => prev + 1);
            setProgressLog(prev => ({
                ...prev,
                [todayKey]: (prev[todayKey] || 0) + 1
            }));
        }
    };

    // 7. Memoized Progress
    const progressPercentage = useMemo(() => {
        return calculateWirdProgress({ days, progress });
    }, [days, progress]);

    const currentJuz = Math.min(30, Math.floor((progressPercentage / 100) * JUZ_TOTAL) + 1);
    const todayKey = new Date().toISOString().split('T')[0];
    const todayPortions = progressLog[todayKey] || 0;
    const dailyPortionsGoal = 5;
    const remainingToday = Math.max(0, dailyPortionsGoal - todayPortions);

    const computeStreak = useCallback(() => {
        let streak = 0;
        const date = new Date();
        const todayCount = progressLog[date.toISOString().split('T')[0]] || 0;
        if (todayCount < dailyPortionsGoal) {
            date.setDate(date.getDate() - 1);
        }
        while (streak < 1000) { // Safety break
            const key = date.toISOString().split('T')[0];
            if ((progressLog[key] || 0) >= dailyPortionsGoal) {
                streak += 1;
                date.setDate(date.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    }, [progressLog, dailyPortionsGoal]);

    const currentStreak = useMemo(() => computeStreak(), [computeStreak]);

    return (
        <div className="min-h-screen pb-24 relative overflow-x-hidden mesh-bg" dir="rtl">
            {/* Immersive Floating Elements */}
            <div className="absolute top-[10%] left-[-5%] w-[40rem] h-[40rem] bg-[var(--color-highlight)]/5 rounded-full blur-[120px] animate-pulse-slow"></div>
            <div className="absolute bottom-[10%] right-[-5%] w-[35rem] h-[35rem] bg-[var(--color-accent)]/5 rounded-full blur-[100px] animate-pulse-slow font-delay-2000"></div>

            <KhitmaHeader
                onBack={onBack}
                isStarted={isStarted}
                currentStreak={currentStreak}
            />

            <main className="relative max-w-4xl mx-auto px-6 py-10 space-y-12">
                {!isStarted ? (
                    <div className="animate-fade-in-up">
                        <KhitmaPlanner
                            planType={planType}
                            setPlanType={setPlanType}
                            days={days}
                            setDays={setDays}
                            targetDate={targetDate}
                            setTargetDate={setTargetDate}
                            results={results}
                            mode={mode}
                            setMode={setMode}
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
                                progress={progress}
                            />
                        </div>

                        <div className="animate-fade-in-up stagger-2">
                            <KhitmaMission
                                remainingToday={remainingToday}
                                todayPortions={todayPortions}
                                handleFinishPortion={handleFinishPortion}
                                progress={progress}
                                totalPortions={results.totalPortions}
                            />
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
