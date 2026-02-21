import React from 'react';
import {
    Moon,
    Sun,
    ArrowLeft,
    ChevronRight,
    Volume2,
    Clock,
    Info,
    Share2,
    Github,
    Download,
    Globe,
    Bell,
    Sunset
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle.jsx';
import { useAudio } from '../context/AudioContext.jsx';
import { usePWAInstall } from '../hooks/usePWAInstall.js';

export const SettingsPage = ({ theme, toggleTheme, setTheme, onBack, autoNightMode, setAutoNightMode }) => {
    const { sleepTimer, setSleepTimer, sleepTimerRemaining } = useAudio();
    const { isInstallable, promptInstall } = usePWAInstall();

    const handleSleepTimer = (minutes) => {
        setSleepTimer(minutes);
    };
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
                            الإعدادات
                        </h1>
                    </div>
                </div>
            </header>

            <div className="max-w-[600px] mx-auto px-6 py-8 space-y-6">

                {/* Appearance Section */}
                <section className="space-y-4">
                    <h2 className="font-arabic text-lg font-bold text-[var(--color-text-secondary)] text-right px-2">
                        المظهر (Thèmes)
                    </h2>

                    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6">
                        <div className="grid grid-cols-3 gap-4" dir="rtl">
                            {[
                                { id: 'light', name: 'نهاري', sub: 'Beige', bg: '#F5F1E8', text: '#2C2416' },
                                { id: 'white', name: 'أبيض', sub: 'Blanc', bg: '#FFFFFF', text: '#1A1A2E' },
                                { id: 'dark', name: 'ليلي', sub: 'Sombre', bg: '#1A1612', text: '#F5F1E8' },
                                { id: 'manuscript', name: 'منشور', sub: 'Parchmin', bg: '#F4ECD8', text: '#2B1B17' },
                                { id: 'damas', name: 'دمشقي', sub: 'Damas', bg: '#F8FAF9', text: '#1A3A34' },
                                { id: 'royal', name: 'ملكي', sub: 'Royal', bg: '#0F172A', text: '#F1F5F9' },
                            ].map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTheme(t.id)}
                                    className={`flex flex-col items-center gap-3 p-3 rounded-[var(--radius-md)] transition-all border-2 ${theme === t.id
                                        ? 'border-[var(--color-accent)] bg-[var(--color-bg-tertiary)] shadow-lg scale-105'
                                        : 'border-transparent hover:bg-[var(--color-bg-tertiary)]/50'
                                        }`}
                                >
                                    <div
                                        className="w-12 h-12 rounded-full border border-[var(--color-border)] shadow-inner flex items-center justify-center overflow-hidden"
                                        style={{ backgroundColor: t.bg }}
                                    >
                                        <div className="w-6 h-1 bg-[currentColor]" style={{ color: t.text }}></div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="font-arabic text-sm font-bold text-[var(--color-text-primary)]">{t.name}</span>
                                        <span className="text-[10px] text-[var(--color-text-tertiary)] font-bold tracking-wider uppercase">{t.sub}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Auto Night Mode Toggle */}
                    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 flex items-center justify-between" dir="rtl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)]">
                                <Sunset size={20} />
                            </div>
                            <div>
                                <h3 className="font-arabic font-bold text-[var(--color-text-primary)]">الوضع الليلي التلقائي</h3>
                                <p className="font-arabic text-xs text-[var(--color-text-tertiary)]">تبديل تلقائي بعد المغرب والفجر</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setAutoNightMode(!autoNightMode)}
                            className={`w-12 h-7 rounded-full transition-all duration-300 relative ${autoNightMode ? 'bg-[var(--color-accent)]' : 'bg-black/10 dark:bg-white/10'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-all duration-300 ${autoNightMode ? 'right-1' : 'right-6'}`} />
                        </button>
                    </div>
                </section>

                {/* Audio Section */}
                <section className="space-y-4">
                    <h2 className="font-arabic text-lg font-bold text-[var(--color-text-secondary)] text-right px-2">
                        الصوت
                    </h2>

                    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
                        <div className="p-4 border-b border-[var(--color-border)]">
                            <div className="flex items-center justify-between mb-4">
                                <Clock size={20} className="text-[var(--color-text-tertiary)]" />
                                <div className="text-right">
                                    <h3 className="font-arabic font-bold text-[var(--color-text-primary)]">مؤقت النوم</h3>
                                    <p className="font-arabic text-xs text-[var(--color-text-tertiary)]">
                                        {sleepTimerRemaining !== null
                                            ? `يتبقى ${Math.floor(sleepTimerRemaining / 60)}:${(sleepTimerRemaining % 60).toString().padStart(2, '0')}`
                                            : 'متوقف'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-end gap-2">
                                {[null, 15, 30, 60].map((mins) => (
                                    <button
                                        key={mins || 'off'}
                                        onClick={() => handleSleepTimer(mins)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${sleepTimer === mins
                                            ? 'bg-[var(--color-accent)] text-white'
                                            : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-primary)]'
                                            }`}
                                    >
                                        {mins ? `${mins} دقيقة` : 'إيقاف'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* General Section */}
                <section className="space-y-4">
                    <h2 className="font-arabic text-lg font-bold text-[var(--color-text-secondary)] text-right px-2">
                        عام
                    </h2>

                    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
                        {isInstallable && (
                            <button
                                onClick={promptInstall}
                                className="w-full flex items-center justify-between p-4 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors border-b border-[var(--color-border)]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                                        <Download size={20} />
                                    </div>
                                    <span className="font-arabic text-[var(--color-text-primary)]">تثبيت التطبيق</span>
                                </div>
                                <ChevronRight size={20} className="text-[var(--color-text-tertiary)] rotate-180" />
                            </button>
                        )}
                        <div className="p-4 flex items-center justify-between border-b border-[var(--color-border)]">
                            <Globe size={20} className="text-[var(--color-text-tertiary)]" />
                            <div className="text-right">
                                <h3 className="font-arabic font-bold text-[var(--color-text-primary)]">اللغة</h3>
                                <p className="font-arabic text-xs text-[var(--color-text-tertiary)]">العربية</p>
                            </div>
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <Bell size={20} className="text-[var(--color-text-tertiary)]" />
                            <div className="text-right">
                                <h3 className="font-arabic font-bold text-[var(--color-text-primary)]">التنبيهات</h3>
                                <p className="font-arabic text-xs text-[var(--color-text-tertiary)]">مفعلة</p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="text-center pt-8">
                    <p className="text-xs text-[var(--color-text-tertiary)] font-arabic">
                        الإصدار 1.0.0
                    </p>
                </div>
            </div>
        </div>
    );
};
