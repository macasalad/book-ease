"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type SearchItem = {
  id: string;
  title: string;
  author: string;
  image: string | null;
  href: string;
  source: "local" | "external";
};

export default function BookSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const trimmed = query.trim();

      if (trimmed.length < 1) {
        setResults([]);
        setOpen(false);
        return;
      }

      try {
        const res = await fetch(`/api/book_listing/search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        setResults(data.items ?? []);
        setOpen(true);
      } catch {
        setResults([]);
        setOpen(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="flex items-center bg-white/50 border border-[#a3b18a]/30 rounded-full px-4 py-2 shadow-sm backdrop-blur-md">
        <svg
          className="w-5 h-5 text-[#8a8a8a] mr-2 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length > 0) setOpen(true);
          }}
          placeholder="Search titles, authors..."
          className="bg-transparent border-none outline-none w-full text-[#5c5c5c] placeholder-[#a0a0a0] font-medium"
        />
      </div>

      {open && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-3xl border border-[#d8d1c7] bg-white shadow-xl">
          {results.length > 0 ? (
            <>
              {results.map((book, index) => (
                <Link
                  key={`${book.source}-${book.id}-${index}`}
                  href={book.href}
                  className="flex items-center gap-3 border-b border-[#eee7dc] px-4 py-3 hover:bg-[#f8f4ed] transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md bg-[#e9e1d4]">
                    {book.image ? (
                      <img
                        src={book.image}
                        alt={book.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-[#8a8a8a]">
                        📖
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-semibold text-[#4a4a4a]">
                      {book.title}
                    </div>
                    <div className="truncate text-sm text-[#7d7d7d] font-medium">
                      by {book.author || "Unknown Author"}
                    </div>
                  </div>
                </Link>
              ))}

              <Link
                href={`/dashboard?search=${encodeURIComponent(query.trim())}`}
                className="block px-4 py-4 text-center text-[15px] font-medium text-[#5a7d5a] hover:bg-[#f8f4ed] transition-colors"
                onClick={() => setOpen(false)}
              >
                See all results for "{query.trim()}"
              </Link>
            </>
          ) : (
            <div className="px-4 py-4 text-sm font-medium text-[#8a8a8a]">
              No matches found for "{query.trim()}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
