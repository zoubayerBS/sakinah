import React, { useState, useEffect } from 'react';
import { Search, X, Music, User, Globe, Check } from 'lucide-react';
import { quranAPI } from '../services/quran-api.js';

export const ReciterSelector = ({ isOpen, onClose, selectedReciter, selectedMoshafId, onSelect }) => {
    const [reciters, setReciters] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [expandedReciterId, setExpandedReciterId] = useState(null);

    useEffect(() => {
        if (isOpen) {
            const fetchReciters = async () => {
                const data = await quranAPI.getReciters();
                setReciters(data);
                setIsLoading(false);
            };
            fetchReciters();
        }
    }, [isOpen]);

    const getMoshafLabel = (moshaf) => {
        if (!moshaf) return 'مصحف';
        if (moshaf.rewaya && moshaf.name && moshaf.name !== moshaf.rewaya) {
            return `${moshaf.rewaya} • ${moshaf.name}`;
        }
        return moshaf.rewaya || moshaf.name || 'مصحف';
    };

    const filteredReciters = reciters.filter(r => {
        const query = searchQuery.toLowerCase();
        const matchesName =
            (r.englishName || '').toLowerCase().includes(query) ||
            (r.name || '').includes(searchQuery);
        const matchesId = String(r.identifier || '').toLowerCase().includes(query);
        const matchesMoshafId = Array.isArray(r.moshaf)
            ? r.moshaf.some((m) => String(m.id || '').toLowerCase().includes(query))
            : false;
        return matchesName || matchesId || matchesMoshafId;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-md"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-[var(--color-bg-primary)] rounded-[var(--radius-xl)] shadow-2xl border border-[var(--color-border)] overflow-hidden flex flex-col max-h-[80vh] animate-slide-up">

                {/* Header */}
                <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg-secondary)]">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-[var(--color-accent)]/10 rounded-lg">
                            <Music className="w-5 h-5 text-[var(--color-accent)]" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--color-text-primary)]">اختر القارئ</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-full transition-colors"
                    >
                        <X size={20} className="text-[var(--color-text-secondary)]" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-[var(--color-border)]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] w-5 h-5" />
                        <input
                            type="text"
                            placeholder="ابحث عن قارئ..."
                            className="w-full bg-[var(--color-bg-tertiary)] border-none rounded-[var(--radius-md)] pl-10 pr-4 py-3 text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            dir="rtl"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-[var(--color-text-secondary)]">جاري تحميل القراء...</p>
                        </div>
                    ) : filteredReciters.length > 0 ? (
                        filteredReciters.map((reciter) => {
                            const moshafOptions = Array.isArray(reciter.moshaf) ? reciter.moshaf : [];
                            const hasMultipleMoshaf = moshafOptions.length > 1;
                            const defaultMoshafId = reciter.defaultMoshafId || moshafOptions[0]?.id || null;
                            const currentMoshafId = selectedReciter === reciter.identifier
                                ? (selectedMoshafId || defaultMoshafId)
                                : defaultMoshafId;

                            return (
                                <div key={reciter.identifier} className="space-y-2">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (hasMultipleMoshaf) {
                                                setExpandedReciterId(prev => prev === reciter.identifier ? null : reciter.identifier);
                                                return;
                                            }
                                            const selected = {
                                                ...reciter,
                                                selectedMoshafId: currentMoshafId,
                                                selectedMoshafLabel: getMoshafLabel(moshafOptions.find(m => String(m.id) === String(currentMoshafId))),
                                            };
                                            onSelect(selected);
                                        }}
                                        className={`w-full flex items-center justify-between p-4 rounded-[var(--radius-lg)] transition-all ${selectedReciter === reciter.identifier
                                            ? 'bg-[var(--color-accent)]/10 border border-[var(--color-accent)]'
                                            : 'hover:bg-[var(--color-bg-secondary)] border border-transparent'
                                            }`}
                                        dir="rtl"
                                    >
                                        <div className="flex items-center space-x-4 space-x-reverse text-right">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedReciter === reciter.identifier ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]'
                                                }`}>
                                                <User size={24} />
                                            </div>
                                    <div>
                                        <p className="font-bold text-[var(--color-text-primary)]">
                                            {reciter.name}
                                        </p>
                                        <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1">
                                            ID: {reciter.identifier}
                                        </p>
                                        {hasMultipleMoshaf && (
                                            <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1">
                                                اختر الرواية
                                            </p>
                                        )}
                                    </div>
                                        </div>
                                        {selectedReciter === reciter.identifier && (
                                            <div className="w-6 h-6 bg-[var(--color-accent)] rounded-full flex items-center justify-center">
                                                <Check size={14} className="text-white" />
                                            </div>
                                        )}
                                    </button>

                                    {hasMultipleMoshaf && expandedReciterId === reciter.identifier && (
                                        <div className="flex flex-wrap gap-2 pr-4" dir="rtl">
                                            {moshafOptions.map((m) => {
                                                const label = getMoshafLabel(m);
                                                const isSelected = String(m.id) === String(currentMoshafId);
                                                return (
                                                    <button
                                                        key={m.id || label}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            const selected = {
                                                                ...reciter,
                                                                selectedMoshafId: m.id || null,
                                                                selectedMoshafLabel: label,
                                                            };
                                                            onSelect(selected);
                                                        }}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-arabic transition-colors border ${isSelected
                                                            ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                                                            : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
                                                            }`}
                                                    >
                                                        {label} {m.id ? `#${m.id}` : ''}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-20 opacity-50">
                            <p className="text-[var(--color-text-secondary)]">لا يوجد نتائج</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
