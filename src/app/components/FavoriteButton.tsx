"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  bookId: string;
  initialIsFavorited: boolean;
  variant?: 'icon' | 'text';
}

export default function FavoriteButton({ bookId, initialIsFavorited, variant = 'icon' }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    setIsLoading(true);
    setIsFavorited(!isFavorited); 

    try {
      const response = await fetch("/api/favorites", {
        method: isFavorited ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookId }),
      });

      if (!response.ok) {
        setIsFavorited(isFavorited);
        console.error("Failed to update favorite status");
      } else {
        router.refresh(); 
      }
    } catch (error) {
      setIsFavorited(isFavorited);
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (variant === 'text') {
    return (
      <button 
        onClick={toggleFavorite} 
        disabled={isLoading}
        className={`flex-1 w-full min-h-[56px] px-5 rounded-full border-2 border-[#a3b18a] transition-all flex items-center justify-center gap-2 font-bold ${
          isFavorited 
            ? "bg-[#a3b18a] text-white hover:bg-[#8b9973]" 
            : "text-[#5a7d5a] hover:bg-[#a3b18a]/10"
        }`}
        aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      >
        {isFavorited ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#7D1128]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
            Favorite
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 transition-colors">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
            Favorite
          </>
        )}
      </button>
    );
  }

  return (
    <button 
      onClick={toggleFavorite} 
      disabled={isLoading}
  
      className="p-2 rounded-full hover:bg-white/60 transition-all backdrop-blur-sm z-50 relative"
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      {isFavorited ? (

        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#7D1128]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      ) : (
        // Updated to your Medium Gray
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#8a8a8a] hover:text-[#7D1128] transition-colors">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      )}
    </button>
  );
}