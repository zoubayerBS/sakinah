import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getAudioUrls } from '../utils/audio-utils';

const AudioContext = createContext();

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
    const [activeSurah, setActiveSurah] = useState(null);
    const [audioData, setAudioData] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isBuffering, setIsBuffering] = useState(false);
    const [bufferedProgress, setBufferedProgress] = useState(0);
    const [isWaitingForInitialBuffer, setIsWaitingForInitialBuffer] = useState(false);

    // Sleep Timer State
    const [sleepTimer, setSleepTimer] = useState(null); // null or minutes
    const [sleepTimerId, setSleepTimerId] = useState(null);

    const player = useRef(null);
    if (!player.current) {
        player.current = new Audio();
    }
    const isComponentMounted = useRef(true);

    useEffect(() => {
        const audio = player.current;

        const updateProgress = () => {
            if (audio.duration) {
                setCurrentTime(audio.currentTime);
                setDuration(audio.duration);
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const updateBuffer = () => {
            if (audio.buffered.length > 0 && audio.duration) {
                const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
                const percent = (bufferedEnd / audio.duration) * 100;
                setBufferedProgress(percent);

                // If we're waiting for initial 25% buffer
                if (isWaitingForInitialBuffer && percent >= 25) {
                    setIsWaitingForInitialBuffer(false);
                    audio.play().then(() => setIsPlaying(true)).catch(console.error);
                }
            }
        };

        const handleBuffering = () => setIsBuffering(true);
        const handleReady = () => setIsBuffering(false);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('progress', updateBuffer);
        audio.addEventListener('waiting', handleBuffering);
        audio.addEventListener('playing', handleReady);
        audio.addEventListener('canplay', handleReady);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('progress', updateBuffer);
            audio.removeEventListener('waiting', handleBuffering);
            audio.removeEventListener('playing', handleReady);
            audio.removeEventListener('canplay', handleReady);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [isWaitingForInitialBuffer]);

    useEffect(() => {
        player.current.volume = volume;
    }, [volume]);

    // Sleep Timer Logic
    useEffect(() => {
        if (sleepTimer) {
            console.log(`[AudioContext] Sleep timer set for ${sleepTimer} minutes`);
            const id = setTimeout(() => {
                console.log("[AudioContext] Sleep timer expired. Stopping audio.");
                if (isPlaying) {
                    player.current.pause();
                    setIsPlaying(false);
                }
                setSleepTimer(null); // Reset timer
            }, sleepTimer * 60 * 1000);

            setSleepTimerId(id);

            return () => clearTimeout(id);
        } else {
            if (sleepTimerId) {
                clearTimeout(sleepTimerId);
                setSleepTimerId(null);
            }
        }
    }, [sleepTimer]);

    const playSurah = (surah, data, reciterId = 'ar.alafasy') => {
        const surahNum = surah.number;
        const paddedNum = surahNum.toString().padStart(3, '0');

        // Potential sources - Order by reliability and availability
        // Generate sources using our utility
        const sources = [
            ...getAudioUrls(reciterId, surahNum),
            // Final fallback from the data object itself (often single ayah or different format) -- use with caution or as last resort
            data?.ayahs?.[0]?.audio
        ].filter(Boolean); // Remove null/undefined

        if (sources.length === 0) {
            console.error("No audio sources available for reciter", reciterId);
            return;
        }

        let currentSourceIndex = 0;

        const tryLoad = (index) => {
            if (index >= sources.length) {
                console.error("All audio sources failed for surah", surahNum);
                setIsWaitingForInitialBuffer(false);
                setIsBuffering(false);
                return;
            }

            const audio = player.current;
            const url = sources[index];

            console.log(`[AudioContext] Trying source ${index + 1}: ${url}`);

            const handleError = (e) => {
                console.warn(`[AudioContext] Source ${index + 1} failed (${url}), trying next...`);
                // cleanup listener to avoid leaks or double calls
                audio.removeEventListener('error', handleError);
                tryLoad(index + 1);
            };

            // Ensure we clean up any previous error listeners if they persist (though 'once: true' handles most)
            // But if we are looping, we want to be clean.
            // basic 'once' is fine for the recursion structure.

            audio.addEventListener('error', handleError, { once: true });
            audio.src = url;
            audio.load();
        };

        // Check if same surah AND same reciter - if so, don't reload
        if (activeSurah?.number === surahNum && activeSurah?.reciter === reciterId) {
            return;
        }

        // Trigger smart buffering for new audio
        setBufferedProgress(0);
        setIsWaitingForInitialBuffer(true);
        setActiveSurah({ ...surah, reciter: reciterId });
        setAudioData(data);

        tryLoad(0);
    };

    const togglePlay = () => {
        const audio = player.current;
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            // If we're still waiting for buffer, just toggle intent? 
            // Better to let the buffer logic handle the play call.
            if (!isWaitingForInitialBuffer) {
                audio.play().then(() => setIsPlaying(true)).catch(console.error);
            }
        }
    };

    const seek = (time) => {
        player.current.currentTime = time;
    };

    const skip = (seconds) => {
        player.current.currentTime = Math.max(0, Math.min(player.current.duration, player.current.currentTime + seconds));
    };

    const value = {
        activeSurah,
        audioData,
        isPlaying,
        currentTime,
        duration,
        progress,
        volume,
        setVolume,
        isBuffering,
        bufferedProgress,
        isWaitingForInitialBuffer,
        playSurah,
        togglePlay,
        seek,
        skip,
        setActiveSurah,
        sleepTimer,
        setSleepTimer
    };

    return (
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    );
};
