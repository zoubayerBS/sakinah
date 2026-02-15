import React, { useState, useEffect, useCallback } from 'react';
import { PlayerHeader } from '../components/PlayerHeader.jsx';
import { SurahAudioPlayer } from '../components/SurahAudioPlayer.jsx';
import { ReciterSelector } from '../components/ReciterSelector.jsx';
import SurahPlaylist from '../components/SurahPlaylist.jsx';
import { useAudio } from '../context/AudioContext.jsx';
import { quranAPI } from '../services/quran-api.js';
import { saveLastRead, isBookmarked, toggleBookmark } from '../utils/storage-utils.js';

export function PlayerPage({ surah, onBack }) {
    // 1. Context & State
    const {
        currentReciter, setCurrentReciter,
        currentAyahNumber, playAyah, isPlaying,
        surahs, activeSurah, playFullSurah
    } = useAudio();

    const [currentSurah, setCurrentSurah] = useState(surah || activeSurah);

    const [error, setError] = useState(null);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

    // Track reciter changes to force reload
    const [reciterChangeTrigger, setReciterChangeTrigger] = useState(0);

    // Bookmark state
    const [bookmarked, setBookmarked] = useState(false);

    // 2. Event Handlers
    const handleReciterSelect = useCallback((reciter) => {
        console.log('handleReciterSelect called with:', reciter);
        setIsSelectorOpen(false);
        setCurrentReciter(reciter);
        // Increment trigger to force useEffect to run
        setReciterChangeTrigger(prev => prev + 1);
    }, [setCurrentReciter]);

    const handleToggleBookmark = useCallback(async () => {
        await toggleBookmark(currentSurah);
        const bookmarkedStatus = await isBookmarked(currentSurah.number);
        setBookmarked(bookmarkedStatus);
    }, [currentSurah]);

    const handleSurahSelect = useCallback(async (selectedSurah) => {
        setIsPlaylistOpen(false);
        setCurrentSurah(selectedSurah);
        setReciterChangeTrigger(prev => prev + 1);
    }, []);

    // 3. Effects
    // Synchronize local currentSurah with context activeSurah
    // This allows Next/Prev/Auto-play to update the UI
    useEffect(() => {
        if (activeSurah && (!currentSurah || activeSurah.number !== currentSurah.number)) {
            setCurrentSurah(activeSurah);
        }
    }, [activeSurah]);
    useEffect(() => {
        if (!currentSurah) return;

        // Skip fetch if this surah is already the active one in the context 
        // with existing audio data (internal playlist navigation handled it)
        const isInternalSwitch = activeSurah && activeSurah.number === currentSurah.number && activeSurah.reciter === currentReciter?.identifier;
        if (isInternalSwitch && !reciterChangeTrigger) {
            setIsAudioLoading(false);
            return;
        }

        let isCancelled = false;
        async function fetchAudio() {
            setIsAudioLoading(true);
            setError(null);
            try {
                let reciter = currentReciter;
                const reciterId = reciter?.identifier;
                if (!reciterId) {
                    let savedReciter = null;
                    try {
                        const raw = localStorage.getItem('quran-reciter');
                        savedReciter = raw ? JSON.parse(raw) : null;
                    } catch {
                        savedReciter = null;
                    }
                    const reciters = await quranAPI.getReciters();
                    if (!isCancelled && reciters && reciters.length > 0) {
                        if (savedReciter?.identifier) {
                            const match = reciters.find(r => String(r.identifier) === String(savedReciter.identifier));
                            if (match) {
                                const selectedMoshafId = savedReciter.selectedMoshafId || match.defaultMoshafId;
                                const selectedMoshaf = Array.isArray(match.moshaf)
                                    ? match.moshaf.find(m => String(m.id) === String(selectedMoshafId))
                                    : null;
                                reciter = {
                                    ...match,
                                    selectedMoshafId: selectedMoshaf?.id || selectedMoshafId || null,
                                    selectedMoshafLabel: savedReciter.selectedMoshafLabel || selectedMoshaf?.rewaya || selectedMoshaf?.name || null,
                                };
                            } else {
                                reciter = reciters[0];
                            }
                        } else {
                            reciter = reciters[0];
                        }
                        setCurrentReciter(reciter);
                        setReciterChangeTrigger(prev => prev + 1);
                        return;
                    }
                    if (!isCancelled) {
                        setError("No reciters available.");
                    }
                    return;
                }

                const data = await quranAPI.getSurahAudioData(
                    currentSurah.number,
                    reciterId,
                    reciter?.selectedMoshafId || reciter?.defaultMoshafId
                );
                if (!isCancelled && data) {
                    playFullSurah(currentSurah, data, reciter);
                } else if (!isCancelled && !data) {
                    setError("Failed to load audio recitation.");
                }
            } catch (err) {
                console.error("Error fetching audio:", err);
                if (!isCancelled) setError("An error occurred while loading the audio.");
            } finally {
                setIsAudioLoading(false);
                if (!isCancelled) {
                    // Reset trigger if it was a force reload
                    if (reciterChangeTrigger > 0) setReciterChangeTrigger(0);
                }
            }
        }

        fetchAudio();
        return () => { isCancelled = true; };
    }, [currentSurah.number, currentReciter, reciterChangeTrigger, playFullSurah, activeSurah]);


    // Save Last Read & Check Bookmark
    useEffect(() => {
        const updateState = async () => {
            // Save as last read
            await saveLastRead({
                surahNumber: currentSurah.number,
                surahName: currentSurah.name,
                verseNumber: 1
            });

            const status = await isBookmarked(currentSurah.number);
            setBookmarked(status);
        };
        updateState();
    }, [currentSurah]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        };
    }, []);

    return (
        <div className="relative h-screen overflow-hidden bg-[var(--color-bg-primary)] flex flex-col">

            <PlayerHeader
                surah={currentSurah}
                onBack={onBack}
                reciterName={currentReciter.name}
                onChangeReciter={() => setIsSelectorOpen(true)}
                isBookmarked={bookmarked}
                onToggleBookmark={handleToggleBookmark}
                onTogglePlaylist={() => setIsPlaylistOpen(true)}
            />

            <div className="flex-1 flex flex-col items-center justify-center overflow-hidden relative z-10">
                {error ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                        <p className="text-red-500 font-medium text-lg">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-[var(--color-accent)] text-white rounded-full hover:opacity-90 transition-opacity"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <SurahAudioPlayer
                        surah={currentSurah}
                        reciterName={currentReciter.name}
                        isAudioLoading={isAudioLoading}
                    />
                )}
            </div>

            <SurahPlaylist
                isOpen={isPlaylistOpen}
                onClose={() => setIsPlaylistOpen(false)}
                surahs={surahs}
                currentSurah={currentSurah}
                onSurahSelect={handleSurahSelect}
            />

            <ReciterSelector
                isOpen={isSelectorOpen}
                onClose={() => setIsSelectorOpen(false)}
                selectedReciter={currentReciter.identifier}
                selectedMoshafId={currentReciter.selectedMoshafId || currentReciter.defaultMoshafId}
                onSelect={handleReciterSelect}
            />
        </div>
    );
}
