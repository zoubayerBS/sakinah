import { useState, useEffect } from 'react';
import { kvService } from '../services/db.js';

/**
 * Custom hook to fetch prayer times from Aladhan API.
 * City is persisted in IndexedDB (Dexie) via kvService.
 */
export const usePrayerTimes = (initialCity = 'Moknine', initialCountry = 'Tunisia', initialAdjustment = -1) => {
    const [city, setCity] = useState(initialCity);
    const [country, setCountry] = useState(initialCountry);
    const [adjustment, setAdjustment] = useState(initialAdjustment);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [initialized, setInitialized] = useState(false);

    // Load saved city from Dexie on mount
    useEffect(() => {
        const loadCity = async () => {
            const savedCity = await kvService.get('user-city');
            if (savedCity) setCity(savedCity);
            setInitialized(true);
        };
        loadCity();
    }, []);

    const fetchPrayerTimes = async (searchAddress) => {
        setLoading(true);
        setError(null);
        try {
            const queryAddress = searchAddress || city;

            const isTunisia = queryAddress.toLowerCase().includes('tunis') || country === 'Tunisia';
            const method = isTunisia ? 13 : 2;

            const response = await fetch(
                `https://api.aladhan.com/v1/timingsByAddress?address=${encodeURIComponent(queryAddress)}&method=${method}&adjustment=${adjustment}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch prayer times');
            }

            const result = await response.json();
            if (result.code === 200 && result.data) {
                setData(result.data);
                if (searchAddress) {
                    setCity(searchAddress);
                    // Persist city in Dexie
                    await kvService.set('user-city', searchAddress);
                }
            } else {
                throw new Error(result.status || 'Unknown error');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch once city is loaded from DB
    useEffect(() => {
        if (initialized) {
            fetchPrayerTimes();
        }
    }, [initialized, adjustment]);

    return {
        timings: data?.timings || null,
        date: data?.date || null,
        meta: data?.meta || null,
        loading,
        error,
        city,
        country,
        adjustment,
        setAdjustment,
        fetchPrayerTimes
    };
};
