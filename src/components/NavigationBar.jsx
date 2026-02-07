import React from 'react';
import { Home, Star, Settings, Clock } from 'lucide-react';

export const NavigationBar = ({ currentPage, onNavigate }) => {
    const navItems = [
        { id: 'home', label: 'Home', icon: Home, ariaLabel: 'الرئيسية' },
        { id: 'prayer', label: 'Prayer', icon: Clock, ariaLabel: 'مواقيت الصلاة' },
        { id: 'bookmarks', label: 'Bookmarks', icon: Star, ariaLabel: 'المفضلة' },
        { id: 'settings', label: 'Settings', icon: Settings, ariaLabel: 'إعدادات' }
    ];

    return (
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[var(--z-fixed)] w-[calc(100%-2rem)] max-w-md bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-2 shadow-[var(--shadow-lg)]" role="navigation" aria-label="Main navigation">
            <div className="flex justify-around items-center gap-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`
                                relative flex flex-col items-center gap-1 px-3 py-2 rounded-[var(--radius-sm)] transition-all flex-1 min-w-[60px]
                                ${isActive ? 'text-[var(--color-accent)] bg-[var(--color-bg-tertiary)]' : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-accent)]'}
                            `}
                            aria-label={item.ariaLabel}
                        >
                            <Icon size={22} />
                            <span className="text-[10px] font-medium uppercase tracking-wider hidden sm:block">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
