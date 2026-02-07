import React, { useState, useEffect, useCallback } from 'react';
import { ReadingHeader } from '../components/ReadingHeader.jsx';
import { SurahAudioPlayer } from '../components/SurahAudioPlayer.jsx';
import { ReciterSelector } from '../components/ReciterSelector.jsx';
import { useAudio } from '../context/AudioContext.jsx';
import { quranAPI } from '../services/quran-api.js';
import { saveLastRead, isBookmarked, toggleBookmark } from '../utils/storage-utils.js';

export function ReadingPage({ surah, onBack }) {
    const { playSurah, activeSurah } = useAudio();

    // 1. All State Definitions
    const [isLoading, setIsLoading] = useState(
        !activeSurah || activeSurah.number !== surah.number
    );
    const [error, setError] = useState(null);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [selectedReciter, setSelectedReciter] = useState({
        identifier: activeSurah?.reciter || 'ar.alafasy',
        name: 'مشاري راشد العفاسي'
    });

    // Track reciter changes to force reload
    const [reciterChangeTrigger, setReciterChangeTrigger] = useState(0);

    // Bookmark state
    const [bookmarked, setBookmarked] = useState(false);

    // 2. Event Handlers
    const handleReciterSelect = useCallback((reciter) => {
        console.log('handleReciterSelect called with:', reciter);
        setIsSelectorOpen(false);
        setSelectedReciter(reciter);
        // Increment trigger to force useEffect to run
        setReciterChangeTrigger(prev => prev + 1);
    }, []);

    const handleToggleBookmark = useCallback(() => {
        toggleBookmark(surah);
        setBookmarked(prev => !prev);
    }, [surah]);

    // 3. Effects
    useEffect(() => {
        let isCancelled = false;
        async function fetchAudio() {
            setIsLoading(true);
            setError(null);
            try {
                const data = await quranAPI.getSurahAudioData(surah.number, selectedReciter.identifier);
                if (!isCancelled && data) {
                    playSurah(surah, data, selectedReciter.identifier);
                } else if (!isCancelled && !data) {
                    setError("Failed to load audio recitation.");
                }
            } catch (err) {
                console.error("Error fetching audio:", err);
                if (!isCancelled) setError("An error occurred while loading the audio.");
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        }

        fetchAudio();
        return () => { isCancelled = true; };
    }, [surah.number, selectedReciter.identifier, reciterChangeTrigger, playSurah]);

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

    // 4. Render
    return (
        <div className="relative h-screen overflow-hidden bg-[var(--color-bg-primary)] flex flex-col">
            <ReadingHeader
                surah={surah}
                onBack={onBack}
                reciterName={selectedReciter.name}
                onChangeReciter={() => setIsSelectorOpen(true)}
                isBookmarked={bookmarked}
                onToggleBookmark={handleToggleBookmark}
            />

            <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-hidden">
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
                    <div className="animate-fade-in w-full flex items-center justify-center">
                        <SurahAudioPlayer
                            surah={surah}
                            reciterName={selectedReciter.name}
                            isAudioLoading={isLoading}
                        />
                    </div>
                )}
            </div>

            <ReciterSelector
                isOpen={isSelectorOpen}
                onClose={() => setIsSelectorOpen(false)}
                selectedReciter={selectedReciter.identifier}
                onSelect={handleReciterSelect}
            />
        </div>
    );
}
