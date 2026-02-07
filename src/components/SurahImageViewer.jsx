import React from 'react';
import { FrameCorner } from './MushafDecorations';

export const SurahImageViewer = ({ startPage, endPage }) => {
    // Generate an array of page numbers between start and end
    const pages = Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
    );

    return (
        <div className="flex flex-col items-center gap-12 w-full max-w-[1000px] mx-auto">
            {pages.map((pageNum) => (
                <div
                    key={pageNum}
                    className="surah-page-container relative w-full bg-[#FDFCFA] shadow-2xl overflow-hidden aspect-[1/1.5] group animate-fade-in"
                >
                    {/* Decorative Frame (Consistent with Mushaf design) */}
                    <div className="absolute inset-4 border-2 border-[var(--color-border)] opacity-60 pointer-events-none"></div>
                    <div className="absolute inset-6 border border-[var(--color-accent)] opacity-20 pointer-events-none"></div>

                    {/* Corners */}
                    <FrameCorner className="absolute top-4 left-4 w-12 h-12 md:w-24 md:h-24 text-[var(--color-accent)]" />
                    <FrameCorner className="absolute top-4 right-4 w-12 h-12 md:w-24 md:h-24 text-[var(--color-accent)] transform scale-x-[-1]" />
                    <FrameCorner className="absolute bottom-4 left-4 w-12 h-12 md:w-24 md:h-24 text-[var(--color-accent)] transform scale-y-[-1]" />
                    <FrameCorner className="absolute bottom-4 right-4 w-12 h-12 md:w-24 md:h-24 text-[var(--color-accent)] transform rotate-180" />

                    {/* Page Content */}
                    <div className="relative z-10 w-full h-full flex flex-col p-8 md:p-14">
                        <img
                            src={`/output_images/qaloun-1-${pageNum}.png`}
                            alt={`Mushaf Page ${pageNum}`}
                            className="w-full h-full object-contain select-none"
                            loading="lazy"
                        />
                    </div>

                    {/* Page Number indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 font-ui text-[10px] md:text-sm text-[var(--color-text-tertiary)] opacity-60">
                        {pageNum}
                    </div>
                </div>
            ))}
        </div>
    );
};
