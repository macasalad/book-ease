"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function BookFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Read current URL parameters
    const currentCategory = searchParams.get("category") || "";
    const currentCondition = searchParams.get("condition") || "";
    const currentStatus = searchParams.get("status") || "";

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

    const handleApply = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const category = formData.get("category") as string;
        const condition = formData.get("condition") as string;
        const status = formData.get("status") as string;

        const params = new URLSearchParams(searchParams.toString());

        if (category) {
            params.set("category", category);
        } else {
            params.delete("category");
        }

        if (condition) {
            params.set("condition", condition);
        } else {
            params.delete("condition");
        }
       
        if (status) {
            params.set("status", status);
        } else {
            params.delete("status");
        }

        setIsOpen(false);
        router.push(`?${params.toString()}`);
    };

    const handleClear = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("category");
        params.delete("condition");
        params.delete("status");
        setIsOpen(false);
        router.push(`?${params.toString()}`);
    };

    const activeFiltersCount = [currentCategory, currentCondition, currentStatus].filter(Boolean).length;

    return (
        <div className="relative z-50" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="shrink-0 h-[48px] px-6 bg-[#f2ece4]/60 hover:bg-white/80 text-[#5c6b4d] border border-[#a3b18a]/40 font-semibold rounded-full transition-all shadow-sm backdrop-blur-md flex items-center justify-center gap-2 relative"
            >
                <span>Filters</span>
                <svg className="w-4 h-4 text-[#5c6b4d]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                
                {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#bc8a5f] text-white text-xs font-bold flex items-center justify-center rounded-full shadow-md">
                        {activeFiltersCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-3 w-72 bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl shadow-stone-200/50 rounded-[1.5rem] p-5 z-50">
                <form onSubmit={handleApply} className="flex flex-col gap-4">
                
                {/* Category Filter */}
                <div>
                    <label className="block text-xs font-bold text-[#8a8a8a] uppercase tracking-wider mb-1">Category</label>
                    <select name="category" defaultValue={currentCategory} className="w-full p-2.5 rounded-xl bg-white/50 border border-[#a3b18a]/30 text-[#4a4a4a] outline-none focus:border-[#bc8a5f] text-sm font-medium">
                        <option value="">All Categories</option>
                        <option value="Fiction">Fiction</option>
                        <option value="Non-Fiction">Non-Fiction</option>
                        <option value="Textbook">Textbook</option>
                        <option value="Sci-Fi">Sci-Fi</option>
                        <option value="Action">Action</option>
                        <option value="Thriller Action">Thriller Action</option>
                        <option value="Horror">Horror</option>
                        <option value="Adventure">Adventure</option>
                        <option value="Fantasy">Fantasy</option>
                        <option value="Mystery">Mystery</option>
                        <option value="Romance">Romance</option>
                        <option value="History">History</option>
                        <option value="Biography">Biography</option>
                        <option value="Science">Science</option>
                    </select>
                </div>

                {/* Condition Filter */}    
                <div>
                    <label className="block text-xs font-bold text-[#8a8a8a] uppercase tracking-wider mb-1">Condition</label>
                    <select name="condition" defaultValue={currentCondition} className="w-full p-2.5 rounded-xl bg-white/50 border border-[#a3b18a]/30 text-[#4a4a4a] outline-none focus:border-[#bc8a5f] text-sm font-medium">
                        <option value="">Any Condition</option>
                        <option value="new">New</option>
                        <option value="somewhat_new">Somewhat New</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                    </select>
                </div>

                {/* Status Filter */}
                <div>
                    <label className="block text-xs font-bold text-[#8a8a8a] uppercase tracking-wider mb-1">Status</label>
                    <select name="status" defaultValue={currentStatus} className="w-full p-2.5 rounded-xl bg-white/50 border border-[#a3b18a]/30 text-[#4a4a4a] outline-none focus:border-[#bc8a5f] text-sm font-medium">
                        <option value="">Any Status</option>
                        <option value="AVAILABLE">Available</option>
                        <option value="BORROWED">Borrowed</option>
                    </select>
                </div>

                <div className="flex gap-2 mt-2">
                    <button type="button" onClick={handleClear} className="flex-1 py-2 text-sm font-bold text-[#8a8a8a] hover:text-[#4a4a4a] transition-colors">
                    Clear
                    </button>
                    <button type="submit" className="flex-1 py-2 bg-[#a3b18a] hover:bg-[#8da074] text-white text-sm font-bold rounded-full transition-all shadow-md shadow-[#a3b18a]/20">
                    Apply
                    </button>
                </div>
                </form>
            </div>
            )}
        </div>
    );
};