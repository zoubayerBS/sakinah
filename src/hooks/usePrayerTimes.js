import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch prayer times from Aladhan API.
 * @param {string} initialCity - Default city to fetch times for.
 * @param {string} initialCountry - Default country to fetch times for.
 * @returns {object} - { timings, date, meta, loading, error, fetchPrayerTimes }
 */
export const usePrayerTimes = (initialCity = 'Tunis', initialCountry = 'Tunisia') => {
    const [city, setCity] = useState(initialCity);
    const [country, setCountry] = useState(initialCountry);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPrayerTimes = async (searchCity, searchCountry) => {
        setLoading(true);
        setError(null);
        try {
            // Use method 2 (ISNA) or 3 (Muslim World League) or 5 (Egyptian General Authority of Survey)
            // Method 2 is widely used for North America, but 3 or 5 might be better for North Africa/Middle East.
            // Let's stick to 2 (ISNA) or generic default for now, can be parameterized.
            // Actually, for Tunisia, method 5 (Egyptian) or 1 (Umm al-Qura) is often closer, 
            // but Aladhan auto-detects nicely or we can specify. Let's use standard method=2 for now.
            const queryCity = searchCity || city;
            const queryCountry = searchCountry || country;

            const response = await fetch(
                `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(queryCity)}&country=${encodeURIComponent(queryCountry)}&method=2`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch prayer times');
            }

            const result = await response.json();
            if (result.code === 200 && result.data) {
                setData(result.data);
                if (searchCity) setCity(searchCity);
                if (searchCountry) setCountry(searchCountry);
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
    }, []);

    return {
        timings: data?.timings || null,
        date: data?.date || null,
        meta: data?.meta || null,
        loading,
        error,
        city,
        country,
        fetchPrayerTimes
    };
};
