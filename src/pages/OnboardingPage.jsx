import React, { useState } from 'react';
import { MapPin, Headphones, BookOpen, ChevronLeft, Check } from 'lucide-react';
import { tapLight, tapSuccess } from '../utils/haptics.js';

const slides = [
    {
        icon: '﷽',
        title: 'أهلاً بك في سكينة',
        subtitle: 'رفيقك في رحلة القرآن',
        desc: 'تلاوة • مصحف • أذكار • ختمة',
        isArabicIcon: true
    },
    {
        icon: MapPin,
        title: 'مدينتك',
        subtitle: 'لحساب مواقيت الصلاة',
        desc: 'يمكنك تغييرها لاحقاً في الإعدادات',
        input: 'city'
    },
    {
        icon: Headphones,
        title: 'القارئ المفضل',
        subtitle: 'اختر قارئك المفضل',
        desc: 'يمكنك التغيير في أي وقت',
        input: 'reciter'
    }
];

const reciters = [
    { id: 'ar.alafasy', name: 'مشاري العفاسي' },
    { id: 'ar.abdurrahmaansudais', name: 'عبدالرحمن السديس' },
    { id: 'ar.mahermuaiqly', name: 'ماهر المعيقلي' },
    { id: 'ar.husary', name: 'محمود خليل الحصري' },
    { id: 'ar.minshawi', name: 'محمد صديق المنشاوي' },
    { id: 'ar.abdulbasit', name: 'عبدالباسط عبدالصمد' },
];

export const OnboardingPage = ({ onComplete }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [city, setCity] = useState('Moknine');
    const [selectedReciter, setSelectedReciter] = useState('ar.alafasy');

    const handleNext = () => {
        tapLight();
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            tapSuccess();
            // Save preferences
            localStorage.setItem('onboarding-complete', 'true');
            localStorage.setItem('user-city', city);
            localStorage.setItem('preferred-reciter', selectedReciter);
            onComplete();
        }
    };

    const slide = slides[currentSlide];
    const isLast = currentSlide === slides.length - 1;

    return (
        <div className="fixed inset-0 z-[99999] bg-[var(--color-bg-primary)] flex flex-col items-center justify-center p-8" dir="rtl">
            {/* Background Decoration */}
            <div className="absolute top-[15%] right-[-10%] w-[30rem] h-[30rem] bg-[var(--color-accent)]/5 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[15%] left-[-10%] w-[25rem] h-[25rem] bg-[var(--color-highlight)]/5 rounded-full blur-[80px]"></div>

            <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center space-y-8 animate-fade-in" key={currentSlide}>
                {/* Icon */}
                <div className="w-24 h-24 rounded-3xl bg-[var(--color-accent)]/10 flex items-center justify-center">
                    {slide.isArabicIcon ? (
                        <span className="font-arabic text-3xl text-[var(--color-accent)]">{slide.icon}</span>
                    ) : (
                        <slide.icon size={40} className="text-[var(--color-accent)]" />
                    )}
                </div>

                {/* Title */}
                <div>
                    <h1 className="font-arabic font-black text-3xl text-[var(--color-text-primary)] mb-2">{slide.title}</h1>
                    <p className="font-arabic text-lg text-[var(--color-text-secondary)]">{slide.subtitle}</p>
                    <p className="font-arabic text-sm text-[var(--color-text-tertiary)] mt-2">{slide.desc}</p>
                </div>

                {/* Input (based on slide) */}
                {slide.input === 'city' && (
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl px-6 py-4 font-arabic text-lg text-center text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                        placeholder="اسم المدينة..."
                    />
                )}

                {slide.input === 'reciter' && (
                    <div className="w-full space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar">
                        {reciters.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => { tapLight(); setSelectedReciter(r.id); }}
                                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all border ${selectedReciter === r.id
                                        ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30 text-[var(--color-accent)]'
                                        : 'bg-[var(--color-bg-secondary)] border-[var(--color-border)] text-[var(--color-text-primary)]'
                                    }`}
                            >
                                <span className="font-arabic font-bold text-lg">{r.name}</span>
                                {selectedReciter === r.id && <Check size={20} />}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="relative z-10 w-full max-w-md mt-12 space-y-4">
                {/* Dot Indicators */}
                <div className="flex justify-center gap-2">
                    {slides.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-[var(--color-accent)]' : 'w-1.5 bg-black/10 dark:bg-white/10'
                                }`}
                        />
                    ))}
                </div>

                {/* Next / Start Button */}
                <button
                    onClick={handleNext}
                    className="w-full py-4 rounded-2xl bg-[var(--color-accent)] text-white font-arabic font-black text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                >
                    {isLast ? 'ابدأ الآن' : 'التالي'}
                </button>

                {/* Skip */}
                {!isLast && (
                    <button
                        onClick={() => {
                            localStorage.setItem('onboarding-complete', 'true');
                            onComplete();
                        }}
                        className="w-full py-2 text-sm font-arabic text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-colors"
                    >
                        تخطّي
                    </button>
                )}
            </div>
        </div>
    );
};
