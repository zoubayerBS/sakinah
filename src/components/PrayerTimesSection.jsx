import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, Sun, Moon, CloudSun, Sunrise, Sunset, Loader2 } from 'lucide-react';
import { usePrayerTimes } from '../hooks/usePrayerTimes.js';

const PrayerTimesSection = () => {
    // Default to Tunis for now, can be made dynamic later or use existing hook defaults
    const { timings, date, meta, loading, error, city } = usePrayerTimes();
    const [timeLeft, setTimeLeft] = useState('');
    const [nextPrayerName, setNextPrayerName] = useState('');

    const prayerNamesAr = {
        Fajr: 'الفجر',
        Sunrise: 'الشروق',
        Dhuhr: 'الظهر',
        Asr: 'العصر',
        Maghrib: 'المغرب',
        Isha: 'العشاء',
        Imsak: 'الإمساك',
    };

    const prayerIcons = {
        Fajr: CloudSun,
        Sunrise: Sunrise,
        Dhuhr: Sun,
        Asr: CloudSun,
        Maghrib: Sunset,
        Isha: Moon,
        Imsak: Moon,
    };

    const [fastingProgress, setFastingProgress] = useState(0);

    // Next Prayer & Fasting Progress Logic
    useEffect(() => {
        if (!timings) return;

        const updateStatus = () => {
            const now = new Date();
            const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

            // 1. Next Prayer Logic
            const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
            let next = null;

            for (const prayer of prayers) {
                const time = timings[prayer];
                if (!time) continue;

                const [h, m] = time.split(':').map(Number);
                const prayerSeconds = h * 3600 + m * 60;

                if (prayerSeconds > currentSeconds) {
                    next = prayer;
                    break;
                }
            }
            if (!next) next = 'Fajr';
            setNextPrayerName(next);

            // 2. Fasting Progress Logic (Imsak to Maghrib)
            const [imsakH, imsakM] = timings.Imsak.split(':').map(Number);
            const imsakSeconds = imsakH * 3600 + imsakM * 60;

            const [maghribH, maghribM] = timings.Maghrib.split(':').map(Number);
            const maghribSeconds = maghribH * 3600 + maghribM * 60;

            const totalFastingDetails = maghribSeconds - imsakSeconds;
            const elapsedFasting = currentSeconds - imsakSeconds;

            // Calculate progress percentage
            let progress = 0;
            if (currentSeconds < imsakSeconds) {
                progress = 0; // Not started
            } else if (currentSeconds > maghribSeconds) {
                progress = 100; // Finished
            } else {
                progress = (elapsedFasting / totalFastingDetails) * 100;
            }
            setFastingProgress(Math.min(100, Math.max(0, progress)));

            // 3. Time Left to Iftar (Maghrib)
            if (currentSeconds < maghribSeconds) {
                const diff = maghribSeconds - currentSeconds;
                const h = Math.floor(diff / 3600);
                const m = Math.floor((diff % 3600) / 60);
                // Only show if reasonably close or during the day
                if (diff > 0 && currentSeconds >= imsakSeconds) {
                    setTimeLeft(`${h}س ${m}د`);
                } else {
                    setTimeLeft('');
                }
            } else {
                setTimeLeft('');
            }
        };

        updateStatus();
        const interval = setInterval(updateStatus, 60000);
        return () => clearInterval(interval);
    }, [timings]);

    if (loading) {
        return (
            <div className={`w-full py-8 flex items-center justify-center glass-premium rounded-3xl animate-pulse`}>
                <Loader2 className="animate-spin opacity-50" size={24} />
            </div>
        );
    }

    if (error || !timings) return null;

    return (
        <section className="w-full animate-fade-in" dir="rtl">
            <div className="glass-premium rounded-[2.5rem] p-6 lg:p-8 shadow-2xl hover:border-[var(--color-accent)]/40 transition-all duration-700 group relative overflow-hidden">

                {/* Header: Location & Date */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 lg:mb-10 pb-6 lg:pb-8 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-[var(--color-accent)] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h3 className="font-arabic font-black text-xl lg:text-2xl text-[var(--color-text-primary)] tracking-tight">{city}</h3>
                            <p className="text-xs text-[var(--color-text-tertiary)] opacity-80 font-ui font-bold">Moknine, Tunisia</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-[var(--color-text-primary)] bg-black/5 dark:bg-white/5 px-4 py-2 lg:px-6 lg:py-3 rounded-xl lg:rounded-2xl border border-white/20 backdrop-blur-sm shadow-inner">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-[var(--color-accent)]" />
                            <span className="font-arabic font-bold text-sm lg:text-lg">{date.hijri?.day} {date.hijri?.month?.ar}</span>
                        </div>
                        <div className="w-px h-6 bg-black/10 dark:bg-white/10"></div>
                        <div className="font-ui font-black opacity-60 tracking-tighter text-xs">{date.gregorian?.date}</div>
                    </div>
                </div>

                {/* Fasting Progress Bar */}
                <div className="mb-8 lg:mb-12 p-6 lg:p-8 bg-black/5 dark:bg-white/5 rounded-3xl border border-white/10 shadow-inner relative overflow-hidden group/fasting">
                    <div className="absolute inset-0 shimmer opacity-0 group-hover/fasting:opacity-10 transition-opacity"></div>
                    <div className="flex justify-between items-end mb-4 relative z-10">
                        <div className="flex flex-col items-start gap-1">
                            <span className="text-[10px] lg:text-xs text-[var(--color-text-tertiary)] font-arabic font-bold">الإمساك</span>
                            <span className="text-base lg:text-lg font-ui font-black text-[var(--color-text-primary)]">{timings.Imsak}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-xs lg:text-sm font-arabic text-[var(--color-accent)] font-black mb-1 animate-pulse-slow">
                                {timeLeft ? `متبقي ${timeLeft}` : 'صيام مقبول'}
                            </span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] lg:text-xs text-[var(--color-text-tertiary)] font-arabic font-bold">الإفطار</span>
                            <span className="text-base lg:text-lg font-ui font-black text-[var(--color-text-primary)]">{timings.Maghrib}</span>
                        </div>
                    </div>

                    <div className="relative h-3 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                        <div
                            className="absolute top-0 right-0 h-full bg-gradient-to-l from-[var(--color-highlight)] via-[var(--color-accent)] to-[var(--color-highlight)] transition-all duration-1000 ease-out liquid-progress shadow-[0_0_20px_rgba(92,107,74,0.3)]"
                            style={{ width: `${fastingProgress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Prayer Times List (Responsive Grid to Vertical List) */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-2 lg:gap-3">
                    {['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((p) => {
                        const isActive = p === nextPrayerName;
                        const Icon = prayerIcons[p];
                        return (
                            <div
                                key={p}
                                className={`flex flex-row items-center justify-between px-4 py-3 lg:px-5 lg:py-4 rounded-2xl border transition-all duration-500 relative group/p ${isActive
                                    ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-xl z-10 scale-[1.02]'
                                    : 'bg-white/5 dark:bg-black/5 border-white/10 text-[var(--color-text-primary)] hover:border-[var(--color-accent)]/30'
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute -inset-1 bg-[var(--color-accent)] blur opacity-40 rounded-2xl -z-10 animate-pulse-slow"></div>
                                )}
                                <div className="flex items-center gap-3">
                                    <Icon size={18} className={isActive ? 'text-white' : 'text-[var(--color-accent)] group-hover/p:scale-110 transition-transform'} />
                                    <span className={`font-arabic font-black ${isActive ? 'text-white' : 'text-[var(--color-text-primary)] opacity-80'} text-sm lg:text-base`}>
                                        {prayerNamesAr[p]}
                                    </span>
                                </div>
                                <span className={`font-ui font-black tracking-tight ${isActive ? 'text-white' : 'opacity-100'} text-base lg:text-lg`}>{timings[p]}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default PrayerTimesSection;
