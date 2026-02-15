import React from 'react';
import {
    Play, Pause, Volume2, Music, ChevronRight, ChevronLeft,
    Clock, SkipBack, SkipForward, Shuffle, Repeat, Bookmark, MoreHorizontal
} from 'lucide-react';
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
        skip, seek, sleepTimerRemaining,
        playNextSurah, playPrevSurah,
        isShuffle, setIsShuffle,
        repeatMode, setRepeatMode
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

    const cycleRepeatMode = () => {
        if (repeatMode === 'all') setRepeatMode('one');
        else if (repeatMode === 'one') setRepeatMode('none');
        else setRepeatMode('all');
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-between py-10 px-6 relative overflow-hidden">

            {/* 1. STANDALONE CALLIGRAPHY - PURE MINIMALISM */}
            <div className={`relative z-20 w-full flex flex-col items-center justify-center mt-12 mb-8 transition-all duration-700 ${isAudioLoading ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                <div className="relative flex items-center justify-center min-h-[300px]">
                    {/* Surah Name Calligraphy (Icon) - Deep Black Ligature */}
                    <span
                        className="font-surah-name select-none leading-none animate-fade-in"
                        style={{
                            fontSize: 'clamp(10rem, 30vw, 18rem)',
                            color: '#111111',
                            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.05))'
                        }}
                    >
                        {`surah${String(surah.number).padStart(3, '0')}`}
                    </span>
                </div>
            </div>

            {/* 2. METADATA & PROGRESS SECTION - SPOTIFY STYLE */}
            <div className={`w-full max-w-lg z-20 flex flex-col space-y-6 transition-all duration-700 ${isAudioLoading ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'}`}>

                {/* Metadata Row: Title (Left) + Bookmark (Right) */}
                <div className="flex items-center justify-between w-full px-1">
                    <div className="flex flex-col text-left overflow-hidden">
                        <h2 className="text-3xl md:text-4xl font-black text-[var(--color-text-primary)] tracking-tighter truncate drop-shadow-sm">
                            {surah.transliteration}
                        </h2>
                        <span className="text-sm font-bold text-[var(--color-text-secondary)] tracking-wider uppercase mt-1 truncate">{reciterName}</span>
                    </div>
                    <button className="p-3 text-[var(--color-text-tertiary)] hover:text-[var(--color-highlight)] transition-colors active:scale-90">
                        <Bookmark className="w-7 h-7" />
                    </button>
                </div>

                {/* Progress & Time */}
                <div className="w-full space-y-2.5" dir="ltr">
                    <div className="relative group/seeker">
                        <input
                            type="range" min="0" max="100" value={progress} onChange={handleSeek}
                            className="w-full h-1.5 bg-[var(--color-border)]/50 rounded-full appearance-none cursor-pointer accent-[var(--color-text-primary)] hover:accent-[var(--color-highlight)] transition-all"
                        />
                        {/* Buffered visualizer */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 bg-[var(--color-highlight)]/10 rounded-full pointer-events-none -z-10"
                            style={{ width: `${bufferedProgress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[12px] font-black text-[var(--color-text-tertiary)] tracking-widest">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Main Controls: Shuffle - Prev - Play - Next - Repeat */}
                <div className="w-full flex items-center justify-between" dir="ltr">
                    <button
                        onClick={() => setIsShuffle(!isShuffle)}
                        className={`p-2 transition-all ${isShuffle ? 'text-[var(--color-highlight)] scale-110' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'}`}
                        title="Shuffle"
                    >
                        <Shuffle className="w-5 h-5" />
                    </button>

                    <button
                        onClick={playPrevSurah}
                        className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all active:scale-90"
                        title="Previous"
                    >
                        <SkipBack className="w-9 h-9 fill-current" />
                    </button>

                    <button
                        onClick={togglePlay}
                        className="w-20 h-20 md:w-22 md:h-22 flex items-center justify-center text-[var(--color-bg-primary)] bg-[var(--color-text-primary)] rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl"
                    >
                        {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current translate-x-1" />}
                    </button>

                    <button
                        onClick={playNextSurah}
                        className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all active:scale-90"
                        title="Next"
                    >
                        <SkipForward className="w-9 h-9 fill-current" />
                    </button>

                    <button
                        onClick={cycleRepeatMode}
                        className={`p-2 transition-all relative ${repeatMode !== 'none' ? 'text-[var(--color-highlight)] scale-110' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'}`}
                        title="Repeat"
                    >
                        <Repeat className="w-5 h-5" />
                        {repeatMode === 'one' && <span className="absolute top-0 right-0 text-[8px] font-bold bg-[var(--color-highlight)] text-[var(--color-bg-primary)] rounded-full w-3 h-3 flex items-center justify-center">1</span>}
                    </button>
                </div>

                {/* Sub-controls: Skip-15 & Volume */}
                <div className="w-full flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity px-2 pt-2" dir="ltr">
                    <div className="flex items-center gap-6">
                        <button onClick={() => skip(-15)} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={() => skip(15)} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 w-32" dir="ltr">
                        <Volume2 className="text-[var(--color-text-tertiary)] w-4 h-4 opacity-40" />
                        <input
                            type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-full h-1 bg-[var(--color-border)]/50 rounded-full appearance-none cursor-pointer accent-[var(--color-text-tertiary)]"
                        />
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes spin-slow-static { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes loader-bar {
                    0%, 100% { height: 10px; opacity: 0.3; }
                    50% { height: 32px; opacity: 1; }
                }
                .animate-spin-slow-static { animation: spin-slow-static 20s linear infinite; }
                .animate-loader-bar { animation: loader-bar 1s ease-in-out infinite; }
                
                input[type='range']::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: var(--color-text-primary);
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .group\\/seeker:hover input[type='range']::-webkit-slider-thumb {
                    opacity: 1;
                }
            `}} />
        </div>
    );
};
