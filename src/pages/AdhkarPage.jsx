import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Sun, Moon, RotateCcw, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { morningAdhkar, eveningAdhkar } from '../data/adhkar-data.js';
import { tapTick, tapSuccess } from '../utils/haptics.js';

export const AdhkarPage = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('morning'); // 'morning' | 'evening'
    const [counters, setCounters] = useState({});
    const [currentIndex, setCurrentIndex] = useState(0);

    const adhkarList = activeTab === 'morning' ? morningAdhkar : eveningAdhkar;
    const currentDhikr = adhkarList[currentIndex];
    const currentCount = counters[currentDhikr?.id] || 0;
    const isComplete = currentCount >= (currentDhikr?.count || 1);

    // Daily reset
    useEffect(() => {
        const storageKey = `adhkar-${activeTab}-date`;
        const today = new Date().toISOString().split('T')[0];
        const saved = localStorage.getItem(storageKey);
        if (saved !== today) {
            setCounters({});
            localStorage.setItem(storageKey, today);
        }
    }, [activeTab]);

    const handleTap = useCallback(() => {
        if (!currentDhikr || isComplete) return;
        tapTick();
        const newCount = currentCount + 1;
        setCounters(prev => ({ ...prev, [currentDhikr.id]: newCount }));

        // Auto advance when complete
        if (newCount >= currentDhikr.count) {
            tapSuccess();
            setTimeout(() => {
                if (currentIndex < adhkarList.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                }
            }, 600);
        }
    }, [currentDhikr, currentCount, isComplete, currentIndex, adhkarList.length]);

    const handleReset = () => {
        setCounters(prev => ({ ...prev, [currentDhikr.id]: 0 }));
    };

    const totalComplete = adhkarList.filter(d => (counters[d.id] || 0) >= d.count).length;
    const progressPercent = Math.round((totalComplete / adhkarList.length) * 100);

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pb-24 animate-fade-in" dir="rtl">
            {/* Header */}
            <header className="sticky top-0 z-[var(--z-fixed)] w-full bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] px-6 py-4 shadow-[var(--shadow-sm)]">
                <div className="max-w-[600px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:bg-[var(--color-accent)] hover:text-white transition-all group"
                        >
                            <ArrowLeft size={20} className="rotate-180 group-hover:scale-110 transition-transform" />
                        </button>
                        <h1 className="font-arabic font-black text-2xl text-[var(--color-text-primary)]">الأذكار</h1>
                    </div>
                    <div className="font-ui font-black text-sm text-[var(--color-accent)]">{progressPercent}%</div>
                </div>
            </header>

            <div className="max-w-[600px] mx-auto px-6 py-6 space-y-6">
                {/* Tab Switcher */}
                <div className="flex bg-[var(--color-bg-secondary)] rounded-2xl p-1.5 border border-[var(--color-border)]">
                    <button
                        onClick={() => { setActiveTab('morning'); setCurrentIndex(0); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-arabic font-bold transition-all ${activeTab === 'morning' ? 'bg-[var(--color-accent)] text-white shadow-lg' : 'text-[var(--color-text-tertiary)]'
                            }`}
                    >
                        <Sun size={16} />
                        أذكار الصباح
                    </button>
                    <button
                        onClick={() => { setActiveTab('evening'); setCurrentIndex(0); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-arabic font-bold transition-all ${activeTab === 'evening' ? 'bg-[var(--color-accent)] text-white shadow-lg' : 'text-[var(--color-text-tertiary)]'
                            }`}
                    >
                        <Moon size={16} />
                        أذكار المساء
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                {/* Current Dhikr Card */}
                {currentDhikr && (
                    <div
                        className="relative bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl p-8 shadow-lg cursor-pointer select-none active:scale-[0.98] transition-transform"
                        onClick={handleTap}
                    >
                        {/* Dhikr Number */}
                        <div className="flex items-center justify-between mb-6">
                            <span className="font-ui font-black text-xs text-[var(--color-text-tertiary)]">
                                {currentIndex + 1}/{adhkarList.length}
                            </span>
                            <span className="font-arabic text-xs text-[var(--color-accent)] font-bold">
                                {currentDhikr.ref}
                            </span>
                        </div>

                        {/* Dhikr Text */}
                        <p className="font-arabic font-bold text-2xl leading-loose text-[var(--color-text-primary)] text-center mb-8">
                            {currentDhikr.text}
                        </p>

                        {/* Counter */}
                        <div className="flex items-center justify-center gap-4">
                            <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${isComplete
                                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                                    : 'border-[var(--color-accent)]/30 text-[var(--color-text-primary)]'
                                }`}>
                                {isComplete ? (
                                    <Check size={32} />
                                ) : (
                                    <span className="font-ui font-black text-2xl">{currentCount}</span>
                                )}
                            </div>
                        </div>

                        <p className="text-center font-arabic text-sm text-[var(--color-text-tertiary)] mt-3">
                            {isComplete ? 'تم ✓' : `${currentCount} / ${currentDhikr.count}`}
                        </p>

                        {/* Reset button */}
                        {currentCount > 0 && !isComplete && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleReset(); }}
                                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-red-500 transition-colors"
                            >
                                <RotateCcw size={14} />
                            </button>
                        )}
                    </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                        disabled={currentIndex === 0}
                        className="w-12 h-12 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-center justify-center disabled:opacity-20 hover:bg-[var(--color-bg-tertiary)] transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>

                    {/* Dot indicators */}
                    <div className="flex gap-1.5 overflow-hidden max-w-[60%] justify-center flex-wrap">
                        {adhkarList.map((d, i) => (
                            <button
                                key={d.id}
                                onClick={() => setCurrentIndex(i)}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentIndex
                                        ? 'bg-[var(--color-accent)] scale-125'
                                        : (counters[d.id] || 0) >= d.count
                                            ? 'bg-emerald-500'
                                            : 'bg-black/10 dark:bg-white/10'
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentIndex(Math.min(adhkarList.length - 1, currentIndex + 1))}
                        disabled={currentIndex === adhkarList.length - 1}
                        className="w-12 h-12 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-center justify-center disabled:opacity-20 hover:bg-[var(--color-bg-tertiary)] transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
