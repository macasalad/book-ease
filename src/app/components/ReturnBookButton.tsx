// components/ReturnBookButton.tsx
"use client";

import { useState } from "react";

export default function ReturnBookButton({ 
  borrowId, 
  bookId 
}: { 
  borrowId: string; 
  bookId: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleReturn() {
    if (!confirm("Are you sure you want to return this book?")) return;
    
    setLoading(true);
    
    try {
      const res = await fetch("/api/borrow/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ borrowId, bookId }),
      });

      if (res.ok) {
        // Refresh the page to show updated status
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to return book");
      }
    } catch (error) {
      console.error("Error returning book:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleReturn}
      disabled={loading}
      className="px-4 py-2 rounded-full bg-[#bc8a5f] text-white text-sm font-semibold hover:bg-[#8da074] transition"
    >
      {loading ? "Processing..." : "Return Book"}
    </button>
  );
}