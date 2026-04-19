"use client";

import { useState } from "react";
import Link from "next/link";

export default function AcceptRejectRequest({
  request,
}: {
  request: {
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: Date;
    returnDate?: Date | null; // Add returnDate at the root level
    borrower: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      customImage?: string | null;
    };
    book: { id: string; title: string; photos: string[] }; // Remove return from here
  };
}) {
  const [status, setStatus] = useState(request.status);
  const [loading, setLoading] = useState(false);

  async function handleAction(action: "APPROVED" | "REJECTED") {
    setLoading(true);

    const res = await fetch(`/api/borrow/${request.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

    setLoading(false);

    if (res.ok) {
      setStatus(action);

      if (action === "APPROVED") {
        window.location.href = `/lending`;
      }
    } else {
      const data = await res.json();
      alert(data.error || "Something went wrong");
    }
  }

  return (
    <div className="bg-white/40 border border-white/60 rounded-[1.5rem] p-5 shadow-lg shadow-stone-200/30 backdrop-blur-md hover:bg-white/60 transition-all flex flex-col sm:flex-row gap-5 items-center relative overflow-hidden">
      
      {/* Book Image */}
      <div className="w-24 h-32 rounded-xl overflow-hidden border border-white/40 shadow-inner bg-[#e2d9c8]/50 shrink-0 flex items-center justify-center">
        {request.book.photos[0] ? (
          <img
            src={request.book.photos[0]}
            alt={request.book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl opacity-50">📖</span>
        )}
      </div>

      <div className="flex-1 w-full sm:w-auto">
        <h2 className="text-lg font-bold text-[#4a4a4a] leading-tight">{request.book.title}</h2>
        
        <div className="mt-2 space-y-0.5">
        <div className="flex items-center gap-2">
  <span className="font-semibold text-[#8a8a8a]">Borrowed by:</span>

  <Link
    href={`/profile/${request.borrower.id}`}
    className="flex items-center gap-2 hover:text-[#bc8a5f] transition-colors"
  >
    <img
      src={
        request.borrower.customImage ||
        request.borrower.image ||
        "/default-avatar.png"
      }
      className="w-6 h-6 rounded-full object-cover border border-white/60"
      alt={request.borrower.name}
    />

    <span className="text-sm font-medium text-[#4a4a4a]">
      {request.borrower.name}
    </span>
  </Link>
</div>
          <p className="text-xs text-[#8a8a8a]">
            <span className="font-semibold">Requested:</span> {new Date(request.createdAt).toLocaleDateString()}
          </p>
          {request.returnDate && (
            <p className="text-xs text-[#8a8a8a]">
              <span className="font-semibold text-[#bc8a5f]">Return by:</span> {new Date(request.returnDate).toLocaleDateString()}
            </p>
          )}
        </div>
        
        <div className="mt-3">
          <span
            className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
              status === "PENDING"
                ? "bg-[#bc8a5f]/10 text-[#bc8a5f] border-[#bc8a5f]/20"
                : status === "APPROVED"
                ? "bg-[#a3b18a]/20 text-[#5a7d5a] border-[#a3b18a]/30"
                : "bg-[#7D1128]/10 text-[#7D1128] border-[#7D1128]/30"
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {status === "PENDING" && (
        <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
          <button
            onClick={() => handleAction("APPROVED")}
            disabled={loading}
            className="flex-1 sm:flex-none px-6 py-2 bg-[#a3b18a] hover:bg-[#8da074] text-white text-sm font-bold rounded-full transition-all shadow-md shadow-[#a3b18a]/20 disabled:opacity-50"
          >
            {loading ? "..." : "Accept"}
          </button>
          <button
            onClick={() => handleAction("REJECTED")}
            disabled={loading}
            className="flex-1 sm:flex-none px-6 py-2 bg-[#b85c5c] text-white text-sm font-bold rounded-full transition-all hover:bg-[#a24f4f] disabled:opacity-50"
          >
            {loading ? "..." : "Reject"}
          </button>
        </div>
      )}
    </div>
  );
}