import React from 'react';

export const DailyAyah = () => {
    // Hardcoded for demo - ideally fetched daily
    const ayah = {
        text: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
        surah: "الشرح",
        number: 5
    };

    return (
        <div className="text-center mb-10 p-6 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]">
            <h4 className="font-arabic text-xs text-[var(--color-text-tertiary)] mb-3">
                آية اليوم
            </h4>
            <p className="font-arabic text-2xl text-[var(--color-text-primary)] leading-relaxed mb-4">
                {ayah.text}
            </p>
            <p className="font-arabic text-sm text-[var(--color-text-secondary)]">
                سورة {ayah.surah} • آية {ayah.number}
            </p>
        </div>
    );
};
