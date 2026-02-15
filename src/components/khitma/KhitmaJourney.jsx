import React, { useEffect, useRef } from 'react';

const TraditionalMarker = ({ number, isCompleted, isCurrent }) => (
    <div className={`relative w-14 h-14 flex items-center justify-center transition-all duration-700 ${isCurrent ? 'scale-125' : ''}`}>
        <svg viewBox="0 0 40 40" className={`absolute inset-0 w-full h-full transition-colors duration-700 ${isCompleted ? 'text-[var(--color-accent)]' : (isCurrent ? 'text-[var(--color-highlight)]' : 'text-[var(--color-border)]')}`} fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 2 L25 10 L35 10 L30 20 L35 30 L25 30 L20 38 L15 30 L5 30 L10 20 L5 10 L15 10 Z" fill="currentColor" fillOpacity={isCompleted ? "0.2" : "0.05"} />
            <circle cx="20" cy="20" r="14" strokeWidth="1" strokeDasharray={isCurrent ? "" : "2 2"} />
        </svg>
        <span className={`relative font-arabic font-bold text-[10px] pt-1 transition-colors ${isCompleted ? 'text-[var(--color-accent)]' : (isCurrent ? 'text-[var(--color-text-primary)] font-black' : 'text-[var(--color-text-tertiary)]')}`}>
            {number}
        </span>
        {isCurrent && (
            <div className="absolute -top-1 w-2 h-2 rounded-full bg-[var(--color-highlight)] shadow-[0_0_8px_var(--color-highlight)]"></div>
        )}
    </div>
);

const KhitmaJourney = ({ currentJuz, progressPercentage }) => {
    const juzList = Array.from({ length: 30 }, (_, i) => i + 1);
    const mapRef = useRef(null);

    useEffect(() => {
        if (mapRef.current) {
            const currentEl = mapRef.current.querySelector(`.juz-marker-${currentJuz}`);
            if (currentEl) currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentJuz]);

    return (
        <div ref={mapRef} className="relative py-12 px-4 overflow-y-auto max-h-[500px] no-scrollbar snap-y border-t border-[var(--color-border)]">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--color-border)] -translate-x-1/2 opacity-50"></div>
            <div className="space-y-10 relative">
                {juzList.map((juzNum) => {
                    const isCompleted = progressPercentage >= (juzNum / 30) * 100;
                    const isCurrent = currentJuz === juzNum;

                    return (
                        <div key={juzNum} className={`juz-marker-${juzNum} flex items-center gap-6 snap-center ${juzNum % 2 !== 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                            <div className={`w-1/2 ${juzNum % 2 !== 0 ? 'text-left pl-4' : 'text-right pr-4'} transition-opacity duration-700 ${isCompleted || isCurrent ? 'opacity-100' : 'opacity-30'}`}>
                                <p className="font-arabic font-bold text-xs text-[var(--color-text-primary)]">الجزء {juzNum}</p>
                                <p className="text-[9px] text-[var(--color-text-tertiary)] uppercase tracking-widest">{isCompleted ? 'مكتمل' : (isCurrent ? 'قيد القراءة' : 'قادم')}</p>
                            </div>
                            <div className="z-10 bg-[var(--color-bg-primary)] p-1 rounded-full border border-[var(--color-divider)]">
                                <TraditionalMarker number={juzNum} isCompleted={isCompleted} isCurrent={isCurrent} />
                            </div>
                            <div className="w-1/2"></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default KhitmaJourney;
