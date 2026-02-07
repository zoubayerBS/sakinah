import React from 'react';
import { Moon, Sun, ChevronLeft, Globe, Bell, Clock } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle.jsx';
import { useAudio } from '../context/AudioContext.jsx';

export const SettingsPage = ({ theme, toggleTheme, onBack }) => {
    const { sleepTimer, setSleepTimer } = useAudio();

    const handleSleepTimer = (minutes) => {
        setSleepTimer(minutes);
    };
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pb-24 animate-fade-in">
            {/* Header */}
            <header className="sticky top-0 z-[var(--z-fixed)] w-full bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] px-6 py-4 shadow-[var(--shadow-sm)]">
                <div className="max-w-[1200px] mx-auto flex items-center justify-between" dir="rtl">
                    <h1 className="font-arabic font-bold text-2xl text-[var(--color-text-primary)]">
                        الإعدادات
                    </h1>
                </div>
            </header>

            <div className="max-w-[600px] mx-auto px-6 py-8 space-y-6">

                {/* Appearance Section */}
                <section className="space-y-4">
                    <h2 className="font-arabic text-lg font-bold text-[var(--color-text-secondary)] text-right px-2">
                        المظهر
                    </h2>

                    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
                        <div className="p-4 flex items-center justify-between hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer" onClick={toggleTheme}>
                            <div className="flex items-center gap-4">
                                <ThemeToggle
                                    theme={theme}
                                    onToggle={toggleTheme}
                                    className="!static !w-10 !h-10 !border-transparent !bg-transparent !shadow-none pointer-events-none"
                                />
                            </div>
                            <div className="text-right">
                                <h3 className="font-arabic font-bold text-[var(--color-text-primary)]">
                                    {theme === 'dark' ? 'الوضع الليلي' : 'الوضع النهاري'}
                                </h3>
                                <p className="font-arabic text-xs text-[var(--color-text-tertiary)] mt-1">
                                    تبديل مظهر التطبيق
                                </p>
                            </div>
                        </div>
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
                                        {sleepTimer ? `يتوقف بعد ${sleepTimer} دقيقة` : 'متوقف'}
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

                {/* General Section (Placeholders) */}
                <section className="space-y-4 opacity-50 pointer-events-none">
                    <h2 className="font-arabic text-lg font-bold text-[var(--color-text-secondary)] text-right px-2">
                        عام
                    </h2>

                    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
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
