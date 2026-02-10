import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ReadingHeader } from '../components/ReadingHeader.jsx';
import { SurahAudioPlayer } from '../components/SurahAudioPlayer.jsx';
import { CompactPlayer } from '../components/CompactPlayer.jsx';
import { ReciterSelector } from '../components/ReciterSelector.jsx';
import { useAudio } from '../context/AudioContext.jsx';
import { quranAPI } from '../services/quran-api.js';
import { saveLastRead, isBookmarked, toggleBookmark } from '../utils/storage-utils.js';
import { BookOpen, Share2, Volume2 } from 'lucide-react';

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

    // Reading Mode State: 'list' (quran.com style) or 'continuous' (mushaf style)
    const [viewMode, setViewMode] = useState('list');

    // Surah Text & Translation State
    const [surahData, setSurahData] = useState(null);
    const [verseImages, setVerseImages] = useState(null);
    const [isTextLoading, setIsTextLoading] = useState(true);

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
                const reciterIdNum = Number(reciterId);
                if (!reciterId || !Number.isFinite(reciterIdNum) || reciterIdNum <= 0) {
                    const reciters = await quranAPI.getReciters();
                    if (!isCancelled && reciters && reciters.length > 0) {
                        reciter = reciters[0];
                        setCurrentReciter(reciter);
                        setReciterChangeTrigger(prev => prev + 1);
                        return;
                    }
                    if (!isCancelled) {
                        setError("No reciters available.");
                    }
                    return;
                }

                const data = await quranAPI.getSurahAudioData(surah.number, reciterId);
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

    // Fetch Surah Verse Images
    useEffect(() => {
        let isCancelled = false;
        async function fetchVerseImages() {
            setIsTextLoading(true);
            try {
                const images = await quranAPI.getSurahVerseImages(surah.number);
                if (!isCancelled && images) {
                    setVerseImages(images);
                }
            } catch (err) {
                console.error("Error fetching verse images:", err);
            } finally {
                if (!isCancelled) setIsTextLoading(false);
            }
        }
        fetchVerseImages();
        return () => { isCancelled = true; };
    }, [surah.number]);

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
                reciterName={currentReciter.name}
                onChangeReciter={() => setIsSelectorOpen(true)}
                isBookmarked={bookmarked}
                onToggleBookmark={handleToggleBookmark}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
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
                    <div className="animate-fade-in w-full max-w-4xl mx-auto h-full flex flex-col pt-4">
                        {/* Reading Content Section */}
                        <div className="flex-1 overflow-y-auto px-4 pb-32 scrollbar-hide">
                            {isTextLoading ? (
                                <div className="flex items-center justify-center min-h-[40vh]">
                                    <div className="w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <div className="py-10 space-y-12">
                                    {/* Basmala */}
                                    {surah.number !== 1 && surah.number !== 9 && (
                                        <div className="text-center mb-16 text-5xl font-arabic opacity-80 text-[var(--color-highlight)]" dir="rtl">
                                            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                                        </div>
                                    )}

                                    {viewMode === 'list' ? (
                                        /* List View: Each verse in its own card */
                                        <div className="flex flex-col gap-6">
                                            {verseImages?.map((verse, idx) => {
                                                const isActive = currentAyahNumber === verse.numberInSurah;
                                                return (
                                                    <div key={verse.id} className="bg-[var(--color-bg-secondary)]/40 backdrop-blur-sm border border-[var(--color-border)]/50 rounded-2xl p-4 transition-all duration-300 hover:bg-[var(--color-bg-secondary)]/70 hover:shadow-lg hover:border-[var(--color-highlight)]/30">
                                                        {/* Icons - Left Side Horizontal */}
                                                        <div className="flex items-center gap-2 mb-3" dir="ltr">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); toggleBookmark(surah.number, verse.numberInSurah); }}
                                                                className="p-2 rounded-lg bg-[var(--color-bg-tertiary)]/50 hover:bg-[var(--color-accent)]/20 hover:text-[var(--color-accent)] transition-colors"
                                                                title="Bookmark"
                                                            >
                                                                <BookOpen size={18} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`${surah.englishName} - Ayah ${verse.numberInSurah}`); }}
                                                                className="p-2 rounded-lg bg-[var(--color-bg-tertiary)]/50 hover:bg-[var(--color-accent)]/20 hover:text-[var(--color-accent)] transition-colors"
                                                                title="Share"
                                                            >
                                                                <Share2 size={18} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); playAyah(verse.numberInSurah); }}
                                                                className="p-2 rounded-lg bg-[var(--color-bg-tertiary)]/50 hover:bg-[var(--color-accent)]/20 hover:text-[var(--color-accent)] transition-colors"
                                                                title="Play Ayah"
                                                            >
                                                                <Volume2 size={18} />
                                                            </button>
                                                        </div>

                                                        {/* Verse Image */}
                                                        <div className="flex justify-end cursor-pointer" dir="rtl" onClick={() => playAyah(verse.numberInSurah)}>
                                                            <img
                                                                src={verse.image_url}
                                                                alt={`Verse ${verse.numberInSurah}`}
                                                                className="max-w-full h-auto"
                                                                loading="lazy"
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        /* Continuous Mode: Paragraph style (Mushaf Style) */
                                        <div className="font-arabic text-4xl md:text-5xl leading-[4.5rem] md:leading-[6rem] text-justify rtl py-10 text-[var(--color-text-primary)]" dir="rtl">
                                            {surahData?.ayahs.map((ayah, idx) => (
                                                <React.Fragment key={ayah.number}>
                                                    <span
                                                        onClick={() => playAyah(ayah.numberInSurah)}
                                                        className="inline hover:text-[var(--color-accent)] transition-colors duration-300 cursor-pointer"
                                                    >
                                                        {/* Handle Basmala in first ayah */}
                                                        {(surah.number !== 1 && surah.number !== 9 && idx === 0) ? ayah.text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ', '').trim() : ayah.text}
                                                    </span>
                                                    <span className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 mx-4 translate-y-2 select-none relative shrink-0">
                                                        <span className="absolute font-ui text-sm md:text-base font-bold text-[var(--color-highlight)]">
                                                            {ayah.numberInSurah}
                                                        </span>
                                                        <svg viewBox="0 0 100 100" className="w-full h-full text-[var(--color-border)] opacity-40">
                                                            <path d="M50 5 L95 50 L50 95 L5 50 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                                                            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
                                                        </svg>
                                                    </span>
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Audio Player Footer Overlay */}
                        <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-[var(--color-bg-primary)] via-[var(--color-bg-primary)] to-transparent pt-10 z-[400]">
                            <CompactPlayer
                                surah={surah}
                                reciterName={currentReciter.name}
                            />
                        </div>
                    </div>
                )}
            </div>

            <ReciterSelector
                isOpen={isSelectorOpen}
                onClose={() => setIsSelectorOpen(false)}
                selectedReciter={currentReciter.identifier}
                onSelect={handleReciterSelect}
            />
        </div>
    );
}
