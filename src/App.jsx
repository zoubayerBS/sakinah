import React, { useState, useEffect } from 'react';
import { HomePage } from './pages/HomePage.jsx';
import { ReadingPage } from './pages/ReadingPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { PrayerTimesPage } from './pages/PrayerTimesPage.jsx';
import { NavigationBar } from './components/NavigationBar.jsx';
import { ThemeToggle } from './components/ThemeToggle.jsx';
import { AudioProvider } from './context/AudioContext.jsx';
import { MiniPlayer } from './components/MiniPlayer.jsx';

const AppContent = () => {
    const [currentPage, setCurrentPage] = useState('home');
    const [selectedSurah, setSelectedSurah] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleNavigate = (page) => {
        setCurrentPage(page);
    };

    const handleSurahSelect = (surah) => {
        setSelectedSurah(surah);
        setCurrentPage('reading');
        window.scrollTo({ top: 0, behavior: 'instant' });
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <div className="min-h-screen transition-colors duration-300 bg-[var(--color-bg-primary)]">
            <NavigationBar
                currentPage={currentPage}
                onNavigate={handleNavigate}
            />



            <main className="animate-fade-in">
                {currentPage === 'home' && (
                    <HomePage onSurahSelect={handleSurahSelect} onNavigate={handleNavigate} />
                )}

                {/* Other pages would go here */}

                {currentPage === 'reading' && selectedSurah && (
                    <ReadingPage
                        surah={selectedSurah}
                        onBack={() => handleNavigate('home')}
                    />
                )}

                {currentPage === 'settings' && (
                    <SettingsPage
                        theme={theme}
                        toggleTheme={toggleTheme}
                        onBack={() => handleNavigate('home')}
                    />
                )}

                {currentPage === 'prayer' && (
                    <PrayerTimesPage
                        onBack={() => handleNavigate('home')}
                    />
                )}
            </main>

            {/* PERSISTENT MINI PLAYER - Show on all pages except full reading view */}
            {currentPage !== 'reading' && (
                <MiniPlayer onOpen={() => setCurrentPage('reading')} />
            )}

            <div className="h-32"></div>
        </div>
    );
};

const App = () => (
    <AudioProvider>
        <AppContent />
    </AudioProvider>
);

export default App;
