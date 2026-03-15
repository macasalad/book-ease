"use client";

import { useState } from "react";

export default function AcceptRejectRequest({
  request,
}: {
  request: {
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: Date;
    returnDate?: Date | null; // Add returnDate at the root level
    borrower: { id: string; name: string; email: string };
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
    <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row gap-4 items-center">
      <div className="w-24 h-32 rounded-lg overflow-hidden border border-gray-200">
        {request.book.photos[0] ? (
          <img
            src={request.book.photos[0]}
            alt={request.book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-100">
            📖
          </div>
        )}
      </div>

      <div className="flex-1">
        <h2 className="text-lg font-bold">{request.book.title}</h2>
        <p className="text-gray-600">
          Borrower: {request.borrower.name}
        </p>
        <p className="text-gray-500 text-sm">
          Requested on: {new Date(request.createdAt).toLocaleDateString()}
        </p>
        
        {request.returnDate && (
          <p className="text-gray-500 text-sm">
            Return Date: {new Date(request.returnDate).toLocaleDateString()}
          </p>
        )}
        
        <p className="mt-2">
          Status:{" "}
          <span
            className={`font-semibold ${
              status === "PENDING"
                ? "text-yellow-600"
                : status === "APPROVED"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {status}
          </span>
        </p>
      </div>

      {status === "PENDING" && (
        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            onClick={() => handleAction("APPROVED")}
            disabled={loading}
            className="px-4 py-2 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700"
          >
            {loading ? "..." : "Accept"}
          </button>
          <button
            onClick={() => handleAction("REJECTED")}
            disabled={loading}
            className="px-4 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700"
          >
            {loading ? "..." : "Reject"}
          </button>
        </div>
      )}
    </div>
  );
}