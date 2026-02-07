import React from 'react';
import { Play, Pause, Volume2, Music, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export const SurahAudioPlayer = ({
    surah,
    reciterName,
    isAudioLoading = false,
}) => {
    const {
        isPlaying, togglePlay, progress,
        volume, setVolume, currentTime, duration,
        isBuffering, bufferedProgress, isWaitingForInitialBuffer,
        skip, seek
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
        <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">

            {/* MAIN VISUAL CENTER (Circular Visualization) - Stabilized */}
            <div className="relative z-10 w-full flex flex-col items-center mb-16">
                <div className={`relative w-full transition-opacity duration-1000 ${isAudioLoading ? 'opacity-50' : 'opacity-100'}`}>

                    <div className="relative flex items-center justify-center">
                        {/* THE CIRCULAR WAVE (Visualizer) - Removed scaling & ping waves */}
                        <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">

                            {/* Static Rings */}
                            <div className={`absolute inset-0 rounded-full border border-[var(--color-highlight)]/10`}></div>
                            <div className={`absolute inset-8 rounded-full border border-[var(--color-highlight)]/5`}></div>

                            {/* Rotating Orbit Ring - Very Slow & Constant */}
                            <div className={`absolute inset-4 rounded-full border-t-2 border-r-2 border-[var(--color-highlight)]/20 transition-all duration-1000 ${isPlaying ? 'animate-spin-slow-static opacity-100' : 'opacity-20'}`}></div>

                            {/* Inner Core - Stabilized (No scaling) */}
                            <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-full flex flex-col items-center justify-center group">
                                <div className="absolute inset-0 bg-pattern-ornament opacity-[0.05] rounded-full"></div>

                                <div className="relative z-10 text-center px-4">
                                    <Music className={`w-12 h-12 text-[var(--color-highlight)] mx-auto mb-6 transition-all duration-1000 ${isPlaying ? 'opacity-100 drop-shadow-[0_0_15px_rgba(201,169,97,0.3)]' : 'opacity-40'}`} />
                                    <h3 className="text-4xl font-arabic font-bold text-[var(--color-text-primary)] mb-1 leading-relaxed tracking-wider">{surah.name}</h3>
                                    <p className="text-sm text-[var(--color-text-tertiary)] font-medium mb-4 opacity-80">{reciterName}</p>

                                    {isWaitingForInitialBuffer ? (
                                        <div className="flex flex-col items-center animate-pulse">
                                            <span className="text-[10px] text-[var(--color-highlight)] uppercase tracking-[0.2em] font-bold mb-1">Optimizing Stream</span>
                                            <span className="text-xl font-bold text-[var(--color-highlight)]">{Math.round(bufferedProgress)}%</span>
                                        </div>
                                    ) : (
                                        <div className="h-0.5 w-16 bg-[var(--color-highlight)]/40 mx-auto rounded-full"></div>
                                    )}
                                </div>

                                {(isBuffering || isWaitingForInitialBuffer) && (
                                    <div className="absolute inset-0 flex items-center justify-center z-20">
                                        <div className="flex gap-2">
                                            <div className="w-1.5 h-7 bg-[var(--color-highlight)] rounded-full animate-loader-bar-1"></div>
                                            <div className="w-1.5 h-7 bg-[var(--color-highlight)] rounded-full animate-loader-bar-2"></div>
                                            <div className="w-1.5 h-7 bg-[var(--color-highlight)] rounded-full animate-loader-bar-3"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTROL HUB (Floating, no card background) */}
            <div className={`w-full max-w-3xl z-50 transition-all duration-1000 ${isAudioLoading ? 'translate-y-10 opacity-0 scale-95' : 'translate-y-0 opacity-100 scale-100'}`}>
                <div className="relative flex flex-col p-6 md:p-8 space-y-8">
                    {/* Header Info */}
                    <div className="flex flex-col items-center text-center space-y-1">
                        <span className="text-[10px] font-black text-[var(--color-text-tertiary)] tracking-[0.4em] uppercase opacity-60">Recitation</span>
                        <p className="text-sm font-bold text-[var(--color-highlight)] font-arabic tracking-widest">
                            {formatTime(currentTime)} <span className="mx-2 opacity-30">/</span> {formatTime(duration)}
                        </p>
                    </div>

                    {/* Progress Bar - Larger */}
                    <div className="relative group/seeker px-4" dir="ltr">
                        <input
                            type="range" min="0" max="100" value={progress} onChange={handleSeek}
                            className="w-full h-1.5 bg-[var(--color-border)] rounded-full appearance-none cursor-pointer accent-[var(--color-highlight)] hover:h-2 transition-all"
                        />
                    </div>

                    {/* Control Buttons - Enlarged */}
                    <div className="flex items-center justify-center gap-10 md:gap-16" dir="rtl">
                        <button
                            onClick={() => skip(15)}
                            className="p-3 text-[var(--color-text-tertiary)] hover:text-[var(--color-highlight)] transition-all transform hover:scale-125"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>

                        <button
                            onClick={togglePlay}
                            className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center text-white rounded-full transition-all transform hover:scale-110 active:scale-95 shadow-[0_20px_60px_rgba(201,169,97,0.3)] bg-gradient-to-br from-[var(--color-highlight)] to-[#92400e]"
                        >
                            {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current translate-x-1" />}
                        </button>

                        <button
                            onClick={() => skip(-15)}
                            className="p-3 text-[var(--color-text-tertiary)] hover:text-[var(--color-highlight)] transition-all transform hover:scale-125"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                    </div>

                    {/* Volume - Floating */}
                    <div className="flex items-center justify-center gap-4 group/vol max-w-xs mx-auto w-full opacity-60 hover:opacity-100 transition-opacity" dir="ltr">
                        <Volume2 className="text-[var(--color-text-tertiary)] w-4 h-4" />
                        <input
                            type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-full h-1 bg-[var(--color-border)] rounded-full appearance-none cursor-pointer accent-[var(--color-text-tertiary)]"
                        />
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes spin-slow-static { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes loader-bar {
                    0%, 100% { height: 10px; opacity: 0.3; }
                    50% { height: 24px; opacity: 1; }
                }
                .animate-spin-slow-static { animation: spin-slow-static 20s linear infinite; }
                .animate-loader-bar-1 { animation: loader-bar 1s ease-in-out infinite; }
                .animate-loader-bar-2 { animation: loader-bar 1s ease-in-out infinite 0.2s; }
                .animate-loader-bar-3 { animation: loader-bar 1s ease-in-out infinite 0.4s; }
                .bg-pattern-ornament {
                    background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0 L100 50 L50 100 L0 50 Z' fill='none' stroke='currentColor' stroke-width='0.5'/%3E%3C/svg%3E");
                    background-size: 80px 80px;
                }
                input[type='range']::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                    border: 2px solid [var(--color-highlight)];
                }
            `}} />
        </div>
    );
};
