import React from 'react';
import { X, Loader2, ChevronDown, Check, Share2 } from 'lucide-react';
import VerseShareModal from '../VerseShareModal.jsx';

const AyahDetailPanel = ({
    showVerseDetail,
    setShowVerseDetail,
    setSelectedVerseKey,
    isDarkMode,
    mode,
    selectedVerseKey,
    verseDetailLoading,
    verseDetailData,
    tafsirList,
    selectedTafsir,
    setSelectedTafsir,
    showTafsirSelect,
    setShowTafsirSelect,
    tafsirData
}) => {
    const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
    if (!showVerseDetail) return null;

    return (
        <div
            className="fixed inset-0 z-[10000] flex items-end justify-center"
            onClick={() => {
                setShowVerseDetail(false);
                setSelectedVerseKey(null);
            }}
        >
            <div
                className={`relative flex flex-col w-full max-w-[600px] max-h-[70vh] rounded-t-[2.5rem] overflow-hidden shadow-2xl animate-slide-up ${isDarkMode ? 'bg-[#1A1A1A] text-white' : 'bg-[#FDFCFA] text-[#2C2C2C]'}`}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                style={{ borderTop: `2px solid ${mode.accent}30` }}
            >
                {/* Drag Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-12 h-1.5 rounded-full bg-current opacity-10" />
                </div>

                {/* Panel Header */}
                <div className="flex items-center justify-between px-6 pb-4 pt-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">معلومات الآية</span>
                        <h3 className="font-arabic font-bold text-xl" style={{ color: mode.accent }}>
                            {selectedVerseKey}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsShareModalOpen(true)}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 hover:bg-black/10 transition-all text-[var(--color-accent)]"
                            title="مشاركة الآية"
                        >
                            <Share2 size={20} />
                        </button>
                        <button
                            onClick={() => {
                                setShowVerseDetail(false);
                                setSelectedVerseKey(null);
                            }}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 hover:bg-black/10 transition-all font-bold"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content Scroll Area */}
                <div
                    className="flex-1 min-h-0 overflow-y-auto px-6 pb-12 nav-panel-scroll"
                    style={{ touchAction: 'pan-y', overscrollBehaviorY: 'contain' }}
                >
                    {verseDetailLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin opacity-40" size={32} />
                            <span className="font-arabic opacity-40">جاري تحميل التفسير...</span>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-fade-in">
                            {/* Verse Text Display */}
                            {verseDetailData && (
                                <div className="text-right p-4 rounded-2xl bg-black/5 border border-white/5">
                                    <p className="font-arabic text-2xl leading-relaxed mb-2" dir="rtl">
                                        {verseDetailData.textUthmani || verseDetailData.text}
                                    </p>
                                </div>
                            )}

                            {/* Tafsir Content */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: mode.accent }} />
                                        <h4 className="font-arabic font-bold text-lg">
                                            {tafsirList.find(t => t.id === selectedTafsir)?.name || 'التفسير'}
                                        </h4>
                                    </div>

                                    {/* Tafsir Selector */}
                                    {tafsirList.length > 0 && (
                                        <div className="relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowTafsirSelect(!showTafsirSelect);
                                                }}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all active:scale-95"
                                                style={{
                                                    borderColor: mode.accent + '40',
                                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                                    color: mode.text
                                                }}
                                            >
                                                <span className="text-xs font-bold font-arabic opacity-80">
                                                    {tafsirList.find(t => t.id === selectedTafsir)?.name || 'اختر التفسير'}
                                                </span>
                                                <ChevronDown size={14} className={`opacity-50 transition-transform ${showTafsirSelect ? 'rotate-180' : ''}`} />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {showTafsirSelect && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowTafsirSelect(false);
                                                        }}
                                                    />
                                                    <div
                                                        className="absolute top-full left-0 mt-2 w-56 max-h-[300px] overflow-y-auto rounded-xl shadow-xl z-20 border py-1 animate-fade-in nav-panel-scroll"
                                                        style={{
                                                            backgroundColor: isDarkMode ? '#252525' : '#FFFFFF',
                                                            borderColor: mode.accent + '20',
                                                            touchAction: 'pan-y',
                                                            overscrollBehaviorY: 'contain'
                                                        }}
                                                        onTouchStart={(e) => e.stopPropagation()}
                                                        onTouchMove={(e) => e.stopPropagation()}
                                                        onTouchEnd={(e) => e.stopPropagation()}
                                                    >
                                                        {tafsirList.map(t => (
                                                            <button
                                                                key={t.id}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedTafsir(t.id);
                                                                    setShowTafsirSelect(false);
                                                                }}
                                                                className={`w-full text-right px-4 py-2.5 text-xs font-arabic transition-colors flex items-center justify-between gap-2 border-b border-dashed border-white/5 last:border-0 hover:bg-black/5 ${selectedTafsir === t.id ? 'font-bold' : 'opacity-70'}`}
                                                                style={{
                                                                    color: selectedTafsir === t.id ? mode.accent : mode.text
                                                                }}
                                                            >
                                                                <span>
                                                                    {t.name}
                                                                    {t.language && t.language !== 'arabic' && (
                                                                        <span className="text-[10px] opacity-60 mr-1">({t.language})</span>
                                                                    )}
                                                                </span>
                                                                {selectedTafsir === t.id && <Check size={12} />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div
                                    className="font-tafsir text-xl leading-loose text-justify opacity-90"
                                    dir="rtl"
                                    dangerouslySetInnerHTML={{ __html: tafsirData?.text || 'لا يتوفر تفسير حالياً.' }}
                                />
                            </div>

                            {/* Translation if available */}
                            {verseDetailData?.translations && verseDetailData.translations.length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1.5 h-6 rounded-full opacity-30" style={{ backgroundColor: mode.accent }} />
                                        <h4 className="font-arabic font-bold text-lg">الترجمة الإنجليزية</h4>
                                    </div>
                                    <p className="text-sm opacity-60 leading-relaxed text-left" dir="ltr">
                                        {verseDetailData.translations[0].text.replace(/<[^>]*>/g, '')}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <VerseShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                verseData={verseDetailData}
                mode={mode}
            />
        </div>
    );
};

export default AyahDetailPanel;
