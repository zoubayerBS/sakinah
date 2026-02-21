import React from 'react';
import { Home, Settings, Clock, BookOpen, Heart } from 'lucide-react';
import { tapLight } from '../utils/haptics.js';

export const NavigationBar = ({ currentPage, onNavigate }) => {
    const navItems = [
        { id: 'home', icon: Home, label: 'الرئيسية' },
        { id: 'prayer', icon: Clock, label: 'الصلاة' },
        { id: 'mushaf', icon: BookOpen, label: 'المصحف' },
        { id: 'adhkar', icon: Heart, label: 'الأذكار' },
        { id: 'settings', icon: Settings, label: 'إعدادات' }
    ];

    return (
        <nav
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[var(--z-fixed)] w-[calc(100%-1.5rem)] max-w-md bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[2rem] p-1.5 shadow-[0_8px_40px_rgba(0,0,0,0.12)]"
            role="navigation"
            aria-label="Main navigation"
            dir="rtl"
        >
            <div className="flex justify-around items-center">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                tapLight();
                                onNavigate(item.id);
                            }}
                            className={`
                                relative flex flex-col items-center gap-0.5 py-2 px-2 rounded-2xl transition-all duration-300 flex-1 min-w-0
                                ${isActive
                                    ? 'text-[var(--color-accent)]'
                                    : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] active:scale-90'
                                }
                            `}
                            aria-label={item.label}
                        >
                            {/* Active glow dot */}
                            {isActive && (
                                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" />
                            )}

                            <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                            </div>
                            <span className={`text-[9px] font-arabic font-bold leading-none mt-0.5 truncate max-w-full ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
