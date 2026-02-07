import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch city suggestions from Photon (OpenStreetMap) API.
 * @returns {object} - { suggestions, loading, fetchSuggestions, clearSuggestions }
 */
export const useCitySuggestions = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchSuggestions = async (query) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        try {
            // Photon API for search suggestions
            const response = await fetch(
                `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`
            );

            if (!response.ok) throw new Error('Failed to fetch suggestions');

            const result = await response.json();

            // Map results to a simpler format
            const formatted = result.features.map(f => {
                const p = f.properties;
                const name = p.name;
                const city = p.city || p.state || '';
                const country = p.country || '';

                // Construct a display label
                let label = name;
                if (city && city !== name) label += `, ${city}`;
                if (country) label += `, ${country}`;

                return {
                    id: f.properties.osm_id + Math.random(),
                    label,
                    name: p.name,
                    city: p.city || p.name,
                    country: p.country
                };
            });

            // Filter unique labels
            const unique = Array.from(new Map(formatted.map(item => [item.label, item])).values());
            setSuggestions(unique);
        } catch (error) {
            console.error('Suggestion fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const clearSuggestions = () => setSuggestions([]);

    return { suggestions, loading, fetchSuggestions, clearSuggestions };
};
