import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, ChevronLeft, Loader2 } from 'lucide-react';
import { quranAPI } from '../services/quran-api.js';

const GlobalSearch = ({ isOpen, onClose, onVerseSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

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
                    setResults(data.results);
                }
            } catch (err) {
                console.error('Search failed:', err);
            } finally {
                setIsLoading(false);
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [query]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex flex-col bg-[var(--color-bg-primary)]/95 backdrop-blur-md animate-fade-in" dir="rtl">
            <div className="flex items-center gap-4 px-6 py-4 border-b border-[var(--color-border)]">
                <div className="relative flex-1">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" size={20} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="ابحث في آيات القرآن الكريم..."
                        className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-full pr-12 pl-4 py-3 font-arabic text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-[var(--color-highlight)] transition-colors"
                >
                    <X size={24} className="text-[var(--color-text-secondary)]" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 custom-scrollbar">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="w-10 h-10 text-[var(--color-accent)] animate-spin" />
                        <p className="font-arabic text-[var(--color-text-secondary)]">جاري البحث...</p>
                    </div>
                ) : query.length > 0 && results.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="font-arabic text-[var(--color-text-tertiary)] text-lg">
                            {query.length < 3 ? 'اكتب 3 أحرف على الأقل للبحث' : 'لا توجد نتائج تطابق بحثك'}
                        </p>
                    </div>
                ) : (
                    results.map((result, idx) => (
                        <div
                            key={idx}
                            onClick={() => onVerseSelect(result)}
                            className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 hover:border-[var(--color-accent)] transition-all cursor-pointer group animate-fade-in-up"
                            style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)] font-bold text-xs">
                                        {result.verse_number}
                                    </div>
                                    <span className="font-arabic font-bold text-[var(--color-text-primary)]">
                                        سورة {result.surah_name || result.chapter_id}
                                    </span>
                                </div>
                                <BookOpen size={16} className="text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent)] transition-colors" />
                            </div>
                            <p className="font-arabic text-xl leading-loose text-right text-[var(--color-text-primary)]" dangerouslySetInnerHTML={{ __html: result.text }} />
                        </div>
                    ))
                )}
            </div>

            {results.length > 0 && (
                <div className="p-4 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] text-center">
                    <p className="font-arabic text-xs text-[var(--color-text-tertiary)]">
                        تم العثور على {results.length} نتيجة
                    </p>
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
