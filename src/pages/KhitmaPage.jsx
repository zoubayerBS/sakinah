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
        <div className="min-h-screen pattern-subtle pb-24 relative overflow-x-hidden" dir="rtl">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle_at_center,rgba(201,162,39,0.1),transparent_70%)] blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle_at_center,rgba(92,107,74,0.1),transparent_70%)] blur-3xl opacity-50" />
            </div>

            <KhitmaHeader
                onBack={onBack}
                isStarted={isStarted}
                currentStreak={currentStreak}
            />

            <main className="relative max-w-[700px] mx-auto px-6 py-10 space-y-8">
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
                    <div className="animate-fade-in space-y-8">
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
                        <div className="space-y-4 animate-fade-in-up stagger-3">
                            <div className="flex items-center gap-3 px-2">
                                <Compass size={18} className="text-[var(--color-text-secondary)]" />
                                <h3 className="font-arabic font-bold text-[var(--color-text-primary)]">مسارك الروحاني</h3>
                            </div>
                            <div className="bg-[var(--color-bg-secondary)]/90 border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden shadow-inner">
                                <KhitmaJourney
                                    currentJuz={currentJuz}
                                    progressPercentage={progressPercentage}
                                />
                            </div>
                        </div>

                        {/* Quick Settings */}
                        <div className="pt-6 border-t border-[var(--color-divider)]">
                            <div className="flex flex-wrap gap-4 justify-center">
                                <button
                                    onClick={handleReset}
                                    className="px-6 py-2 rounded-full border border-dashed border-[var(--color-border)] text-[var(--color-text-tertiary)] font-arabic text-xs hover:border-[var(--color-error)] hover:text-[var(--color-error)] transition-all flex items-center gap-2"
                                >
                                    <ArrowLeft size={14} className="rotate-90" />
                                    إعادة ضبط الخطة
                                </button>
                                <button
                                    className="px-6 py-2 rounded-full border border-[var(--color-border)] text-[var(--color-text-tertiary)] font-arabic text-xs hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all flex items-center gap-2"
                                >
                                    <ArrowLeft size={14} className="rotate-270" />
                                    شارك التقدم
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Spiritual Message */}
                <div className="pt-10 flex flex-col items-center text-center space-y-6">
                    <div className="w-px h-12 bg-gradient-to-b from-[var(--color-border)] to-transparent opacity-50"></div>
                    <div className="max-w-[80%] mx-auto">
                        <p className="font-arabic text-[var(--color-text-secondary)] italic leading-relaxed text-sm opacity-80">
                            "يقال لصاحب القرآن اقرأ وارتق ورتل كما كنت ترتل في الدنيا فإن منزلتك عند آخر آية تقرؤها"
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] opacity-60">
                        <Sparkles size={14} />
                        <span className="text-[10px] font-arabic">رزقكم الله القبول</span>
                    </div>
                </div>
            </main>
        </div>
    );
};
