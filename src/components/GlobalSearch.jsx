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
        <div className="fixed inset-0 z-[1000] flex flex-col mesh-bg-light dark:mesh-bg-dark animate-fade-in" dir="rtl">
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-[var(--color-highlight)]/5 rounded-full blur-[100px] animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[25rem] h-[25rem] bg-[var(--color-accent)]/5 rounded-full blur-[80px] animate-pulse-slow"></div>

            <div className="relative z-10 flex items-center gap-6 px-8 py-8 border-b border-black/5 dark:border-white/5 backdrop-blur-xl bg-white/10 dark:bg-black/10">
                <div className="relative flex-1 group">
                    <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--color-accent)] group-hover:scale-110 transition-transform" size={24} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="ابحث في آيات القرآن الكريم..."
                        className="w-full bg-white/40 dark:bg-black/40 border-2 border-transparent border-b-[var(--color-accent)]/20 rounded-3xl pr-16 pl-6 py-5 font-arabic text-2xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] focus:bg-white/60 dark:focus:bg-black/60 transition-all shadow-inner placeholder:text-[var(--color-text-tertiary)]"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <button
                    onClick={onClose}
                    className="w-14 h-14 flex items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-red-500 hover:text-white transition-all duration-300"
                >
                    <X size={32} />
                </button>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto px-8 py-10 space-y-8 custom-scrollbar">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6">
                        <div className="relative">
                            <Loader2 className="w-16 h-16 text-[var(--color-accent)] animate-spin relative" />
                        </div>
                        <p className="font-arabic text-2xl font-bold text-[var(--color-text-secondary)]">جاري البحث في المصحف...</p>
                    </div>
                ) : query.length > 0 && results.length === 0 ? (
                    <div className="text-center py-32 space-y-4">
                        <div className="text-6xl opacity-20">🔍</div>
                        <p className="font-arabic text-[var(--color-text-tertiary)] text-2xl">
                            {query.length < 3 ? 'اكتب 3 أحرف على الأقل للبحث' : 'لا توجد نتائج تطابق بحثك'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-8 max-w-5xl mx-auto">
                        {results.map((result, idx) => (
                            <div
                                key={idx}
                                onClick={() => onVerseSelect(result)}
                                className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-sm rounded-3xl p-8 hover:border-[var(--color-accent)] transition-colors cursor-pointer group animate-fade-in-up relative overflow-hidden"
                                style={{ animationDelay: `${idx * 0.05}s` }}
                            >
                                <div className="flex items-start justify-between mb-8 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] flex items-center justify-center font-bold text-lg">
                                            {result.verse_number}
                                        </div>
                                        <div className="text-right">
                                            <span className="font-arabic font-black text-2xl text-[var(--color-text-primary)]">
                                                سورة {result.surah_name || result.chapter_id}
                                            </span>
                                            <p className="font-ui text-xs text-[var(--color-text-tertiary)] uppercase tracking-widest font-black mt-1">
                                                Page {result.page_number}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-[var(--color-text-tertiary)] group-hover:bg-[var(--color-accent)] group-hover:text-white transition-all duration-500">
                                        <BookOpen size={20} />
                                    </button>
                                </div>
                                <p className="font-arabic text-3xl md:text-4xl leading-[1.6] text-right text-[var(--color-text-primary)] relative z-10" dangerouslySetInnerHTML={{ __html: result.text }} />

                                <div className="mt-8 flex justify-end relative z-10">
                                    <span className="inline-flex items-center gap-2 text-[var(--color-accent)] font-bold text-sm bg-[var(--color-accent)]/10 px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                                        اذهب للآية <ChevronLeft size={16} />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {results.length > 0 && (
                <div className="relative z-10 p-6 bg-white/5 dark:bg-black/5 backdrop-blur-xl border-t border-black/5 dark:border-white/5 text-center">
                    <p className="font-arabic text-sm font-bold text-[var(--color-text-secondary)]">
                        تم العثور على <span className="text-[var(--color-accent)] mx-1">{results.length}</span> نتيجة بحث
                    </p>
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
