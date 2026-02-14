import React, { useState, useEffect, useCallback } from 'react';
import { ReadingHeader } from '../components/ReadingHeader.jsx';
import { SurahAudioPlayer } from '../components/SurahAudioPlayer.jsx';
import { ReciterSelector } from '../components/ReciterSelector.jsx';
import { useAudio } from '../context/AudioContext.jsx';
import { quranAPI } from '../services/quran-api.js';
import { saveLastRead, isBookmarked, toggleBookmark } from '../utils/storage-utils.js';

export function ReadingPage({ surah, onBack }) {
    // 1. Context & State
    const {
        currentReciter, setCurrentReciter, playSurah,
        currentAyahNumber, playAyah, isPlaying
    } = useAudio();

    const [error, setError] = useState(null);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

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

    const handleToggleBookmark = useCallback(() => {
        toggleBookmark(surah);
        setBookmarked(prev => !prev);
    }, [surah]);

    // 3. Effects
    useEffect(() => {
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
                    surah.number,
                    reciterId,
                    reciter?.selectedMoshafId || reciter?.defaultMoshafId
                );
                if (!isCancelled && data) {
                    playSurah(surah, data, reciter);
                } else if (!isCancelled && !data) {
                    setError("Failed to load audio recitation.");
                }
            } catch (err) {
                console.error("Error fetching audio:", err);
                if (!isCancelled) setError("An error occurred while loading the audio.");
            } finally {
                if (!isCancelled) setIsAudioLoading(false);
            }
        }

        fetchAudio();
        return () => { isCancelled = true; };
    }, [surah.number, currentReciter, reciterChangeTrigger, playSurah]);


    // Save Last Read & Check Bookmark
    useEffect(() => {
        // Save as last read
        saveLastRead({
            surahNumber: surah.number,
            surahName: surah.name,
            verseNumber: 1 // Default to 1 for now until we track verses
        });

        // Check bookmark status
        setBookmarked(isBookmarked(surah.number));
    }, [surah]);

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
            <ReadingHeader
                surah={surah}
                onBack={onBack}
                reciterName={currentReciter.name}
                onChangeReciter={() => setIsSelectorOpen(true)}
                isBookmarked={bookmarked}
                onToggleBookmark={handleToggleBookmark}
            />

            <div className="flex-1 flex flex-col items-center justify-center overflow-hidden relative">
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
                        surah={surah}
                        reciterName={currentReciter.name}
                        isAudioLoading={isAudioLoading}
                    />
                )}
            </div>

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
