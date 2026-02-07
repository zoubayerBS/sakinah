import React from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = ({ theme, onToggle, className = "" }) => {
    return (
        <button
            onClick={onToggle}
            className={`w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all group overflow-hidden ${className}`}
            aria-label="Toggle theme"
        >
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Sun Icon (Visible in Light Mode) */}
                <Sun
                    className={`absolute transition-all duration-700 ${theme === 'light' ? 'rotate-0 opacity-100 scale-100' : 'rotate-90 opacity-0 scale-50'} text-[#FA8112]`}
                    size={20}
                />

                {/* Moon Icon (Visible in Dark Mode) */}
                <Moon
                    className={`absolute transition-all duration-700 ${theme === 'dark' ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'} text-[#FA8112]`}
                    size={20}
                />

                {/* Inner Glow */}
                <div className="absolute inset-0 bg-radial-gradient from-[#FA8112]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            </div>
        </button>
    );
};
