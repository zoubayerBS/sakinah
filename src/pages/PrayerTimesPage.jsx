import React, { useState } from 'react';
import { ArrowBigRight, Search, MapPin, Calendar, Clock, Sun, Moon, CloudSun, Sunrise, Sunset } from 'lucide-react';
import { usePrayerTimes } from '../hooks/usePrayerTimes.js';
import { useNavigate } from 'react-router-dom';

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

export const PrayerTimesPage = () => {
    const navigate = useNavigate();
    const { timings, date, meta, loading, error, city, country, fetchPrayerTimes } = usePrayerTimes();
    const [searchCity, setSearchCity] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchCity.trim()) {
            fetchPrayerTimes(searchCity, 'Tunisia'); // Default country to Tunisia for now, can expand later
            setSearchCity('');
        }
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
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-full transition-colors">
                            <ArrowBigRight className="w-6 h-6 text-[var(--color-text-secondary)] rotate-180" />
                        </button>
                        <h1 className="font-arabic font-bold text-2xl text-[var(--color-text-primary)]">
                            مواقيت الصلاة
                        </h1>
                    </div>
                </div>
            </header>

            <div className="max-w-[600px] mx-auto px-6 py-8 space-y-8">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative group">
                    <input
                        type="text"
                        value={searchCity}
                        onChange={(e) => setSearchCity(e.target.value)}
                        placeholder="...ابحث عن مدينتك"
                        className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl py-4 pr-12 pl-4 text-right font-arabic placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary)] transition-all shadow-sm group-hover:shadow-md"
                        dir="rtl"
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] w-5 h-5" />
                </form>

                {/* City & Date Info */}
                {date && (
                    <div className="text-center space-y-2 animate-slide-up">
                        <div className="flex items-center justify-center gap-2 text-[var(--color-text-secondary)]">
                            <MapPin size={18} />
                            <h2 className="font-ui font-bold text-lg">{city}, {country}</h2>
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
