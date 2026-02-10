import React from 'react';
import { Play, Pause, X } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export const MiniPlayer = ({ onOpen }) => {
    const {
        activeSurah, isPlaying, togglePlay, progress,
        setActiveSurah, isWaitingForInitialBuffer, bufferedProgress,
        currentReciter
    } = useAudio();

    if (!activeSurah) return null;

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[92%] max-w-lg z-[400] animate-slide-up">
            <div className="bg-[var(--color-bg-secondary)]/90 backdrop-blur-md border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden relative group">
                {/* Progress Bar background */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5">
                    <div
                        className="h-full bg-[var(--color-highlight)] transition-all duration-300 shadow-[0_0_10px_var(--color-highlight)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="flex items-center p-3 gap-4">
                    {/* Info Section - Click to open full view */}
                    <div
                        className="flex-1 flex items-center min-w-0 cursor-pointer"
                        onClick={onOpen}
                    >
                        <div className="w-10 h-10 rounded-full bg-[var(--color-highlight)]/10 flex items-center justify-center shrink-0">
                            <div className={`w-2 h-2 rounded-full bg-[var(--color-highlight)] ${isPlaying ? 'animate-pulse' : ''}`} />
                        </div>
                        <div className="ml-3 truncate">
                            <h4 className="text-sm font-arabic font-bold text-[var(--color-text-primary)] truncate">
                                {activeSurah.name} - {currentReciter.name || currentReciter.englishName}
                            </h4>
                            <p className="text-[9px] text-[var(--color-text-tertiary)] uppercase tracking-widest font-bold">
                                {isWaitingForInitialBuffer
                                    ? `Optimisation du flux (${Math.round(bufferedProgress)}%)`
                                    : 'En cours de lecture'}
                            </p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={togglePlay}
                            className="w-10 h-10 flex items-center justify-center bg-[var(--color-highlight)] text-white rounded-full shadow-lg hover:scale-105 transition-transform"
                        >
                            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                        </button>

                        <button
                            onClick={() => setActiveSurah(null)}
                            className="p-2 text-[var(--color-text-tertiary)] hover:text-red-500 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
