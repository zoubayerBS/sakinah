import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, ChevronLeft, Loader2, List } from 'lucide-react';
import { quranAPI } from '../services/quran-api.js';

const IntegratedSearch = ({ onVerseSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handler = setTimeout(async () => {
            if (query.length < 3) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const data = await quranAPI.search(query);
                if (data && data.results) {
                    setResults(data.results.slice(0, 5)); // Show top 5 in integrated view
                }
            } catch (err) {
                console.error('Search failed:', err);
            } finally {
                setIsLoading(false);
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [query]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full mt-6 md:mt-8" ref={dropdownRef}>
            <div className={`relative group/search transition-all duration-300 ${isFocused ? 'scale-[1.01]' : ''}`}>
                <div className={`absolute -inset-1 bg-[var(--color-accent)]/10 rounded-2xl blur transition-opacity duration-500 ${isFocused ? 'opacity-100' : 'opacity-0 group-hover/search:opacity-100'}`}></div>
                <div className={`relative bg-black/5 dark:bg-white/5 border rounded-2xl p-2 md:p-3 flex items-center transition-all duration-300 ${isFocused ? 'border-[var(--color-accent)] bg-white/10 dark:bg-black/20 shadow-xl' : 'border-black/5 dark:border-white/10 hover:bg-black/10'}`}>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[var(--color-accent)] text-white flex items-center justify-center shadow-lg shrink-0">
                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                    </div>
                    <input
                        type="text"
                        placeholder="ابحث في نور المصحف (3 أحرف على الأقل)..."
                        className="flex-1 bg-transparent border-none outline-none font-arabic text-lg md:text-xl text-[var(--color-text-primary)] px-4 placeholder:text-[var(--color-text-tertiary)]/50"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                    />
                    {query && (
                        <button
                            onClick={() => { setQuery(''); setResults([]); }}
                            className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] transition-colors"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Results Dropdown */}
            {isFocused && (query.length >= 3 || results.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-4 z-[100] animate-fade-in-up">
                    <div className="glass-premium rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-black/5 dark:border-white/10 overflow-hidden backdrop-blur-3xl bg-white/40 dark:bg-black/60">
                        {isLoading ? (
                            <div className="p-12 flex flex-col items-center gap-4">
                                <Loader2 className="w-8 h-8 text-[var(--color-accent)] animate-spin" />
                                <p className="font-arabic text-sm text-[var(--color-text-secondary)]">جاري البحث...</p>
                            </div>
                        ) : results.length > 0 ? (
                            <div className="divide-y divide-black/5 dark:divide-white/5">
                                {results.map((result, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            onVerseSelect(result);
                                            setIsFocused(false);
                                        }}
                                        className="p-6 hover:bg-[var(--color-accent)]/5 cursor-pointer group transition-colors flex items-center justify-between gap-6"
                                    >
                                        <div className="flex-1 text-right">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-arabic font-black text-[var(--color-text-primary)]">
                                                    سورة {result.surah_name || result.chapter_id}
                                                </span>
                                                <span className="text-xs bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-0.5 rounded-lg font-bold">
                                                    آية {result.verse_number}
                                                </span>
                                            </div>
                                            <p className="font-arabic text-lg text-[var(--color-text-primary)] line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity" dangerouslySetInnerHTML={{ __html: result.text }} />
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-[var(--color-text-tertiary)] group-hover:bg-[var(--color-accent)] group-hover:text-white transition-all">
                                            <ChevronLeft size={20} />
                                        </div>
                                    </div>
                                ))}
                                <div className="p-4 bg-black/5 dark:bg-white/5 text-center">
                                    <p className="font-arabic text-xs text-[var(--color-text-tertiary)]">
                                        ظهرت أهم 5 نتائج. اضغط "Enter" للبحث الشامل (قريباً)
                                    </p>
                                </div>
                            </div>
                        ) : query.length >= 3 && (
                            <div className="p-12 text-center opacity-50">
                                <List className="mx-auto mb-3 text-[var(--color-text-tertiary)]" size={32} />
                                <p className="font-arabic text-sm">لا توجد نتائج تطابق بحثك</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntegratedSearch;
