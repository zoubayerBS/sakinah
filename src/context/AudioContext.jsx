import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
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

    // Verse Tracking
    const [currentAyahNumber, setCurrentAyahNumber] = useState(null); // The ayah numberInSurah being played

    // Sleep Timer State
    const [sleepTimer, setSleepTimer] = useState(null); // null or minutes
    const [sleepTimerId, setSleepTimerId] = useState(null);

    // Reciter State
    const [currentReciter, setCurrentReciter] = useState({
        identifier: 'ar.alafasy',
        name: 'مشاري راشد العفاسي',
        englishName: 'Mishary Rashid Alafasy'
    });

    const player = useRef(null);
    if (!player.current) {
        player.current = new Audio();
    }
    const isComponentMounted = useRef(true);

    // Ref to track audio URL fallback index
    const audioUrlsRef = useRef([]);
    const currentUrlIndexRef = useRef(0);

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
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentAyahNumber(null);
        };

        // Handle audio load errors - try fallback URLs
        const handleError = () => {
            const urls = audioUrlsRef.current;
            const nextIndex = currentUrlIndexRef.current + 1;
            if (nextIndex < urls.length) {
                console.log(`[AudioContext] Audio source failed, trying fallback URL ${nextIndex + 1}/${urls.length}`);
                currentUrlIndexRef.current = nextIndex;
                audio.src = urls[nextIndex];
                audio.load();
                audio.play().then(() => setIsPlaying(true)).catch(console.error);
            } else {
                console.error("[AudioContext] All audio URLs failed.");
                setIsPlaying(false);
                setIsBuffering(false);
            }
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('progress', updateBuffer);
        audio.addEventListener('waiting', handleBuffering);
        audio.addEventListener('playing', handleReady);
        audio.addEventListener('canplay', handleReady);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('progress', updateBuffer);
            audio.removeEventListener('waiting', handleBuffering);
            audio.removeEventListener('playing', handleReady);
            audio.removeEventListener('canplay', handleReady);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
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


    /**
     * Play a specific ayah - kept for verse-tap functionality
     * This still uses per-ayah audio from the API data
     */
    const playAyah = useCallback((ayahNumber) => {
        if (!audioData) return;

        const ayah = audioData.ayahs.find(a => a.numberInSurah === ayahNumber);
        if (!ayah || !ayah.audio) {
            console.warn(`[AudioContext] No audio found for ayah ${ayahNumber}`);
            return;
        }

        console.log(`[AudioContext] Playing single ayah ${ayahNumber}: ${ayah.audio}`);
        setCurrentAyahNumber(ayahNumber);

        const audio = player.current;
        audio.src = ayah.audio;
        audio.load();
        audio.play()
            .then(() => setIsPlaying(true))
            .catch(err => {
                console.error("[AudioContext] Playback failed for ayah:", err);
                setIsPlaying(false);
            });
    }, [audioData]);

    /**
     * Play the full surah as a single continuous audio stream.
     * Uses getAudioUrls() to get full surah audio URLs (mp3quran.net, etc.)
     * with automatic fallback to alternative CDNs.
     */
    const playFullSurah = useCallback((surah, data, reciterObj) => {
        const reciterId = typeof reciterObj === 'string' ? reciterObj : reciterObj.identifier;
        if (typeof reciterObj === 'object' && reciterObj.identifier) {
            setCurrentReciter(reciterObj);
        }

        setActiveSurah({ ...surah, reciter: reciterId });
        setAudioData(data);
        setCurrentAyahNumber(null);

        // Get full surah audio URLs (with fallbacks)
        const urls = getAudioUrls(reciterId, surah.number);
        audioUrlsRef.current = urls;
        currentUrlIndexRef.current = 0;

        if (urls.length > 0) {
            console.log(`[AudioContext] Playing full surah ${surah.number} (${surah.name}) with reciter ${reciterId}`);
            console.log(`[AudioContext] Audio URL: ${urls[0]}`);

            const audio = player.current;
            audio.src = urls[0];
            audio.load();
            audio.play()
                .then(() => setIsPlaying(true))
                .catch(err => {
                    console.error("[AudioContext] Playback failed:", err);
                    // Try next URL on play failure
                    if (urls.length > 1) {
                        currentUrlIndexRef.current = 1;
                        audio.src = urls[1];
                        audio.load();
                        audio.play().then(() => setIsPlaying(true)).catch(console.error);
                    }
                });
        } else {
            console.error("[AudioContext] No audio URLs available for this surah/reciter combination.");
        }
    }, []);

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

    const value = React.useMemo(() => ({
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
        currentAyahNumber,
        playSurah: playFullSurah,
        playAyah,
        togglePlay,
        seek,
        skip,
        setActiveSurah,
        currentReciter,
        setCurrentReciter,
        sleepTimer,
        setSleepTimer
    }), [
        activeSurah, audioData, isPlaying, currentTime, duration, progress,
        volume, isBuffering, bufferedProgress, isWaitingForInitialBuffer,
        currentAyahNumber, playFullSurah, playAyah, togglePlay, seek, skip,
        currentReciter, sleepTimer
    ]);

    return (
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    );
};
