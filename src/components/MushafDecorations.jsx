import React from 'react';

export const FrameCorner = ({ className }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 98V20C2 10 10 2 20 2H98" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
        <path d="M12 98V26C12 18 18 12 26 12H98" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
        <path d="M25 25L45 45M45 25L25 45" stroke="currentColor" strokeWidth="1" className="opacity-50" />
        <circle cx="35" cy="35" r="3" fill="currentColor" className="opacity-80" />
    </svg>
);

export const SurahHeaderFrame = ({ children }) => (
    <div className="relative my-10 py-6">
        {/* Ornate Background Pattern */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <svg width="100%" height="100%" preserveAspectRatio="none">
                <pattern id="pattern-ornament" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M20 0L40 20L20 40L0 20L20 0Z" fill="currentColor" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#pattern-ornament)" />
            </svg>
        </div>

        {/* Top/Bottom Decorative Lines */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[url('/ornament-h.svg')] bg-repeat-x opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-[url('/ornament-h.svg')] bg-repeat-x opacity-40"></div>

        {/* Central Cartouche */}
        <div className="relative z-10 w-full max-w-md mx-auto">
            <div className="bg-[var(--color-bg-secondary)] border-y-2 border-[var(--color-accent)] px-8 py-3 relative">
                <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-full w-8 h-8 rotate-45 border-2 border-[var(--color-accent)] bg-[var(--color-bg-secondary)]"></div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-full w-8 h-8 rotate-45 border-2 border-[var(--color-accent)] bg-[var(--color-bg-secondary)]"></div>

                {children}
            </div>
        </div>
    </div>
);

export const JuzMarker = ({ number, className }) => (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
        <div className="relative w-12 h-12 flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full text-[var(--color-accent)] opacity-80" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 2 L25 10 L35 10 L30 20 L35 30 L25 30 L20 38 L15 30 L5 30 L10 20 L5 10 L15 10 Z" fill="currentColor" fillOpacity="0.1" />
                <circle cx="20" cy="20" r="14" strokeWidth="1" />
            </svg>
            <span className="relative font-arabic font-bold text-xs text-[var(--color-text-primary)] pt-1">
                جزء {number}
            </span>
        </div>
    </div>
);
