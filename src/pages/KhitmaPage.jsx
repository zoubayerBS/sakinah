import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calculator, Calendar, BookOpen, Hash, Star } from 'lucide-react';

export const KhitmaPage = ({ onBack }) => {
    const [days, setDays] = useState(30);
    const [mode, setMode] = useState('pages'); // 'pages' or 'verses'
    const [isStarted, setIsStarted] = useState(false);
    const [progress, setProgress] = useState(0); // number of portions finished
    const [results, setResults] = useState({ daily: 0, perPrayer: 0, totalPortions: 0 });

    const TOTAL_PAGES = 604;
    const TOTAL_VERSES = 6236;

    // Load state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('khitma_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            setDays(parsed.days);
            setMode(parsed.mode);
            setIsStarted(parsed.isStarted);
            setProgress(parsed.progress);
        }
    }, []);

    // Sync state to localStorage
    useEffect(() => {
        const state = { days, mode, isStarted, progress };
        localStorage.setItem('khitma_state', JSON.stringify(state));
    }, [days, mode, isStarted, progress]);

    useEffect(() => {
        const total = mode === 'pages' ? TOTAL_PAGES : TOTAL_VERSES;
        const daily = Math.ceil(total / days);
        const perPrayer = Math.ceil(daily / 5);
        const totalPortions = days * 5;
        setResults({ daily, perPrayer, totalPortions });
    }, [days, mode]);

    const handleDaysChange = (e) => {
        const val = parseInt(e.target.value);
        if (val > 0) setDays(val);
    };

    const handleStart = () => {
        setIsStarted(true);
        setProgress(0);
    };

    const handleReset = () => {
        if (window.confirm('هل أنت متأكد من رغبتك في إعادة ضبط الختمة؟')) {
            setIsStarted(false);
            setProgress(0);
        }
    };

    const handleFinishPortion = () => {
        if (progress < results.totalPortions) {
            setProgress(prev => prev + 1);
        }
    };

    const getCompletionDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + (days - Math.floor(progress / 5)));
        return date.toLocaleDateString('ar-TN', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const progressPercentage = Math.min(100, Math.round((progress / results.totalPortions) * 100));
    const remainingDays = Math.max(0, days - Math.floor(progress / 5));

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
                            <button
                                onClick={handleReset}
                                className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl p-6 text-center shadow-sm hover:border-[var(--color-error)]/30 transition-all group"
                            >
                                <p className="font-arabic text-xs text-[var(--color-text-tertiary)] mb-2">إعادة الضبط</p>
                                <p className="font-arabic font-bold text-[var(--color-error)] group-hover:scale-110 transition-transform">بدء من جديد</p>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Configuration View */
                    <div className="space-y-8 animate-fade-in">
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
