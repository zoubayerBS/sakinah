import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    ArrowLeft, Calculator, Calendar, BookOpen,
    Clock, Trophy, Flame, Target,
    ChevronRight, CheckCircle2, Compass,
    Sparkles, Map, Heart, Share2, Info
} from 'lucide-react';
import { getKhitmaState, saveKhitmaState } from '../utils/storage-utils.js';

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

    // 6. Stats & Progress Data
    const progressPercentage = Math.min(100, Math.round((progress / results.totalPortions) * 100));
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
        while (true) {
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

    // 7. Render Sub-components
    const Header = () => (
        <header className="sticky top-0 z-[var(--z-fixed)] w-full bg-[var(--color-bg-secondary)]/90 backdrop-blur-md border-b border-[var(--color-border)] px-6 py-4">
            <div className="max-w-[700px] mx-auto flex items-center justify-between" dir="rtl">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all"
                    >
                        <ArrowLeft size={20} className="rotate-180" />
                    </button>
                    <div>
                        <h1 className="font-arabic font-bold text-xl text-[var(--color-text-primary)]">
                            مخطط الختمة
                        </h1>
                    </div>
                </div>
                {isStarted && (
                    <div className="flex items-center gap-2 bg-[var(--color-accent)]/10 px-3 py-1.5 rounded-full border border-[var(--color-accent)]/20">
                        <Flame size={16} className="text-[var(--color-accent)]" />
                        <span className="font-ui font-bold text-sm text-[var(--color-accent)]">{currentStreak}</span>
                    </div>
                )}
            </div>
        </header>
    );

    const TraditionalMarker = ({ number, isCompleted, isCurrent }) => (
        <div className={`relative w-14 h-14 flex items-center justify-center transition-all duration-700 ${isCurrent ? 'scale-125' : ''}`}>
            <svg viewBox="0 0 40 40" className={`absolute inset-0 w-full h-full transition-colors duration-700 ${isCompleted ? 'text-[var(--color-accent)]' : (isCurrent ? 'text-[var(--color-highlight)]' : 'text-[var(--color-border)]')}`} fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 2 L25 10 L35 10 L30 20 L35 30 L25 30 L20 38 L15 30 L5 30 L10 20 L5 10 L15 10 Z" fill="currentColor" fillOpacity={isCompleted ? "0.2" : "0.05"} />
                <circle cx="20" cy="20" r="14" strokeWidth="1" strokeDasharray={isCurrent ? "" : "2 2"} />
            </svg>
            <span className={`relative font-arabic font-bold text-[10px] pt-1 transition-colors ${isCompleted ? 'text-[var(--color-accent)]' : (isCurrent ? 'text-[var(--color-text-primary)] font-black' : 'text-[var(--color-text-tertiary)]')}`}>
                {number}
            </span>
            {isCurrent && (
                <div className="absolute -top-1 w-2 h-2 rounded-full bg-[var(--color-highlight)] shadow-[0_0_8px_var(--color-highlight)]"></div>
            )}
        </div>
    );

    const JourneyMap = () => {
        const juzList = Array.from({ length: 30 }, (_, i) => i + 1);
        const mapRef = useRef(null);

        useEffect(() => {
            if (mapRef.current) {
                const currentEl = mapRef.current.querySelector(`.juz-marker-${currentJuz}`);
                if (currentEl) currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, [currentJuz]);

        return (
            <div ref={mapRef} className="relative py-12 px-4 overflow-y-auto max-h-[500px] no-scrollbar snap-y border-t border-[var(--color-border)]">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--color-border)] -translate-x-1/2 opacity-50"></div>
                <div className="space-y-10 relative">
                    {juzList.map((juzNum) => {
                        const juzProgressPct = (juzNum / 30) * 100;
                        const isCompleted = progressPercentage >= (juzNum / 30) * 100;
                        const isCurrent = currentJuz === juzNum;

                        return (
                            <div key={juzNum} className={`juz-marker-${juzNum} flex items-center gap-6 snap-center ${juzNum % 2 !== 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                                <div className={`w-1/2 ${juzNum % 2 !== 0 ? 'text-left pl-4' : 'text-right pr-4'} transition-opacity duration-700 ${isCompleted || isCurrent ? 'opacity-100' : 'opacity-30'}`}>
                                    <p className="font-arabic font-bold text-xs text-[var(--color-text-primary)]">الجزء {juzNum}</p>
                                    <p className="text-[9px] text-[var(--color-text-tertiary)] uppercase tracking-widest">{isCompleted ? 'مكتمل' : (isCurrent ? 'قيد القراءة' : 'قادم')}</p>
                                </div>
                                <div className="z-10 bg-[var(--color-bg-primary)] p-1 rounded-full border border-[var(--color-divider)]">
                                    <TraditionalMarker number={juzNum} isCompleted={isCompleted} isCurrent={isCurrent} />
                                </div>
                                <div className="w-1/2"></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen pattern-subtle pb-24 relative overflow-x-hidden" dir="rtl">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle_at_center,rgba(201,162,39,0.1),transparent_70%)] blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle_at_center,rgba(92,107,74,0.1),transparent_70%)] blur-3xl opacity-50" />
            </div>

            <Header />

            <main className="relative max-w-[700px] mx-auto px-6 py-10 space-y-8">
                {!isStarted ? (
                    <div className="animate-fade-in space-y-8">
                        {/* Landing Hero */}
                        <div className="relative p-8 bg-[var(--color-bg-secondary)]/90 border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] overflow-hidden">
                            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                                <div className="w-20 h-20 rounded-full bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)]">
                                    <Compass size={40} />
                                </div>
                                <div>
                                    <h2 className="font-reem-kufi-fun text-3xl text-[var(--color-text-primary)]">رحلة الختمة</h2>
                                    <p className="font-arabic text-[var(--color-text-secondary)] mt-1">خطط لمسارك في تلاوة كتاب الله</p>
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
                ) : (
                    <div className="animate-fade-in space-y-8">
                        {/* Active Progress Card */}
                        <div className="p-8 bg-[var(--color-bg-secondary)]/90 border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-[var(--color-highlight)]/10 flex items-center justify-center text-[var(--color-highlight)]">
                                        <Trophy size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-arabic font-bold text-lg text-[var(--color-text-primary)]">الجزء {currentJuz}</h3>
                                        <p className="font-arabic text-xs text-[var(--color-text-tertiary)]">التقدم: {progressPercentage}%</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-arabic text-xs text-[var(--color-text-tertiary)] mb-1">المتبقي</p>
                                    <p className="font-ui font-black text-xl text-[var(--color-accent)]">{results.totalPortions - progress}</p>
                                </div>
                            </div>

                            <div className="w-full h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[var(--color-accent)] transition-all duration-1000 shadow-[0_0_8px_var(--color-accent)]"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Daily Mission Card - REDEFINED INTEGRATION */}
                        <div className="bg-[var(--color-bg-secondary)]/90 border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Sparkles size={18} className="text-[var(--color-highlight)]" />
                                    <h4 className="font-arabic font-bold text-[var(--color-text-primary)]">أوراد اليوم</h4>
                                </div>
                                <span className="text-[10px] font-arabic text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] px-3 py-1 rounded-full border border-[var(--color-border)]">
                                    {remainingToday > 0 ? `باقي ${remainingToday}` : 'تمت المهمة ✨'}
                                </span>
                            </div>

                            <div className="overflow-x-auto no-scrollbar -mx-2 px-2 pb-4 touch-pan-x">
                                <div className="flex items-center gap-4 min-w-max">
                                    {[1, 2, 3, 4, 5].map(idx => (
                                        <div key={idx} className="flex flex-col items-center gap-2 group shrink-0">
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-500
                                                ${idx <= todayPortions ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white shadow-md' : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border)] text-[var(--color-text-tertiary)]'}
                                            `}>
                                                {idx <= todayPortions ? <CheckCircle2 size={24} /> : <span className="font-ui font-bold">{idx}</span>}
                                            </div>
                                            <span className={`font-arabic text-[9px] ${idx <= todayPortions ? 'text-[var(--color-accent)] font-bold' : 'text-[var(--color-text-tertiary)] opacity-60'}`}>الورد {idx}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleFinishPortion}
                                disabled={progress >= results.totalPortions}
                                className="w-full py-4 bg-[var(--color-accent)] text-white rounded-full font-arabic font-bold text-lg shadow-[var(--shadow-sm)] hover:opacity-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                            >
                                <Heart size={20} className={remainingToday === 0 ? 'fill-current' : ''} />
                                {remainingToday === 0 ? 'سجل ورداً إضافياً' : 'أتممت ورداً الآن'}
                            </button>
                        </div>

                        {/* Journey Map Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 px-2">
                                <Map size={18} className="text-[var(--color-text-secondary)]" />
                                <h3 className="font-arabic font-bold text-[var(--color-text-primary)]">مسارك الروحاني</h3>
                            </div>
                            <div className="bg-[var(--color-bg-secondary)]/90 border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden shadow-inner">
                                <JourneyMap />
                            </div>
                        </div>

                        {/* Quick Settings */}
                        <div className="pt-6 border-t border-[var(--color-divider)]">
                            <div className="flex flex-wrap gap-4 justify-center">
                                <button
                                    onClick={handleReset}
                                    className="px-6 py-2 rounded-full border border-dashed border-[var(--color-border)] text-[var(--color-text-tertiary)] font-arabic text-xs hover:border-[var(--color-error)] hover:text-[var(--color-error)] transition-all flex items-center gap-2"
                                >
                                    <Calculator size={14} />
                                    إعادة ضبط الخطة
                                </button>
                                <button
                                    className="px-6 py-2 rounded-full border border-[var(--color-border)] text-[var(--color-text-tertiary)] font-arabic text-xs hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all flex items-center gap-2"
                                >
                                    <Share2 size={14} />
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
