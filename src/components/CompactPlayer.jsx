import React from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2 } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export const CompactPlayer = ({ surah, reciterName }) => {
    const {
        isPlaying, togglePlay, progress,
        currentTime, duration,
        skip, seek, volume, setVolume
    } = useAudio();

    const handleSeek = (e) => {
        const value = parseFloat(e.target.value);
        const time = (value / 100) * duration;
        seek(time);
    };

    const formatTime = (time) => {
        if (isNaN(time) || !time) return "00:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-[var(--color-bg-secondary)]/95 backdrop-blur-md border border-[var(--color-border)] rounded-2xl shadow-xl p-4 flex flex-col gap-3 group transition-all duration-300 hover:shadow-2xl">
            {/* Progress Bar */}
            <div className="relative w-full h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden cursor-pointer group/progress" dir="ltr">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                    className="h-full bg-[var(--color-accent)] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex items-center justify-between gap-4">
                {/* Info (Hidden on small mobile) */}
                <div className="hidden sm:flex flex-col min-w-[120px]">
                    <span className="text-xs font-bold text-[var(--color-text-primary)] truncate">{surah.name}</span>
                    <span className="text-[10px] text-[var(--color-text-tertiary)] truncate">{reciterName}</span>
                </div>

                {/* Main Controls */}
                <div className="flex items-center gap-6" dir="rtl">
                    <button onClick={() => skip(10)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors flex flex-col items-center">
                        <RotateCw size={20} />
                        <span className="text-[8px] mt-0.5">10ث</span>
                    </button>

                    <button
                        onClick={togglePlay}
                        className="w-12 h-12 flex items-center justify-center bg-[var(--color-accent)] text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
                    >
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="mr-1" />}
                    </button>

                    <button onClick={() => skip(-10)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors flex flex-col items-center">
                        <RotateCcw size={20} />
                        <span className="text-[8px] mt-0.5">10ث</span>
                    </button>
                </div>

                {/* Time & Volume */}
                <div className="flex items-center gap-4 min-w-[120px] justify-end">
                    <span className="text-xs font-mono text-[var(--color-text-secondary)]">
                        {formatTime(currentTime)}
                    </span>

                    <div className="hidden md:flex items-center gap-2 group/volume">
                        <Volume2 size={16} className="text-[var(--color-text-tertiary)]" />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-16 h-1 bg-[var(--color-border)] rounded-full appearance-none accent-[var(--color-accent)]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
