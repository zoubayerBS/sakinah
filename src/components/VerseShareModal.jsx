import React, { useRef } from 'react';
import { Share2, Download, X, Copy, Check } from 'lucide-react';

const VerseShareModal = ({ isOpen, onClose, verseData, mode }) => {
    const [copied, setCopied] = React.useState(false);
    const cardRef = useRef(null);

    const handleCopy = () => {
        const text = `${verseData.textUthmani || verseData.text}\n\n[سورة ${verseData.surah?.name || ''} - آية ${verseData.numberInSurah}]`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'آية من القرآن الكريم',
                    text: `${verseData.textUthmani || verseData.text}\n\n[سورة ${verseData.surah?.name || ''} - آية ${verseData.numberInSurah}]`,
                    url: window.location.href
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            handleCopy();
        }
    };

    if (!isOpen || !verseData) return null;

    return (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-[450px] animate-scale-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                {/* The Shareable Card */}
                <div
                    ref={cardRef}
                    className="aspect-[4/5] w-full rounded-[2rem] overflow-hidden relative shadow-2xl bg-[#FDFCFA]"
                    style={{ border: `8px solid ${mode.accent}20` }}
                >
                    {/* Decorative Background */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-accent)] rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--color-highlight)] rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
                    </div>

                    {/* Card Content */}
                    <div className="relative h-full flex flex-col items-center justify-center p-10 text-center">
                        {/* Sacred Ornament Top */}
                        <div className="mb-8 opacity-20">
                            <img src="/ornament-top.svg" className="w-24 h-auto" onError={(e) => e.target.style.display = 'none'} />
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center">
                            <p className="font-arabic text-3xl md:text-4xl leading-relaxed text-[#2C2C2C] mb-8" dir="rtl">
                                {verseData.textUthmani || verseData.text}
                            </p>

                            <div className="flex flex-col items-center gap-2">
                                <div className="h-px w-20 bg-[#2C2C2C]/10" />
                                <span className="font-arabic text-sm text-[#2C2C2C]/60">
                                    سورة {verseData.surah?.name || '...'} | آية {verseData.numberInSurah}
                                </span>
                            </div>
                        </div>

                        {/* App Logo/Branding */}
                        <div className="mt-8 flex flex-col items-center gap-2">
                            <img src="/logo2.png" alt="Sakinah" className="h-8 w-auto opacity-50 grayscale" />
                            <span className="text-[8px] tracking-[0.4em] uppercase opacity-30 font-ui text-[#2C2C2C]">Sakinah App</span>
                        </div>

                        {/* Sacred Ornament Bottom */}
                        <div className="mt-6 opacity-10 rotate-180">
                            <img src="/ornament-top.svg" className="w-16 h-auto" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-4 justify-center">
                    <button
                        onClick={handleCopy}
                        className="flex-1 flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full py-3 font-arabic text-sm hover:bg-white/20 transition-all active:scale-95"
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        {copied ? 'تم النسخ' : 'نسخ النص'}
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex-[2] flex items-center justify-center gap-2 bg-[var(--color-accent)] text-white rounded-full py-3 font-arabic text-sm shadow-xl hover:opacity-90 transition-all active:scale-95"
                    >
                        <Share2 size={18} />
                        مشاركة الآية
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerseShareModal;
