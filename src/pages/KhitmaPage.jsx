import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calculator, Calendar, BookOpen, Hash, Star, Clock } from 'lucide-react';

export const KhitmaPage = ({ onBack }) => {
    const [days, setDays] = useState(30);
    const [planType, setPlanType] = useState('days'); // 'days' or 'date'
    const [targetDate, setTargetDate] = useState('');
    const [mode, setMode] = useState('pages'); // 'pages' or 'verses'
    const [isStarted, setIsStarted] = useState(false);
    const [progress, setProgress] = useState(0); // number of portions finished
    const [progressLog, setProgressLog] = useState({});
    const [results, setResults] = useState({ daily: 0, perPrayer: 0, totalPortions: 0 });
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState('20:30');
    const [reminderPermission, setReminderPermission] = useState(
        typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
    );

    const TOTAL_PAGES = 604;
    const TOTAL_VERSES = 6236;

    // Load state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('khitma_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            setDays(parsed.days);
            setPlanType(parsed.planType || 'days');
            setTargetDate(parsed.targetDate || '');
            setMode(parsed.mode);
            setIsStarted(parsed.isStarted);
            setProgress(parsed.progress);
            setProgressLog(parsed.progressLog || {});
            setReminderEnabled(Boolean(parsed.reminderEnabled));
            setReminderTime(parsed.reminderTime || '20:30');
        }
    }, []);

    // Sync state to localStorage
    useEffect(() => {
        const state = {
            days,
            planType,
            targetDate,
            mode,
            isStarted,
            progress,
            progressLog,
            reminderEnabled,
            reminderTime
        };
        localStorage.setItem('khitma_state', JSON.stringify(state));
    }, [days, planType, targetDate, mode, isStarted, progress, progressLog, reminderEnabled, reminderTime]);

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

    useEffect(() => {
        if (!reminderEnabled || reminderPermission !== 'granted') return;
        let timeoutId;

        const scheduleNext = () => {
            const now = new Date();
            const [hh, mm] = reminderTime.split(':').map(Number);
            const next = new Date();
            next.setHours(hh, mm, 0, 0);
            if (next <= now) next.setDate(next.getDate() + 1);
            timeoutId = setTimeout(() => {
                new Notification('تذكير الختمة', {
                    body: 'حان وقت وردك اليومي',
                });
                scheduleNext();
            }, next.getTime() - now.getTime());
        };

        scheduleNext();
        return () => clearTimeout(timeoutId);
    }, [reminderEnabled, reminderTime, reminderPermission]);

    const handleDaysChange = (e) => {
        const val = parseInt(e.target.value);
        if (val > 0) setDays(val);
    };

    const handleStart = () => {
        if (planType === 'date' && !targetDate) {
            window.alert('يرجى اختيار تاريخ الختمة أولاً.');
            return;
        }
        setIsStarted(true);
        setProgress(0);
        setProgressLog({});
    };

    const handleReset = () => {
        if (window.confirm('هل أنت متأكد من رغبتك في إعادة ضبط الختمة؟')) {
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

    const getCompletionDate = () => {
        if (planType === 'date' && targetDate) {
            const date = new Date(targetDate);
            if (!Number.isNaN(date.getTime())) {
                return date.toLocaleDateString('ar-TN', { day: 'numeric', month: 'long', year: 'numeric' });
            }
        }
        const date = new Date();
        date.setDate(date.getDate() + (days - Math.floor(progress / 5)));
        return date.toLocaleDateString('ar-TN', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const dailyPortionsGoal = 5;
    const todayKey = new Date().toISOString().split('T')[0];
    const todayPortions = progressLog[todayKey] || 0;
    const remainingToday = Math.max(0, dailyPortionsGoal - todayPortions);

    const computeStreak = () => {
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
    };

    const computeBestStreak = () => {
        const keys = Object.keys(progressLog).sort();
        let best = 0;
        let current = 0;
        let prevDate = null;
        keys.forEach((key) => {
            if ((progressLog[key] || 0) < dailyPortionsGoal) {
                current = 0;
                prevDate = null;
                return;
            }
            if (!prevDate) {
                current = 1;
            } else {
                const prev = new Date(prevDate);
                const curr = new Date(key);
                const diff = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
                current = diff === 1 ? current + 1 : 1;
            }
            if (current > best) best = current;
            prevDate = key;
        });
        return best;
    };

    const progressPercentage = Math.min(100, Math.round((progress / results.totalPortions) * 100));
    const remainingDays = Math.max(0, days - Math.floor(progress / 5));
    const currentStreak = computeStreak();
    const bestStreak = computeBestStreak();

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pb-24 animate-fade-in">
            {/* Header */}
            <header className="sticky top-0 z-[var(--z-fixed)] w-full bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] px-6 py-4 shadow-[var(--shadow-sm)]">
                <div className="max-w-[1200px] mx-auto flex items-center justify-between" dir="rtl">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]
                                hover:bg-[var(--color-accent)] hover:text-white transition-all group"
                        >
                            <ArrowLeft size={20} className="rotate-180 group-hover:scale-110 transition-transform" />
                        </button>
                        <h1 className="font-arabic font-bold text-2xl text-[var(--color-text-primary)]">
                            مخطط الختمة
                        </h1>
                    </div>
                </div>
            </header>

            <div className="max-w-[600px] mx-auto px-6 py-8 space-y-8" dir="rtl">
                {/* Intro Card */}
                <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl p-6 text-center space-y-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent)]/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="w-16 h-16 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-full flex items-center justify-center mx-auto mb-2">
                        <Calculator size={32} />
                    </div>
                    <h2 className="font-arabic font-bold text-xl text-[var(--color-text-primary)]">
                        {isStarted ? 'ختمتك قيد التنفيذ' : 'خطط لختمتك القادمة'}
                    </h2>
                    <p className="font-arabic text-[var(--color-text-secondary)] text-sm leading-relaxed">
                        {isStarted
                            ? 'استمر في القراءة وحدث تقدمك بعد كل جزء تنتهي منه.'
                            : 'أدخل عدد الأيام التي تريد فيها ختم القرآن الكريم، وسنقوم بحساب وردك اليومي.'
                        }
                    </p>
                </div>

                {isStarted ? (
                    /* Active Khitma View */
                    <div className="space-y-8 animate-fade-in">
                        {/* Progress Bar */}
                        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl p-6 space-y-4 shadow-sm">
                            <div className="flex justify-between items-end mb-2">
                                <span className="font-arabic font-bold text-[var(--color-text-primary)] text-lg">التقدم الكلي</span>
                                <span className="font-ui font-black text-2xl text-[var(--color-accent)]">{progressPercentage}%</span>
                            </div>
                            <div className="w-full h-4 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[var(--color-accent)] transition-all duration-700 ease-out shadow-[0_0_10px_rgba(201,162,39,0.3)]"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-[var(--color-text-tertiary)] font-arabic">
                                <span>البداية</span>
                                <span>المتبقي: {remainingDays} يوم</span>
                                <span>الختم</span>
                            </div>
                            <p className="font-arabic text-[0.7rem] text-[var(--color-text-tertiary)] text-right mt-2">
                                تاريخ الختم المتوقع: {getCompletionDate()}
                            </p>
                        </div>

                        {/* Current Task Card */}
                        <div className="bg-[var(--color-accent)] rounded-3xl p-8 text-white text-center shadow-lg shadow-[var(--color-accent)]/20">
                            <p className="font-arabic text-sm opacity-90 mb-2">الورد الحالي المطلوب</p>
                            <div className="flex items-baseline justify-center gap-2 mb-6">
                                <h3 className="text-6xl font-ui font-black">{results.perPrayer}</h3>
                                <span className="font-arabic font-bold text-xl">{mode === 'pages' ? 'صفحة' : 'آية'}</span>
                            </div>
                            <button
                                onClick={handleFinishPortion}
                                disabled={progress >= results.totalPortions}
                                className="w-full bg-white text-[var(--color-accent)] font-arabic font-bold py-4 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                            >
                                <Star size={20} className={progress >= results.totalPortions ? 'fill-current' : ''} />
                                لقد أنهيت هذا الجزء
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl p-6 text-center shadow-sm">
                                <p className="font-arabic text-xs text-[var(--color-text-tertiary)] mb-2">تم إنجاز</p>
                                <p className="text-2xl font-ui font-black text-[var(--color-text-primary)]">{progress} / {results.totalPortions}</p>
                                <p className="font-arabic text-[0.65rem] text-[var(--color-text-tertiary)]">جزء من المجموع</p>
                            </div>
                            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl p-6 text-center shadow-sm">
                                <p className="font-arabic text-xs text-[var(--color-text-tertiary)] mb-2">إنجاز اليوم</p>
                                <p className="text-2xl font-ui font-black text-[var(--color-text-primary)]">{todayPortions} / {dailyPortionsGoal}</p>
                                <p className="font-arabic text-[0.65rem] text-[var(--color-text-tertiary)]">المتبقي اليوم: {remainingToday}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl p-6 text-center shadow-sm">
                                <p className="font-arabic text-xs text-[var(--color-text-tertiary)] mb-2">السلسلة الحالية</p>
                                <p className="text-2xl font-ui font-black text-[var(--color-text-primary)]">{currentStreak} يوم</p>
                                <p className="font-arabic text-[0.65rem] text-[var(--color-text-tertiary)]">أيام متتالية</p>
                            </div>
                            <button
                                onClick={handleReset}
                                className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl p-6 text-center shadow-sm hover:border-[var(--color-error)]/30 transition-all group"
                            >
                                <p className="font-arabic text-xs text-[var(--color-text-tertiary)] mb-2">إعادة الضبط</p>
                                <p className="font-arabic font-bold text-[var(--color-error)] group-hover:scale-110 transition-transform">بدء من جديد</p>
                            </button>
                        </div>

                        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl p-6 text-center shadow-sm">
                            <p className="font-arabic text-xs text-[var(--color-text-tertiary)] mb-2">أفضل سلسلة</p>
                            <p className="text-2xl font-ui font-black text-[var(--color-text-primary)]">{bestStreak} يوم</p>
                        </div>
                    </div>
                ) : (
                    /* Configuration View */
                    <div className="space-y-8 animate-fade-in">
                        {/* Plan Type Toggle */}
                        <div className="flex bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-1.5 shadow-inner">
                            <button
                                onClick={() => setPlanType('days')}
                                className={`flex-1 py-3 rounded-xl font-arabic font-bold text-sm transition-all ${planType === 'days' ? 'bg-[var(--color-accent)] text-white shadow-md' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'}`}
                            >
                                بعدد الأيام
                            </button>
                            <button
                                onClick={() => setPlanType('date')}
                                className={`flex-1 py-3 rounded-xl font-arabic font-bold text-sm transition-all ${planType === 'date' ? 'bg-[var(--color-accent)] text-white shadow-md' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'}`}
                            >
                                بتاريخ الختم
                            </button>
                        </div>

                        {/* Mode Toggle */}
                        <div className="flex bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-1.5 shadow-inner">
                            <button
                                onClick={() => setMode('pages')}
                                className={`flex-1 py-3 rounded-xl font-arabic font-bold text-sm transition-all flex items-center justify-center gap-2 ${mode === 'pages' ? 'bg-[var(--color-accent)] text-white shadow-md' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'}`}
                            >
                                <BookOpen size={18} />
                                بالصفحات
                            </button>
                            <button
                                onClick={() => setMode('verses')}
                                className={`flex-1 py-3 rounded-xl font-arabic font-bold text-sm transition-all flex items-center justify-center gap-2 ${mode === 'verses' ? 'bg-[var(--color-accent)] text-white shadow-md' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'}`}
                            >
                                <Hash size={18} />
                                بالآيات
                            </button>
                        </div>

                        {/* Inputs */}
                        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl p-6 space-y-6">
                            {planType === 'days' ? (
                                <div className="space-y-3">
                                <label className="font-arabic font-bold text-[var(--color-text-secondary)] flex items-center gap-2">
                                    <Calendar size={18} className="text-[var(--color-accent)]" />
                                    مدة الختمة (بالأيام)
                                </label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        value={days}
                                        onChange={handleDaysChange}
                                        min="1"
                                        className="flex-1 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-2xl py-4 px-6 text-center font-ui font-bold text-2xl text-[var(--color-accent)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    {[7, 10, 15, 30].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setDays(d)}
                                            className={`flex-1 py-2 rounded-xl border text-sm font-ui transition-all ${days === d ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5 text-[var(--color-accent)] font-bold' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-text-secondary)]'}`}
                                        >
                                            {d} يوم
                                        </button>
                                    ))}
                                </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <label className="font-arabic font-bold text-[var(--color-text-secondary)] flex items-center gap-2">
                                        <Calendar size={18} className="text-[var(--color-accent)]" />
                                        تاريخ الختم
                                    </label>
                                    <input
                                        type="date"
                                        value={targetDate}
                                        onChange={(e) => setTargetDate(e.target.value)}
                                        className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-2xl py-4 px-6 text-right font-ui font-bold text-[var(--color-accent)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
                                    />
                                    <div className="text-right text-xs text-[var(--color-text-tertiary)] font-arabic">
                                        المدة المحسوبة: {days} يوم
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Calculator Results (Preview) */}
                        <div className="space-y-4">
                            <div className="bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 rounded-3xl p-6 text-center">
                                <p className="font-arabic text-sm text-[var(--color-text-secondary)] mb-1">الورد اليومي المتوقع</p>
                                <div className="flex items-baseline justify-center gap-2">
                                    <h3 className="text-4xl font-ui font-black text-[var(--color-accent)]">{results.daily}</h3>
                                    <span className="font-arabic font-bold text-lg text-[var(--color-accent)]">{mode === 'pages' ? 'صفحة' : 'آية'}</span>
                                </div>
                                <p className="font-arabic text-xs text-[var(--color-text-tertiary)] mt-2">
                                    أي حوالي <span className="font-bold">{results.perPrayer}</span> {mode === 'pages' ? 'صفحات' : 'آيات'} بعد كل صلاة.
                                </p>
                            </div>

                            <button
                                onClick={handleStart}
                                className="w-full bg-[var(--color-accent)] text-white font-arabic font-bold py-5 rounded-2xl shadow-lg shadow-[var(--color-accent)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                ابدأ الختمة الآن
                            </button>
                        </div>
                    </div>
                )}

                {/* Daily Reminder */}
                <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="text-right">
                            <h3 className="font-arabic font-bold text-[var(--color-text-primary)]">تذكير يومي</h3>
                            <p className="font-arabic text-xs text-[var(--color-text-tertiary)]">
                                يعمل عند فتح التطبيق فقط
                            </p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={reminderEnabled}
                                onChange={(e) => setReminderEnabled(e.target.checked)}
                            />
                            <span className={`w-11 h-6 rounded-full transition-colors ${reminderEnabled ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`}>
                                <span className={`block w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${reminderEnabled ? 'translate-x-5' : 'translate-x-1'}`}></span>
                            </span>
                        </label>
                    </div>

                    <div className="flex items-center gap-3">
                        <Clock size={18} className="text-[var(--color-text-tertiary)]" />
                        <input
                            type="time"
                            value={reminderTime}
                            onChange={(e) => setReminderTime(e.target.value)}
                            className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl px-3 py-2 font-ui text-sm text-[var(--color-text-primary)]"
                        />
                    </div>

                    {typeof Notification !== 'undefined' && reminderPermission !== 'granted' && (
                        <button
                            onClick={async () => {
                                const permission = await Notification.requestPermission();
                                setReminderPermission(permission);
                                if (permission !== 'granted') setReminderEnabled(false);
                            }}
                            className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl py-2 text-sm font-arabic text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] transition-colors"
                        >
                            السماح بالإشعارات
                        </button>
                    )}
                    {typeof Notification === 'undefined' && (
                        <p className="text-xs text-[var(--color-text-tertiary)] font-arabic text-right">
                            الإشعارات غير مدعومة على هذا الجهاز.
                        </p>
                    )}
                </div>

                {/* Virtue Quote */}
                <div className="text-center pt-8 border-t border-[var(--color-border)]">
                    <Star className="text-[var(--color-highlight)] w-5 h-5 mx-auto mb-4 opacity-50" />
                    <p className="font-arabic text-[var(--color-text-secondary)] italic leading-relaxed text-sm">
                        "يقال لصاحب القرآن اقرأ وارتق ورتل كما كنت ترتل في الدنيا فإن منزلتك عند آخر آية تقرؤها"
                    </p>
                </div>
            </div>
        </div>
    );
};
