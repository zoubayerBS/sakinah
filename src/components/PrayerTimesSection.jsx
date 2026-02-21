import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, Sun, Moon, CloudSun, Sunrise, Sunset, Loader2 } from 'lucide-react';
import { usePrayerTimes } from '../hooks/usePrayerTimes.js';

// Compute Umm al-Qura Hijri date locally
const getUmmAlQuraDate = (adjustment = -1) => {
    const now = new Date();
    now.setDate(now.getDate() + adjustment);
    const day = new Intl.DateTimeFormat('ar-u-ca-islamic-umalqura-nu-latn', { day: 'numeric' }).format(now);
    const month = new Intl.DateTimeFormat('ar-u-ca-islamic-umalqura', { month: 'long' }).format(now);
    const year = new Intl.DateTimeFormat('ar-u-ca-islamic-umalqura-nu-latn', { year: 'numeric' }).format(now).replace(/\s*هـ$/, '');
    return { day, month, year };
};

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
            <div className={`w-full py-8 flex items-center justify-center bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-sm rounded-3xl animate-pulse`}>
                <Loader2 className="animate-spin opacity-50" size={24} />
            </div>
        );
    }

    if (error || !timings) return null;

    return (
        <section className="w-full animate-fade-in" dir="rtl">
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl p-6 shadow-sm group relative overflow-hidden">

                {/* Header: Location & Date */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] flex items-center justify-center">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h3 className="font-arabic font-black text-xl lg:text-2xl text-[var(--color-text-primary)] tracking-tight">{city}</h3>
                            <p className="text-xs text-[var(--color-text-tertiary)] opacity-80 font-ui font-bold">Moknine, Tunisia</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-[var(--color-text-primary)] bg-[var(--color-bg-tertiary)] px-4 py-2 rounded-xl">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-[var(--color-accent)]" />
                            <span className="font-arabic font-bold text-sm lg:text-lg">{getUmmAlQuraDate().day} {getUmmAlQuraDate().month}</span>
                        </div>
                        <div className="w-px h-6 bg-black/10 dark:bg-white/10"></div>
                        <div className="font-ui font-black opacity-60 tracking-tighter text-xs">{date.gregorian?.date}</div>
                    </div>
                </div>

                {/* Fasting Progress Bar */}
                <div className="mb-8 p-6 bg-[var(--color-bg-tertiary)] rounded-2xl relative overflow-hidden">
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

                    <div className="relative h-2 w-full bg-[var(--color-border)] rounded-full overflow-hidden">
                        <div
                            className="absolute top-0 right-0 h-full bg-[var(--color-accent)] transition-all duration-1000 ease-out"
                            style={{ width: `${fastingProgress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Prayer Times List */}
                <div className="flex flex-col gap-2">
                    {['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((p) => {
                        const isActive = p === nextPrayerName;
                        const Icon = prayerIcons[p];
                        return (
                            <div
                                key={p}
                                className={`flex flex-row items-center justify-between px-4 py-3 rounded-xl border transition-all ${isActive
                                    ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/30'
                                    : 'bg-transparent border-transparent text-[var(--color-text-primary)]'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={18} className={isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-tertiary)]'} />
                                    <span className={`font-arabic font-bold text-sm lg:text-base`}>
                                        {prayerNamesAr[p]}
                                    </span>
                                </div>
                                <span className={`font-ui font-bold text-base`}>{timings[p]}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default PrayerTimesSection;
