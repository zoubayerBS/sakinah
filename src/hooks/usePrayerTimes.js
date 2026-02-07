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

    const fetchPrayerTimes = async (searchAddress) => {
        setLoading(true);
        setError(null);
        try {
            const queryAddress = searchAddress || city;

            const response = await fetch(
                `https://api.aladhan.com/v1/timingsByAddress?address=${encodeURIComponent(queryAddress)}&method=2`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch prayer times');
            }

            const result = await response.json();
            if (result.code === 200 && result.data) {
                setData(result.data);
                if (searchAddress) setCity(searchAddress);
                // Country logic simplified as it's part of the address string if user provides it
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
