import React, { useEffect, useRef } from 'react';
import { Star } from 'lucide-react';

const TraditionalMarker = ({ number, isCompleted, isCurrent }) => (
    <div className={`relative w-16 h-16 flex items-center justify-center transition-all duration-700 ${isCurrent ? 'scale-125' : 'hover:scale-105'}`}>
        <svg viewBox="0 0 40 40" className={`absolute inset-0 w-full h-full transition-all duration-700 ${isCompleted ? 'text-[var(--color-accent)] drop-shadow-[0_0_8px_var(--color-accent)]' : (isCurrent ? 'text-[var(--color-highlight)] drop-shadow-[0_0_12px_var(--color-highlight)]' : 'text-black/5 dark:text-white/10')}`} fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 2 L25 10 L35 10 L30 20 L35 30 L25 30 L20 38 L15 30 L5 30 L10 20 L5 10 L15 10 Z" fill="currentColor" fillOpacity={isCompleted ? "0.3" : (isCurrent ? "0.2" : "0.05")} />
            <circle cx="20" cy="20" r="14" strokeWidth="1" strokeDasharray={isCurrent ? "" : "3 3"} />
        </svg>
        <div className={`relative flex flex-col items-center justify-center pt-1 transition-colors duration-500 ${isCompleted ? 'text-[var(--color-accent)]' : (isCurrent ? 'text-[var(--color-text-primary)]' : 'text-black/20 dark:text-white/20')}`}>
            {isCurrent && <Star size={8} className="text-[var(--color-highlight)] fill-[var(--color-highlight)] absolute -top-1" />}
            <span className={`font-ui font-black text-sm`}>
                {number}
            </span>
        </div>
        {isCurrent && (
            <div className="absolute inset-0 rounded-full border-2 border-[var(--color-highlight)]/30 animate-ping"></div>
        )}
    </div>
);

const KhitmaJourney = ({ currentJuz, progressPercentage }) => {
    const juzList = Array.from({ length: 30 }, (_, i) => i + 1);
    const mapRef = useRef(null);

    useEffect(() => {
        if (mapRef.current) {
            const currentEl = mapRef.current.querySelector(`.juz-marker-${currentJuz}`);
            if (currentEl) {
                const container = mapRef.current;
                const scrollPos = currentEl.offsetTop - container.offsetHeight / 2 + currentEl.offsetHeight / 2;
                container.scrollTo({ top: scrollPos, behavior: 'smooth' });
            }
        }
    }, [currentJuz]);

    return (
        <div ref={mapRef} className="relative py-20 px-6 overflow-y-auto max-h-[600px] no-scrollbar snap-y bg-black/5 dark:bg-white/5 backdrop-blur-sm border-t border-black/5 dark:border-white/5">
            {/* Spiritual Path Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-black/5 dark:via-white/10 to-transparent -translate-x-1/2"></div>

            <div className="space-y-16 relative">
                {juzList.map((juzNum) => {
                    const isCompleted = progressPercentage >= (juzNum / 30) * 100;
                    const isCurrent = currentJuz === juzNum;

                    return (
                        <div key={juzNum} className={`juz-marker-${juzNum} flex items-center gap-10 snap-center ${juzNum % 2 !== 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                            <div className={`w-1/2 ${juzNum % 2 !== 0 ? 'text-left' : 'text-right'} transition-all duration-1000 ${isCompleted || isCurrent ? 'opacity-100 translate-x-0' : 'opacity-20 ' + (juzNum % 2 !== 0 ? '-translate-x-4' : 'translate-x-4')}`}>
                                <div className={`inline-block px-4 py-2 rounded-2xl ${isCurrent ? 'bg-[var(--color-highlight)]/10 border border-[var(--color-highlight)]/30' : ''}`}>
                                    <p className={`font-arabic font-black text-lg ${isCurrent ? 'text-[var(--color-highlight)]' : 'text-[var(--color-text-primary)]'}`}>الجزء {juzNum}</p>
                                    <p className="font-arabic text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-[0.2em] font-bold">
                                        {isCompleted ? 'تم بحمد الله' : (isCurrent ? 'أنت هنا الآن' : 'في انتظار التلاوة')}
                                    </p>
                                </div>
                            </div>

                            <div className="relative group/marker">
                                <div className={`absolute -inset-4 bg-[var(--color-accent)]/10 rounded-full blur-xl scale-0 group-hover/marker:scale-100 transition-transform duration-500`}></div>
                                <div className="z-10 relative bg-[var(--color-bg-primary)] p-1.5 rounded-3xl border border-black/5 dark:border-white/10 shadow-lg">
                                    <TraditionalMarker number={juzNum} isCompleted={isCompleted} isCurrent={isCurrent} />
                                </div>
                            </div>

                            <div className="w-1/2"></div>
                        </div>
                    );
                })}
            </div>

            {/* Finish Line Indicator */}
            <div className="mt-16 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)] animate-bounce border border-[var(--color-accent)]/20">
                    <Star size={20} />
                </div>
            </div>
        </div>
    );
};

export default KhitmaJourney;
