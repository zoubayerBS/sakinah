import React, { useState, useEffect, useCallback } from 'react';
import { HomePage } from './pages/HomePage.jsx';
import { PlayerPage } from './pages/PlayerPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { PrayerTimesPage } from './pages/PrayerTimesPage.jsx';
import { KhitmaPage } from './pages/KhitmaPage.jsx';
import MushafPage from './pages/MushafPage.jsx';
import { AdhkarPage } from './pages/AdhkarPage.jsx';
import { OnboardingPage } from './pages/OnboardingPage.jsx';
import { NavigationBar } from './components/NavigationBar.jsx';
import { ThemeToggle } from './components/ThemeToggle.jsx';
import { AudioProvider } from './context/AudioContext.jsx';
import { MiniPlayer } from './components/MiniPlayer.jsx';
import { migrateToIndexedDB, getKhitmaState, saveKhitmaState, getTheme, saveTheme } from './utils/storage-utils.js';
import { DBStatusToast } from './components/DBStatusToast.jsx';
import { kvService } from './services/db.js';

const AppContent = () => {
    const [currentPage, setCurrentPage] = useState('home');
    const [selectedSurah, setSelectedSurah] = useState(null);
    const [theme, setTheme] = useState('light');
    const [khitma, setKhitma] = useState(null);
    const [autoNightMode, setAutoNightMode] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(() => {
        return !localStorage.getItem('onboarding-complete');
    });

    // Load all initial states from Dexie/IndexedDB
    useEffect(() => {
        const initializeApp = async () => {
            // 1. One-time migration if needed
            await migrateToIndexedDB();

            // 2. Load Theme
            const savedTheme = await getTheme();
            if (savedTheme) setTheme(savedTheme);

            // 3. Load Khitma
            const savedKhitma = await getKhitmaState();
            setKhitma(savedKhitma);

            // 4. Load auto night mode preference
            const savedAutoNight = await kvService.get('autoNightMode');
            if (savedAutoNight) setAutoNightMode(true);
        };
        initializeApp();
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        saveTheme(theme);
    }, [theme]);

    // Persist auto night mode preference
    useEffect(() => {
        kvService.set('autoNightMode', autoNightMode);
    }, [autoNightMode]);

    // Auto night mode: check every minute
    useEffect(() => {
        if (!autoNightMode) return;

        const checkAndSwitch = async () => {
            try {
                const res = await fetch('https://api.aladhan.com/v1/timingsByAddress?address=Moknine&method=13');
                const data = await res.json();
                if (data.code !== 200) return;
                const maghrib = data.data.timings.Maghrib?.split(' ')[0];
                const fajr = data.data.timings.Fajr?.split(' ')[0];
                if (!maghrib || !fajr) return;

                const now = new Date();
                const nowMins = now.getHours() * 60 + now.getMinutes();
                const [mH, mM] = maghrib.split(':').map(Number);
                const [fH, fM] = fajr.split(':').map(Number);
                const maghribMins = mH * 60 + mM;
                const fajrMins = fH * 60 + fM;

                const isNight = nowMins >= maghribMins || nowMins < fajrMins;
                setTheme(isNight ? 'dark' : 'light');
            } catch (e) {
                // Silent fail - keep current theme
            }
        };

        checkAndSwitch();
        const interval = setInterval(checkAndSwitch, 60000);
        return () => clearInterval(interval);
    }, [autoNightMode]);

    const handleUpdateKhitma = async (newState) => {
        setKhitma(newState);
        await saveKhitmaState(newState);
    };

    const handleNavigate = (page) => {
        setCurrentPage(page);
    };

    const handleSurahSelect = (surah) => {
        setSelectedSurah(surah);
        setCurrentPage('reading');
        window.scrollTo({ top: 0, behavior: 'instant' });
    };

    const toggleTheme = () => {
        const themes = ['light', 'white', 'dark', 'damas', 'manuscript', 'royal'];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    const handleSetTheme = (newTheme) => {
        setTheme(newTheme);
    };

    return (
        <div className="min-h-screen transition-colors duration-300 bg-[var(--color-bg-primary)]">
            {/* Onboarding */}
            {showOnboarding && (
                <OnboardingPage onComplete={() => setShowOnboarding(false)} />
            )}

            {currentPage !== 'mushaf' && !showOnboarding && (
                <NavigationBar
                    currentPage={currentPage}
                    onNavigate={handleNavigate}
                />
            )}



            <main>
                {currentPage === 'home' && (
                    <HomePage
                        onSurahSelect={handleSurahSelect}
                        onNavigate={handleNavigate}
                        khitma={khitma}
                        onUpdateKhitma={handleUpdateKhitma}
                    />
                )}

                {/* Other pages would go here */}

                {currentPage === 'reading' && selectedSurah && (
                    <PlayerPage
                        surah={selectedSurah}
                        onBack={() => handleNavigate('home')}
                    />
                )}

                {currentPage === 'settings' && (
                    <SettingsPage
                        theme={theme}
                        toggleTheme={toggleTheme}
                        setTheme={handleSetTheme}
                        onBack={() => handleNavigate('home')}
                        autoNightMode={autoNightMode}
                        setAutoNightMode={setAutoNightMode}
                    />
                )}

                {currentPage === 'prayer' && (
                    <PrayerTimesPage
                        onBack={() => handleNavigate('home')}
                    />
                )}

                {currentPage === 'khitma' && (
                    <KhitmaPage
                        onBack={() => handleNavigate('home')}
                        khitma={khitma}
                        onUpdateKhitma={handleUpdateKhitma}
                    />
                )}

                {currentPage === 'adhkar' && (
                    <AdhkarPage
                        onBack={() => handleNavigate('home')}
                    />
                )}

                {currentPage === 'mushaf' && (
                    <MushafPage
                        onBack={() => handleNavigate('home')}
                        theme={theme}
                        setTheme={handleSetTheme}
                        khitma={khitma}
                        onUpdateKhitma={handleUpdateKhitma}
                    />
                )}
            </main>

            {/* PERSISTENT MINI PLAYER - Show on all pages except full reading view */}
            {currentPage !== 'reading' && (
                <MiniPlayer onOpen={() => setCurrentPage('reading')} />
            )}

            <DBStatusToast />

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
