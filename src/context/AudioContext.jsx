import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getAudioUrls } from '../utils/audio-utils';

const AudioContext = createContext();

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
    const [activeSurah, setActiveSurah] = useState(null);
    const [surahs, setSurahs] = useState([]);
    const [audioData, setAudioData] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isBuffering, setIsBuffering] = useState(false);
    const [bufferedProgress, setBufferedProgress] = useState(0);
    const [isWaitingForInitialBuffer, setIsWaitingForInitialBuffer] = useState(false);

    // Playback Modes
    const [isShuffle, setIsShuffle] = useState(false);
    const [repeatMode, setRepeatMode] = useState('all'); // 'none', 'one', 'all'

    // Verse Tracking
    const [currentAyahNumber, setCurrentAyahNumber] = useState(null); // The ayah numberInSurah being played

    // Sleep Timer State
    const [sleepTimer, setSleepTimer] = useState(null); // null or minutes
    const [sleepTimerId, setSleepTimerId] = useState(null);

    // Reciter State
    const getStoredReciter = () => {
        try {
            const raw = localStorage.getItem('quran-reciter');
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed?.identifier) return null;
            return parsed;
        } catch {
            return null;
        }
    };

    const [currentReciter, setCurrentReciter] = useState(() => (
        getStoredReciter() || {
            identifier: '',
            name: '',
            englishName: ''
        }
    ));

    const player = useRef(null);
    if (!player.current) {
        player.current = new Audio();
    }
    const isComponentMounted = useRef(true);

    // Ref to track audio URL fallback index
    const audioUrlsRef = useRef([]);
    const currentUrlIndexRef = useRef(0);

    // Fetch All Surahs for Playlist
    useEffect(() => {
        const fetchSurahs = async () => {
            const { quranAPI } = await import('../services/quran-api.js');
            const data = await quranAPI.getAllSurahs();
            setSurahs(data);
        };
        fetchSurahs();
    }, []);

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

            // Handle Repeat Mode
            if (repeatMode === 'one') {
                audio.currentTime = 0;
                audio.play().then(() => setIsPlaying(true)).catch(console.error);
                return;
            }

            // Auto-advance to next surah (default or 'all')
            if (activeSurah && surahs.length > 0) {
                if (repeatMode === 'all' || (repeatMode === 'none' && activeSurah.number < surahs.length)) {
                    playNextSurah();
                }
            }
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
    const [sleepTimerRemaining, setSleepTimerRemaining] = useState(null); // seconds
    const initialVolumeRef = useRef(volume);

    useEffect(() => {
        if (sleepTimer) {
            setSleepTimerRemaining(sleepTimer * 60);
        } else {
            setSleepTimerRemaining(null);
        }
    }, [sleepTimer]);

    useEffect(() => {
        let intervalId = null;
        if (sleepTimerRemaining !== null && sleepTimerRemaining > 0) {
            intervalId = setInterval(() => {
                setSleepTimerRemaining(prev => {
                    const next = prev - 1;

                    // Fade-out logic in last 10 seconds
                    if (next <= 10 && next > 0) {
                        const fadeRatio = next / 10;
                        player.current.volume = volume * fadeRatio;
                    }

                    if (next <= 0) {
                        clearInterval(intervalId);
                        if (isPlaying) {
                            player.current.pause();
                            setIsPlaying(false);
                        }
                        // Restore volume
                        player.current.volume = volume;
                        setSleepTimer(null);
                        return null;
                    }
                    return next;
                });
            }, 1000);
        } else if (sleepTimerRemaining === null) {
            // Restore volume if timer cancelled
            player.current.volume = volume;
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [sleepTimerRemaining, isPlaying, volume]);


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
        const reciterId = typeof reciterObj === 'string' ? reciterObj : (reciterObj?.identifier || currentReciter.identifier);

        // Update reciter if object provided
        if (typeof reciterObj === 'object' && reciterObj?.identifier) {
            setCurrentReciter(reciterObj);
        }

        setActiveSurah({ ...surah, reciter: reciterId });
        setAudioData(data);
        setCurrentAyahNumber(null);

        // Get full surah audio URLs
        const urls = [];
        const apiUrl = data?.audio_url || data?.audioUrl;
        if (apiUrl) urls.push(apiUrl);

        const shouldAddFallbacks = !apiUrl || !String(apiUrl).includes('mp3quran.net');
        if (shouldAddFallbacks) {
            const fallbackUrls = getAudioUrls(reciterId, surah.number);
            fallbackUrls.forEach((url) => {
                if (url && !urls.includes(url)) urls.push(url);
            });
        }
        audioUrlsRef.current = urls;
        currentUrlIndexRef.current = 0;

        if (urls.length > 0) {
            const audio = player.current;
            audio.src = urls[0];
            audio.load();
            audio.play()
                .then(() => setIsPlaying(true))
                .catch(err => {
                    console.error("[AudioContext] Playback failed:", err);
                    if (urls.length > 1) {
                        currentUrlIndexRef.current = 1;
                        audio.src = urls[1];
                        audio.load();
                        audio.play().then(() => setIsPlaying(true)).catch(console.error);
                    }
                });
        }
    }, [currentReciter]);

    const playNextSurah = useCallback(async () => {
        if (!activeSurah || surahs.length === 0) return;

        let nextIndex;
        if (isShuffle) {
            nextIndex = Math.floor(Math.random() * surahs.length);
            // Ensure we don't pick the same one if multiple are available
            if (nextIndex === surahs.findIndex(s => Number(s.number) === Number(activeSurah.number)) && surahs.length > 1) {
                nextIndex = (nextIndex + 1) % surahs.length;
            }
        } else {
            const currentIndex = surahs.findIndex(s => Number(s.number) === Number(activeSurah.number));
            nextIndex = (currentIndex + 1) % surahs.length;
        }

        const nextSurah = surahs[nextIndex];

        const { quranAPI } = await import('../services/quran-api.js');
        const data = await quranAPI.getSurahAudioData(
            nextSurah.number,
            currentReciter.identifier,
            currentReciter.selectedMoshafId || currentReciter.defaultMoshafId
        );
        if (data) playFullSurah(nextSurah, data, currentReciter);
    }, [activeSurah, surahs, currentReciter, playFullSurah, isShuffle]);

    const playPrevSurah = useCallback(async () => {
        if (!activeSurah || surahs.length === 0) return;
        const currentIndex = surahs.findIndex(s => Number(s.number) === Number(activeSurah.number));
        const prevIndex = (currentIndex - 1 + surahs.length) % surahs.length;
        const prevSurah = surahs[prevIndex];

        const { quranAPI } = await import('../services/quran-api.js');
        const data = await quranAPI.getSurahAudioData(
            prevSurah.number,
            currentReciter.identifier,
            currentReciter.selectedMoshafId || currentReciter.defaultMoshafId
        );
        if (data) playFullSurah(prevSurah, data, currentReciter);
    }, [activeSurah, surahs, currentReciter, playFullSurah]);

    const togglePlay = () => {
        const audio = player.current;
        if (!audio.src) {
            console.warn("[AudioContext] No audio source set. Waiting for audio to load.");
            return;
        }
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
        playFullSurah,
        playAyah,
        togglePlay,
        seek,
        skip,
        setActiveSurah,
        currentReciter,
        setCurrentReciter,
        sleepTimer,
        setSleepTimer,
        sleepTimerRemaining,
        surahs,
        playNextSurah,
        playPrevSurah,
        isShuffle,
        setIsShuffle,
        repeatMode,
        setRepeatMode
    }), [
        activeSurah, audioData, isPlaying, currentTime, duration, progress,
        volume, isBuffering, bufferedProgress, isWaitingForInitialBuffer,
        currentAyahNumber, playFullSurah, playAyah, togglePlay, seek, skip,
        currentReciter, sleepTimer, sleepTimerRemaining, surahs,
        playNextSurah, playPrevSurah,
        isShuffle, repeatMode
    ]);

    useEffect(() => {
        if (currentReciter?.identifier) {
            localStorage.setItem('quran-reciter', JSON.stringify(currentReciter));
        }
    }, [currentReciter]);

    return (
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    );
};
