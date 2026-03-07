"use client";

import { useRef } from "react";

// The placeholder book component (moved here for convenience)
const PlaceholderBook = ({ index }: { index: number }) => (
    <div className="flex flex-col items-center space-y-3 min-w-[160px] shrink-0 snap-start">
        <div className="w-[160px] h-[220px] bg-[#d9d9d9] border-2 border-gray-400 relative flex items-center justify-center overflow-hidden shadow-sm">
            {/* The "X" lines */}
            <div className="absolute w-[300px] h-[2px] bg-gray-400 rotate-[54deg]"></div>
            <div className="absolute w-[300px] h-[2px] bg-gray-400 -rotate-[54deg]"></div>
        </div>
        <span className="font-bold text-[15px] text-gray-900">Book Title {index}</span>
    </div>
);

export function BookCarousel({ title, items }: { title: string, items: number[] }) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Function to handle the smooth scrolling
    const scrollRight = () => {
        if (scrollContainerRef.current) {
            // Scrolls right by about 2 book widths
            scrollContainerRef.current.scrollBy({ left: 350, behavior: 'smooth' });
        }
    };

    return (
        <section className="mb-12">
            <h2 className="text-xl font-bold mb-4 text-gray-900 tracking-wide">{title}</h2>
            <div className="relative">
                {/* The Grey Container */}
                <div 
                    ref={scrollContainerRef}
                    className="bg-[#f5f5f5] rounded-[2rem] p-8 flex space-x-8 overflow-x-auto no-scrollbar items-center snap-x snap-mandatory pr-24"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {items.map((num) => (
                        <PlaceholderBook key={`${title}-${num}`} index={num} />
                    ))}
                </div>
                
                {/* Functional Right Arrow */}
                <button 
                    onClick={scrollRight}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors bg-white/50 hover:bg-white rounded-full p-2"
                    aria-label="Scroll right"
                >
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </section>
    );
}