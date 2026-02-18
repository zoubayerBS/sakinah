import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch prayer times from Aladhan API.
 * @param {string} initialCity - Default city to fetch times for.
 * @param {string} initialCountry - Default country to fetch times for.
 * @returns {object} - { timings, date, meta, loading, error, fetchPrayerTimes }
 */
export const usePrayerTimes = (initialCity = 'Moknine', initialCountry = 'Tunisia', initialAdjustment = -1) => {
    const [city, setCity] = useState(initialCity);
    const [country, setCountry] = useState(initialCountry);
    const [adjustment, setAdjustment] = useState(initialAdjustment);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPrayerTimes = async (searchAddress) => {
        setLoading(true);
        setError(null);
        try {
            const queryAddress = searchAddress || city;

            // Method 13 is Directorate of Religious Affairs, Tunisia
            // We use method 2 (Islamic Society of North America) as fallback
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
                if (searchAddress) setCity(searchAddress);
            } else {
                throw new Error(result.status || 'Unknown error');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrayerTimes();
    }, [adjustment]);

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
