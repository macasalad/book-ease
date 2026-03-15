"use client";

import { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

export default function BorrowModal({
  title,
  lender,
  bookId,
}: {
  title: string;
  lender: User;
  bookId: string;
}) {
  const [open, setOpen] = useState(false);
  const [borrowDate, setBorrowDate] = useState(new Date().toISOString().split("T")[0]);
  const [returnDate, setReturnDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleConfirmRequest = async () => {
    if (!returnDate) {
      alert("Please select a return date");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch("../api/borrow/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId,
          lenderId: lender.id,
          borrowDate,
          returnDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create borrow request");
      }

      setOpen(false);
      alert("Borrow request sent successfully!");
      
    } catch (error) {
      console.error("Error creating borrow request:", error);
      alert("Failed to send borrow request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex-1 rounded-full bg-[#bc8a5f] hover:bg-[#a47148] px-6 py-4 text-white font-bold transition-all shadow-lg shadow-[#bc8a5f]/20"
      >
        Request to Borrow
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[420px] shadow-xl">
            <h2 className="text-2xl font-bold mb-6">Borrow Book</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Title</label>
                <p className="font-semibold">{title}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Lender</label>
                <p className="font-semibold">{lender.name}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Borrow Date</label>
                <input
                  type="date"
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                  min={today}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500">Return Date</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={borrowDate}
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleConfirmRequest}
                disabled={isSubmitting}
                className={`flex-1 bg-[#bc8a5f] text-white rounded-lg py-2 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-[#a47148]"
                }`}
              >
                {isSubmitting ? "Sending..." : "Confirm Request"}
              </button>

              <button
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
                className="flex-1 border rounded-lg py-2 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}