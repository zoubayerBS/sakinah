import React, { useState, useEffect } from 'react'; // Fix: Ensure useEffect is imported for Vercel build
import { ArrowLeft, Search, MapPin, Calendar, Clock, Sun, Moon, CloudSun, Sunrise, Sunset } from 'lucide-react';
import { usePrayerTimes } from '../hooks/usePrayerTimes.js';
import { useCitySuggestions } from '../hooks/useCitySuggestions.js';

const PrayerTimeCard = ({ name, time, icon: Icon, isNext }) => (
    <div className={`p-4 rounded-2xl flex items-center justify-between border transition-all duration-300 ${isNext
        ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] scale-[1.02] shadow-md'
        : 'bg-[var(--color-bg-secondary)] border-[var(--color-border)] hover:border-[var(--color-text-tertiary)]'
        }`}>
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isNext
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)]'
                }`}>
                <Icon size={20} />
            </div>
            <div>
                <h3 className={`font-arabic font-bold text-lg ${isNext ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'}`}>
                    {name}
                </h3>
            </div>
        </div>
        <span className={`font-ui font-bold text-xl ${isNext ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
            {time}
        </span>
    </div>
);

export const PrayerTimesPage = ({ onBack }) => {
    const { timings, date, meta, loading, error, city, fetchPrayerTimes } = usePrayerTimes();
    const { suggestions, loading: suggestionsLoading, fetchSuggestions, clearSuggestions } = useCitySuggestions();
    const [searchCity, setSearchCity] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');

    // Countdown logic
    useEffect(() => {
        if (!timings) return;

        const updateTimer = () => {
            const now = new Date();
            const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

            const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
            let next = null;
            let targetSeconds = 0;

            for (const prayer of prayers) {
                const [hours, minutes] = timings[prayer].split(':').map(Number);
                const prayerSeconds = hours * 3600 + minutes * 60;
                if (prayerSeconds > currentSeconds) {
                    next = prayer;
                    targetSeconds = prayerSeconds;
                    break;
                }
            }

            if (!next) {
                // If all passed, target is tomorrow's Fajr
                const [hours, minutes] = timings['Fajr'].split(':').map(Number);
                targetSeconds = (24 * 3600) + (hours * 3600 + minutes * 60);
            }

            const diff = targetSeconds - currentSeconds;
            const h = Math.floor(diff / 3600);
            const m = Math.floor((diff % 3600) / 60);
            const s = Math.floor(diff % 60);

            setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [timings]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchCity.trim()) {
            fetchPrayerTimes(searchCity.trim());
            setSearchCity('');
            setShowSuggestions(false);
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setSearchCity(val);
        fetchSuggestions(val);
        setShowSuggestions(true);
    };

    const handleSelectSuggestion = (suggestion) => {
        fetchPrayerTimes(suggestion.label);
        setSearchCity('');
        clearSuggestions();
        setShowSuggestions(false);
    };

    const prayerIcons = {
        Fajr: CloudSun,
        Sunrise: Sunrise,
        Dhuhr: Sun,
        Asr: CloudSun,
        Maghrib: Sunset,
        Isha: Moon,
    };

    const prayerNamesAr = {
        Fajr: 'الفجر',
        Sunrise: 'الشروق',
        Dhuhr: 'الظهر',
        Asr: 'العصر',
        Maghrib: 'المغرب',
        Isha: 'العشاء',
    };

    // Helper to determine next prayer (simplified logic for now)
    const getNextPrayer = () => {
        if (!timings) return null;
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        for (const prayer of prayers) {
            const [hours, minutes] = timings[prayer].split(':').map(Number);
            const prayerMinutes = hours * 60 + minutes;
            if (prayerMinutes > currentMinutes) return prayer;
        }
        return 'Fajr'; // If all passed, next is Fajr tomorrow
    };

    const nextPrayer = getNextPrayer();

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
                            مواقيت الصلاة
                        </h1>
                    </div>
                </div>
            </header>

            <div className="max-w-[600px] mx-auto px-6 py-8 space-y-8">
                {/* Search Bar */}
                <div className="relative z-[var(--z-dropdown)]">
                    <form onSubmit={handleSearch} className="relative group">
                        <input
                            type="text"
                            value={searchCity}
                            onChange={handleInputChange}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder="...ابحث عن مدينتك"
                            className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl py-4 pr-12 pl-4 text-right font-arabic placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary)] transition-all shadow-sm group-hover:shadow-md"
                            dir="rtl"
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] w-5 h-5" />
                    </form>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden animate-fade-in z-50" dir="rtl">
                            {suggestions.map((suggestion) => (
                                <button
                                    key={suggestion.id}
                                    onClick={() => handleSelectSuggestion(suggestion)}
                                    className="w-full px-6 py-4 text-right hover:bg-[var(--color-bg-tertiary)] transition-colors flex items-center justify-between group border-b border-[var(--color-border)] last:border-0 active:bg-[var(--color-bg-tertiary)]"
                                >
                                    <span className="font-arabic text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                                        {suggestion.label}
                                    </span>
                                    <MapPin size={16} className="text-[var(--color-text-tertiary)]" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Loading State for Suggestions */}
                    {suggestionsLoading && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-4 text-center z-50">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--color-primary)] mx-auto"></div>
                        </div>
                    )}
                </div>

                {/* City & Date Info */}
                {date && (
                    <div className="text-center space-y-4 animate-slide-up">
                        {/* Countdown Hero */}
                        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl p-6 shadow-sm overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-primary)]/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                            <div className="flex flex-col items-center gap-2 relative z-10" dir="rtl">
                                <p className="font-arabic text-[var(--color-text-secondary)] text-sm">باقي على صلاة {prayerNamesAr[nextPrayer]}</p>
                                <div className="text-4xl font-ui font-black text-[var(--color-primary)] tracking-wider">
                                    {timeLeft}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2 text-[var(--color-text-secondary)]">
                                <MapPin size={18} />
                                <h2 className="font-ui font-bold text-lg">{city}</h2>
                            </div>
                            <div className="flex items-center justify-center gap-6 text-sm text-[var(--color-text-tertiary)]">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span className="font-ui">{date.hijri?.day} {date.hijri?.month?.ar} {date.hijri?.year}</span>
                                </div>
                                <div className="w-px h-4 bg-[var(--color-border)]"></div>
                                <span className="font-ui">{date.gregorian?.date}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Prayer Times List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-[var(--color-error)] font-arabic">
                        فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.
                    </div>
                ) : (
                    <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        {['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => (
                            <PrayerTimeCard
                                key={prayer}
                                name={prayerNamesAr[prayer]}
                                time={timings[prayer]}
                                icon={prayerIcons[prayer]}
                                isNext={nextPrayer === prayer}
                            />
                        ))}
                    </div>
                )}

                {/* Source Attribution */}
                {meta && (
                    <div className="text-center text-xs text-[var(--color-text-tertiary)] font-ui mt-8 opacity-70">
                        المصدر: {meta.method?.name}
                    </div>
                )}
            </div>
        </div>
    );
};
