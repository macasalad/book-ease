"use client";

import { useState } from "react";

interface Props {
  borrowId: string;
  bookId: string;
  lenderId: string;
  currentDueAt?: string | Date | null;
}

export default function ExtendBorrowModal({
  borrowId,
  bookId,
  lenderId,
  currentDueAt,
}: Props) {
  const [open, setOpen] = useState(false);
  const [returnDate, setReturnDate] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  async function handleExtend() {
    if (!returnDate) {
      alert("Please select a new return date");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/borrow/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          borrowId,
          bookId,
          lenderId,
          returnDate,
          requestType: "EXTEND",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to request extension");
        return;
      }

      alert("Extension request sent!");
      setOpen(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-full bg-[#a3b18a] text-white text-sm font-semibold hover:bg-[#8da074] transition"
      >
        Extend Borrow
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[380px] shadow-xl">
            <h2 className="text-lg font-bold mb-4">Extend Borrow</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Current Due Date</p>
                <p className="font-semibold">
                  {currentDueAt
                    ? new Date(currentDueAt).toLocaleDateString()
                    : "No due date"}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-500">
                  New Return Date
                </label>
                <input
                  type="date"
                  value={returnDate}
                  min={today}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleExtend}
                disabled={loading}
                className={`flex-1 bg-[#bc8a5f] text-white rounded-lg py-2 font-semibold ${
                  loading ? "opacity-50" : "hover:bg-[#a47148]"
                }`}
              >
                {loading ? "Sending..." : "Request Extension"}
              </button>

              <button
                onClick={() => setOpen(false)}
                disabled={loading}
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