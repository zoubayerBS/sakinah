import React from 'react';
import { Brain, X } from 'lucide-react';

const LEVELS = [
    { id: 1, label: 'سهل', sub: '25%', color: '#22c55e' },
    { id: 2, label: 'متوسط', sub: '50%', color: '#f59e0b' },
    { id: 3, label: 'صعب', sub: '100%', color: '#ef4444' },
];

const HifzModeControls = ({ isActive, level, setLevel, onClose, mode }) => {
    if (!isActive) return null;

    return (
        <div
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[700] animate-fade-in"
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="flex items-center gap-2 px-3 py-2 rounded-full shadow-2xl border border-[var(--color-border)] backdrop-blur-xl"
                style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    boxShadow: 'var(--shadow-lg)',
                }}
            >
                {/* Brain icon */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
                >
                    <Brain size={16} />
                </div>

                {/* Difficulty buttons */}
                {LEVELS.map((l) => (
                    <button
                        key={l.id}
                        onClick={() => setLevel(l.id)}
                        className="flex flex-col items-center px-3 py-1.5 rounded-full transition-all duration-300 active:scale-95"
                        style={{
                            backgroundColor: level === l.id ? `${l.color}20` : 'transparent',
                            border: level === l.id ? `2px solid ${l.color}` : '2px solid transparent',
                        }}
                    >
                        <span className="font-arabic text-xs font-bold" style={{ color: level === l.id ? l.color : mode.text }}>
                            {l.label}
                        </span>
                        <span className="text-[9px] opacity-50" style={{ color: mode.text }}>
                            {l.sub}
                        </span>
                    </button>
                ))}

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 transition-all active:scale-90"
                    style={{ color: mode.text }}
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default HifzModeControls;
