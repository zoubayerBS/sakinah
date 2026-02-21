import React, { useState, useEffect, useMemo } from 'react';
import { Moon, Utensils, Timer, Check, Flame } from 'lucide-react';
import { usePrayerTimes } from '../hooks/usePrayerTimes.js';
import { tapMedium, tapSuccess } from '../utils/haptics.js';

// Umm al-Qura Hijri date helper
const getHijriInfo = () => {
    const now = new Date();
    now.setDate(now.getDate() - 1); // -1 day adjustment
    const month = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { month: 'numeric' }).format(now);
    const day = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric' }).format(now);
    return { month: parseInt(month), day: parseInt(day) };
};

const RamadanWidget = () => {
    const { timings } = usePrayerTimes();
    const [fastingLog, setFastingLog] = useState(() => {
        try { return JSON.parse(localStorage.getItem('ramadan-fasting-log') || '{}'); }
        catch { return {}; }
    });
    const [countdown, setCountdown] = useState('');

    const hijri = getHijriInfo();
    const isRamadan = hijri.month === 9;
    const ramadanDay = isRamadan ? hijri.day : 0;

    // Persist fasting log
    useEffect(() => {
        localStorage.setItem('ramadan-fasting-log', JSON.stringify(fastingLog));
    }, [fastingLog]);

    // Iftar countdown
    useEffect(() => {
        if (!timings?.Maghrib || !isRamadan) return;

        const updateCountdown = () => {
            const now = new Date();
            const [h, m] = timings.Maghrib.split(':').map(Number);
            const maghrib = new Date(now);
            maghrib.setHours(h, m, 0, 0);

            const diff = maghrib - now;
            if (diff <= 0) {
                setCountdown('حان وقت الإفطار! 🎉');
                return;
            }
            const hours = Math.floor(diff / 3600000);
            const mins = Math.floor((diff % 3600000) / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            setCountdown(`${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [timings?.Maghrib, isRamadan]);

    const todayKey = new Date().toISOString().split('T')[0];
    const fastedToday = fastingLog[todayKey] === true;
    const totalFastDays = Object.values(fastingLog).filter(v => v === true).length;

    const toggleFasting = () => {
        tapMedium();
        setFastingLog(prev => ({
            ...prev,
            [todayKey]: !prev[todayKey]
        }));
    };

    if (!isRamadan) return null;

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1040] to-[#0d0a20] text-white p-6 shadow-2xl" dir="rtl">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                        <Moon size={22} className="text-amber-400" />
                    </div>
                    <div>
                        <h3 className="font-arabic font-black text-xl">رمضان كريم</h3>
                        <p className="text-xs text-white/50 font-ui font-bold">اليوم {ramadanDay} من 30</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Flame size={14} className="text-amber-400" />
                    <span className="font-ui font-black text-sm text-amber-400">{totalFastDays}</span>
                </div>
            </div>

            {/* Progress Ring */}
            <div className="relative z-10 flex items-center gap-6 mb-5">
                <div className="relative w-20 h-20">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                        <circle
                            cx="18" cy="18" r="15.5" fill="none" stroke="url(#ramadanGrad)" strokeWidth="3"
                            strokeDasharray={`${(ramadanDay / 30) * 97.4} 97.4`}
                            strokeLinecap="round"
                        />
                        <defs>
                            <linearGradient id="ramadanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#f59e0b" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-ui font-black text-lg">{ramadanDay}</span>
                    </div>
                </div>

                {/* Iftar Countdown */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Timer size={14} className="text-purple-400" />
                        <span className="text-xs text-white/50 font-arabic font-bold">الإفطار</span>
                    </div>
                    <p className="font-ui font-black text-2xl tracking-tight" dir="ltr">{countdown || '--:--:--'}</p>
                    {timings && (
                        <div className="flex gap-4 mt-2 text-[10px] text-white/40 font-ui font-bold">
                            <span>إمساك {timings.Imsak?.split(' ')[0]}</span>
                            <span>إفطار {timings.Maghrib?.split(' ')[0]}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Fasting Toggle */}
            <button
                onClick={toggleFasting}
                className={`relative z-10 w-full flex items-center justify-center gap-3 py-3 rounded-2xl font-arabic font-bold transition-all duration-300 ${fastedToday
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                    }`}
            >
                {fastedToday ? <Check size={18} /> : <Utensils size={18} />}
                {fastedToday ? 'صائم اليوم ✓' : 'تسجيل الصيام'}
            </button>
        </div>
    );
};

export default RamadanWidget;
