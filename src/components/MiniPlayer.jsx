import React from 'react';
import { Play, Pause, X, Clock } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { tapLight } from '../utils/haptics.js';

export const MiniPlayer = ({ onOpen }) => {
    const {
        activeSurah, isPlaying, togglePlay, progress,
        setActiveSurah, isWaitingForInitialBuffer, bufferedProgress,
        currentReciter, sleepTimerRemaining
    } = useAudio();

    if (!activeSurah) return null;

    return (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[94%] max-w-lg z-[400] animate-slide-up">
            <div className="absolute inset-x-4 -bottom-4 h-8 bg-black/10 blur-2xl rounded-full -z-10"></div>
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.2)] overflow-hidden relative group">
                {/* Progress Bar background */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/10 dark:bg-white/10">
                    <div
                        className="h-full bg-[var(--color-highlight)] transition-all duration-300 shadow-[0_0_15px_var(--color-highlight)] liquid-progress"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="flex items-center p-4 gap-5">
                    {/* Info Section - Click to open full view */}
                    <div
                        className="flex-1 flex items-center min-w-0 cursor-pointer"
                        onClick={onOpen}
                    >
                        <div className="relative shrink-0">
                            <div className={`absolute inset-0 bg-[var(--color-highlight)] blur-md rounded-full opacity-0 ${isPlaying ? 'opacity-30' : ''}`} />
                            <div className="w-14 h-14 rounded-2xl bg-[var(--color-highlight)]/10 text-[var(--color-highlight)] flex items-center justify-center relative z-10">
                                <span className="font-surah-name text-4xl">
                                    {`surah${String(activeSurah.number).padStart(3, '0')}`}
                                </span>
                            </div>
                        </div>
                        <div className="ml-4 truncate">
                            <h4 className="text-lg font-arabic font-black text-[var(--color-text-primary)] truncate tracking-tight">
                                {activeSurah.name}
                            </h4>
                            <p className="text-xs text-[var(--color-text-tertiary)] font-bold truncate opacity-80 mt-0.5">
                                {currentReciter.name || currentReciter.englishName}
                            </p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => { tapLight(); togglePlay(); }}
                            className="w-14 h-14 flex items-center justify-center bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all duration-300"
                        >
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                        </button>

                        <button
                            onClick={() => { tapLight(); setActiveSurah(null); }}
                            className="w-10 h-10 flex items-center justify-center text-[var(--color-text-tertiary)] hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
